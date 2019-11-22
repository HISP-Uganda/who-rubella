import {
    pullOrganisationUnits,
    searchPosts,
    mrDataValues,
    findType,
    getCOC,
    opvDataValues,
    mapEventData,
    truncateString,
    getAxios,
    getDHIS2Url,
    getManagementUrl,
    postAxios,
    processDataSetResponses,
    getManagementAxios
} from './data-utils';
import { Client } from '@elastic/elasticsearch';
import moment from 'moment';
import { generateUid } from './uid';
import winston from './winston';
import { isArray, flatten, keys, groupBy, fromPairs, uniq, union, unionBy, differenceBy, uniqBy } from 'lodash';
const client = new Client({ node: 'http://localhost:9200' });

const openingDate = moment().subtract(1, 'years').format();

export const routes = (app, io) => {

    app.post('/', async (req, res) => {
        let response = {};
        const baseUrl = getDHIS2Url();
        let payload = req.body
        if (!isArray(payload)) {
            payload = [payload];
        }

        let newSubCounties = [];
        let newPosts = [];
        let allPosts = [];

        const one = String(payload[0].districts).split('_').join(' ').replace(/\\n/g, '').trim();
        const district = await pullOrganisationUnits(3, one);

        if (district && district.length === 1) {
            const d = district[0];
            const processed = payload.map(({ list, _id, _version, ...p }) => {
                p = {
                    ...p,
                    districts: d.id,
                    region: d.parent.id,
                    date_of_results: moment(p.date_of_results).format('YYYYMMDD'),
                    day_of_results: getCOC(p.day_of_results),
                    subcounty: String(p.subcounty).split('_').join(' ').replace(/\\n/g, '').trim()
                }

                if (p.subcounty === 'OTHERS') {
                    p = { ...p, subcounty: String(p.other_subcountyvisited).split('_').join(' ').replace(/\\n/g, '').trim() }
                }
                const s = d.children.find(dist => {
                    return String(dist.name).toLowerCase() === String(p.subcounty).toLowerCase()
                });

                let posts = [];

                let subId;

                if (s) {
                    subId = s.id;
                    posts = s.children;
                } else {
                    const searchedInNew = newSubCounties.find(n => String(n.name).toLowerCase() === String(p.subcounty).toLowerCase());
                    if (searchedInNew) {
                        subId = searchedInNew.id
                    } else {
                        subId = generateUid();
                        const ou = { shortName: truncateString(p.subcounty, 46), name: p.subcounty, id: subId, parent: { id: d.id }, openingDate };
                        newSubCounties = [...newSubCounties, ou];
                    }
                }

                p = { ...p, subcounty: subId }

                if (isArray(list)) {

                    list = list.map(l => {
                        let post = l['list/name_of_post'] || l['list/name_of_post_visited'];
                        post = String(post).split('_').join(' ').replace(/\\n/g, '').trim();

                        const y35 = parseInt(l['list/children_vaccinated/years3_5'], 10) || 0;
                        const y614 = parseInt(l['list/children_vaccinated/years6_14'], 10) || 0;
                        const y911 = parseInt(l['list/children_vaccinated/months9_11'], 10) || 0;
                        const y1224 = parseInt(l['list/children_vaccinated/months12_24'], 10) || 0;
                        const total = y35 + y614 + y911 + y1224;

                        const partialUse = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_partial_use'], 10) || 0;
                        const contamination = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_contamination'], 10) || 0;
                        const otherFactors = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_other_factors'], 10) || 0;
                        const colorChange = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'], 10) || 0;
                        const unopen = parseInt(l['list/mr_vaccine_usage/no_vaccine_vials_returned_unopened'], 10) || 0;
                        const diluent_returned_unopened = parseInt(l['list/mr_vaccine_usage/no_diluent_ampules_returned_unopened'], 10) || 0;
                        const diluent_issued = parseInt(l['list/mr_vaccine_usage/no_diluent_ampules_issued'], 10) || 0
                        const discarded = partialUse + contamination + otherFactors + colorChange;

                        const searchedPost = posts.find(ps => String(ps.name).toLowerCase() === post.toLowerCase() && ps.parent.id === s.id);
                        let postId

                        if (searchedPost) {
                            postId = searchedPost.id
                            allPosts = [...allPosts, { id: postId }]

                        } else {
                            const searchedNewPost = newPosts.find(p => String(p.name).toLowerCase() === post.toLowerCase() && p.parent.id === subId);
                            if (searchedNewPost) {
                                postId = searchedNewPost.id
                            } else {
                                postId = generateUid();
                                const ou = { shortName: truncateString(post, 46), name: post, id: postId, parent: { id: subId }, openingDate };
                                newPosts = [...newPosts, ou]
                            }
                            allPosts = [...allPosts, { id: postId }];
                        }

                        return {
                            ...l,
                            ...p,
                            ['list/name_of_post']: postId,
                            ['list/children_vaccinated/total']: total,
                            ['list/mr_vaccine_usage/no_vials_discarded']: discarded,
                            ['list/mr_vaccine_usage/no_vials_discarded_due_partial_use']: partialUse,
                            ['list/mr_vaccine_usage/no_vials_discarded_due_contamination']: contamination,
                            ['list/mr_vaccine_usage/no_vials_discarded_other_factors']: otherFactors,
                            ['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change']: colorChange,
                            ['list/children_vaccinated/months12_24']: y35,
                            ['list/children_vaccinated/years6_14']: y614,
                            ['list/children_vaccinated/months9_11']: y911,
                            ['list/children_vaccinated/months12_24']: y1224,
                            ['list/mr_vaccine_usage/no_vaccine_vials_returned_unopened']: unopen,
                            ['list/mr_vaccine_usage/no_diluent_ampules_returned_unopened']: diluent_returned_unopened,
                            ['list/mr_vaccine_usage/no_diluent_ampules_issued']: diluent_issued
                        }
                    });
                    return list;
                }
                return [];
            });

            if (newSubCounties.length > 0) {
                await postAxios(`${baseUrl}/metadata`, { organisationUnits: newSubCounties });
            }

            if (newPosts.length > 0) {
                await postAxios(`${baseUrl}/metadata`, { organisationUnits: newPosts });

            }
            let { data: { dataSets } } = await getAxios(`${baseUrl}/metadata.json`, { dataSets: true });

            dataSets.map(dataSet => {
                dataSet.organisationUnits = uniqBy([...dataSet.organisationUnits, ...allPosts], 'id');
                return dataSet
            });
            const r = await postAxios(`${baseUrl}/metadata`, { dataSets });

            response = processDataSetResponses(r)

            const allData = flatten(processed);
            await mrDataValues(allData);
            const body = allData.flatMap(doc => [{ index: { _index: 'rubella' } }, doc]);
            const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            // response = bulkResponse
            io.emit('data', { message: 'data has come' });
        }
        return res.status(201).send(response);
    });

    app.post('/opv', async (req, res) => {

        let response = {};
        const baseUrl = getDHIS2Url();
        let payload = req.body
        if (!isArray(payload)) {
            payload = [payload];
        }

        let newSubCounties = [];
        let newPosts = [];
        let allPosts = [];

        const one = String(payload[0].districts).split('_').join(' ').replace(/\\n/g, '').trim();
        const district = await pullOrganisationUnits(3, one);

        if (district && district.length === 1) {
            const d = district[0];
            const processed = payload.map(({ list, _id, _version, ...p }) => {
                p = {
                    ...p,
                    districts: d.id,
                    region: d.parent.id,
                    date_of_results: moment(p.date_of_results).format('YYYYMMDD'),
                    day_of_results: getCOC(p.day_of_results),
                    subcounty: String(p.subcounty).split('_').join(' ').replace(/\\n/g, '').trim()
                }

                if (p.subcounty === 'OTHERS') {
                    p = { ...p, subcounty: p.other_subcountyvisited }
                }
                const s = d.children.find(dist => {
                    return String(dist.name).toLowerCase() === String(p.subcounty).split('_').join(' ').replace(/\\n/g, '').trim().toLowerCase()
                });

                let posts = [];

                let subId;

                if (s) {
                    subId = s.id;
                    posts = s.children;
                } else {
                    const searchedInNew = newSubCounties.find(n => String(n.name).toLowerCase() === String(p.subcounty).toLowerCase());
                    if (searchedInNew) {
                        subId = searchedInNew.id
                    } else {
                        subId = generateUid();
                        const ou = { shortName: truncateString(p.subcounty, 46), name: p.subcounty, id: subId, parent: { id: d.id }, openingDate };
                        newSubCounties = [...newSubCounties, ou];
                    }
                }

                p = { ...p, subcounty: subId }

                if (isArray(list)) {

                    list = list.map(l => {

                        const partialUse = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use'], 10) || 0;
                        const contamination = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_due_contamination'], 10) || 0;
                        const otheFactors = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_other_factors'], 10) || 0;
                        const colorChange = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change'], 10) || 0;

                        const target_population = parseInt(l["list/target_population"], 10) || 0;
                        const no_vaccine_vials_issued = parseInt(l["list/no_vaccine_vials_issued"], 10) || 0;
                        const chd_registered_months0_59 = parseInt(l["list/chd_registered_months0_59"], 10) || 0;
                        const months0_59 = parseInt(l["list/children_immunised/months0_59"], 10) || 0;
                        const number_mobilizers = parseInt(l["list/post_staffing/number_mobilizers"], 10) || 0;
                        const no_vaccine_vials_returned_unopened = parseInt(l["list/no_vaccine_vials_returned_unopened"], 10) || 0;
                        const number_health_workers = parseInt(l["list/post_staffing/number_health_workers"], 10) || 0;
                        const first_ever_zero_dose = parseInt(l["list/children_immunised/first_ever_zero_dose"], 10) || 0;
                        const discarded = partialUse + contamination + otherFactors + colorChange;
                        post = String(post).split('_').join(' ').replace(/\\n/g, '').trim();

                        const searchedPost = posts.find(ps => String(ps.name).toLowerCase() === post.toLowerCase() && ps.parent.id === s.id);
                        let postId

                        if (searchedPost) {
                            postId = searchedPost.id
                            allPosts = [...allPosts, { id: postId }]

                        } else {
                            const searchedNewPost = newPosts.find(p => String(p.name).toLowerCase() === post.toLowerCase() && p.parent.id === subId);
                            if (searchedNewPost) {
                                postId = searchedNewPost.id
                            } else {
                                postId = generateUid();
                                const ou = { shortName: truncateString(post, 46), name: post, id: postId, parent: { id: subId }, openingDate };
                                newPosts = [...newPosts, ou]
                            }
                            allPosts = [...allPosts, { id: postId }];
                        }

                        return {
                            ...l,
                            ...p,
                            ['list/name_of_post']: postId,
                            ["list/target_population"]: target_population,
                            ["list/no_vaccine_vials_issued"]: no_vaccine_vials_issued,
                            ["list/chd_registered_months0_59"]: chd_registered_months0_59,
                            ["list/children_immunised/months0_59"]: months0_59,
                            ["list/post_staffing/number_mobilizers"]: number_mobilizers,
                            ["list/no_vaccine_vials_returned_unopened"]: no_vaccine_vials_returned_unopened,
                            ["list/post_staffing/number_health_workers"]: number_health_workers,
                            ["list/children_immunised/first_ever_zero_dose"]: first_ever_zero_dose,
                            ['list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use']: partialUse,
                            ['list/no.vials_discarded_due_to/no_vials_discarded_due_contamination']: contamination,
                            ['list/no.vials_discarded_due_to/no_vials_discarded_other_factors']: otheFactors,
                            ['list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change']: colorChange,
                        }
                    });
                    return list;
                }
                return [];
            });

            if (newSubCounties.length > 0) {
                console.log(newSubCounties.length)
                await postAxios(`${baseUrl}/metadata`, { organisationUnits: newSubCounties });
            }
            if (newPosts.length > 0) {
                console.log(newPosts.length);
                await postAxios(`${baseUrl}/metadata`, { organisationUnits: newPosts });

            }
            let { data: { dataSets } } = await getAxios(`${baseUrl}/metadata.json`, { dataSets: true });

            dataSets.map(dataSet => {
                dataSet.organisationUnits = uniqBy([...dataSet.organisationUnits, ...allPosts], 'id');
                return dataSet
            });
            const r = await postAxios(`${baseUrl}/metadata`, { dataSets });
            response = processDataSetResponses(r)
            const allData = flatten(processed);
            await opvDataValues(allData);
            const body = allData.flatMap(doc => [{ index: { _index: 'opv' } }, doc]);
            const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            io.emit('data', { message: 'data has come' });
        }
        return res.status(201).send(response);
    });


    app.post('/checklist', async (req, res) => {

        let response = {};
        const baseUrl = getDHIS2Url();
        let payload = req.body
        if (!isArray(payload)) {
            payload = [payload];
        }

        let newSubCounties = [];
        let newPosts = [];
        let allPosts = [];

        const one = String(payload[0].districts).split('_').join(' ').replace(/\\n/g, '').trim();
        const district = await pullOrganisationUnits(3, one);



        if (district && district.length === 1) {
            const d = district[0];
            const processed = payload.map(({ list, _id, _version, ...p }) => {
                p = {
                    ...p,
                    districts: d.id,
                    region: d.parent.id,
                    date_of_results: moment(p.date_of_results).format('YYYYMMDD'),
                    day_of_results: getCOC(p.day_of_results),
                    subcounty: String(p.subcounty).split('_').join(' ').replace(/\\n/g, '').trim()
                }

                if (p.subcounty === 'OTHERS') {
                    p = { ...p, subcounty: String(p.other_subcountyvisited).split('_').join(' ').replace(/\\n/g, '').trim() }
                }
                const s = d.children.find(dist => {
                    return String(dist.name).toLowerCase() === String(p.subcounty).toLowerCase()
                });

                let posts = [];

                let subId;

                if (s) {
                    subId = s.id;
                    posts = s.children;
                } else {
                    const searchedInNew = newSubCounties.find(n => String(n.name).toLowerCase() === String(p.subcounty).toLowerCase());
                    if (searchedInNew) {
                        subId = searchedInNew.id
                    } else {
                        subId = generateUid();
                        const ou = { shortName: truncateString(p.subcounty, 46), name: p.subcounty, id: subId, parent: { id: d.id }, openingDate };
                        newSubCounties = [...newSubCounties, ou];
                    }
                }

                p = { ...p, subcounty: subId }

                const searchedPost = posts.find(ps => String(ps.name).toLowerCase() === String(p.vaccination_post_location).toLowerCase() && ps.parent.id === s.id);
                let postId

                if (searchedPost) {
                    postId = searchedPost.id
                    allPosts = [...allPosts, { id: postId }]

                } else {
                    const searchedNewPost = newPosts.find(p => String(p.name).toLowerCase() === String(p.vaccination_post_location).toLowerCase() && p.parent.id === subId);
                    if (searchedNewPost) {
                        postId = searchedNewPost.id
                    } else {
                        postId = generateUid();
                        const ou = { shortName: truncateString(String(p.vaccination_post_location), 46), name: String(p.vaccination_post_location), id: postId, parent: { id: subId }, openingDate };
                        newPosts = [...newPosts, ou]
                    }
                    allPosts = [...allPosts, { id: postId }];
                }

                p = { ...p, vaccination_post_location: postId };

                return p

            });

            if (newSubCounties.length > 0) {
                await postAxios(`${baseUrl}/metadata`, { organisationUnits: newSubCounties });
            }

            if (newPosts.length > 0) {
                await postAxios(`${baseUrl}/metadata`, { organisationUnits: newPosts });

            }
            let { data: { programs } } = await getAxios(`${baseUrl}/metadata.json`, { programs: true });


            programs.map(program => {
                program.organisationUnits = uniqBy([...program.organisationUnits, ...allPosts], 'id');
                return program
            });
            const r = await postAxios(`${baseUrl}/metadata`, { programs });

            await mapEventData(processed);

            // const body = processed.flatMap(doc => [{ index: { _index: 'checklist' } }, doc]);
            // const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            // response = bulkResponse
            // io.emit('data', { message: 'data has come' });
            return res.status(201).send(response);
        }
    });

    app.get('/', async (req, res) => {
        let bod = {}
        const q = findType(req.query.type);
        const calculations = {
            target_population: { sum: { field: 'list/target_population' } },
            number_mobilizers: { sum: { field: 'list/post_staffing/number_mobilizers' } },
            number_health_workers: { sum: { field: 'list/post_staffing/number_health_workers' } },
            no_vaccine_vials_issued: { sum: { field: 'list/mr_vaccine_usage/no_vaccine_vials_issued' } },
            no_diluent_ampules_issued: { sum: { field: 'list/mr_vaccine_usage/no_diluent_ampules_issued' } },
            no_vials_discarded_other_factors: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded_other_factors' } },
            no_vaccine_vials_returned_unopened: { sum: { field: 'list/mr_vaccine_usage/no_vaccine_vials_returned_unopened' } },
            no_vials_discarded_due_partial_use: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded_due_partial_use' } },
            // no_diluent_ampules_returned_unopened: { sum: { field: 'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened' } },
            no_vials_discarded_due_contamination: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded_due_contamination' } },
            no_vials_discarded_due_vvm_color_change: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change' } },
            children_vaccinated: { sum: { field: 'list/children_vaccinated/total' } },
            no_vials_discarded: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded' } },
            posts: { cardinality: { field: 'list/name_of_post.keyword' } }
        }

        const summary = {
            terms: {
                field: `${q.disaggregation}.keyword`,
                size: 10000
            },
            aggs: calculations

        }

        let single = {
            filter: {
                match_all: {}
            },
            aggs: calculations
        }

        let overall = {
            terms: {
                field: 'day_of_results.keyword',
                size: 10000
            },
            aggs: calculations
        }

        const data = {
            terms: {
                field: `${q.disaggregation}.keyword`,
                size: 10000
            },
            aggs: {
                days: {
                    terms: {
                        field: 'day_of_results.keyword',
                        size: 10000
                    },
                    aggs: calculations
                }
            }
        }

        const dailyData = {
            terms: {
                field: 'day_of_results.keyword',
                size: 10000
            },
            aggs: {
                days: {
                    terms: {
                        field: `${q.disaggregation}.keyword`,
                        size: 10000
                    },
                    aggs: calculations
                }
            }
        }

        let final = {
            size: 0,
            aggs: {
                data,
                summary,
                overall,
                single,
                dailyData
            }
        }
        if (q.search && req.query.search) {
            final = {
                ...final,
                query: {
                    match: {
                        [q.search]: {
                            query: req.query.search
                        }
                    }
                }
            }
        }
        try {
            const { body } = await client.search({
                "index": 'rubella',
                body: final
            });
            bod = body;
        } catch (error) {
            console.log(error);
        }
        return res.status(200).send(bod);
    });


    app.get('/opv', async (req, res) => {
        let bod = {}
        const q = findType(req.query.type);
        const calculations = {
            target_population: { sum: { field: 'list/target_population' } },
            number_mobilizers: { sum: { field: 'list/post_staffing/number_mobilizers' } },
            number_health_workers: { sum: { field: 'list/post_staffing/number_health_workers' } },
            no_vaccine_vials_issued: { sum: { field: 'list/no_vaccine_vials_issued' } },
            chd_registered: { sum: { field: 'list/chd_registered_months0_59' } },
            children_vaccinated: { sum: { field: 'list/children_immunised/months0_59' } },
            no_vaccine_vials_returned_unopened: { sum: { field: 'list/no_vaccine_vials_returned_unopened' } },
            no_vials_discarded_due_contamination: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_due_contamination' } },
            no_vials_discarded_due_vvm_color_change: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change' } },
            no_vials_discarded_other_factors: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_other_factors' } },
            no_vials_discarded_due_partial_use: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use' } },
            no_vials_discarded: { sum: { field: 'list/no.vials_discarded' } },
            posts: { cardinality: { field: 'list/name_of_post.keyword' } }
        }
        const summary = {
            terms: {
                field: `${q.disaggregation}.keyword`
            },
            aggs: calculations
        }

        let single = {
            filter: {
                match_all: {}
            },
            aggs: calculations
        }

        let overall = {
            terms: {
                field: 'day_of_results.keyword'
            },
            aggs: calculations
        }

        const data = {
            terms: {
                field: `${q.disaggregation}.keyword`
            },
            aggs: {
                days: {
                    terms: {
                        field: 'day_of_results.keyword'
                    },
                    aggs: calculations
                }
            }
        }

        let final = {
            size: 0,
            aggs: {
                data,
                summary,
                single,
                overall
            }
        }
        if (q.search && req.query.search) {
            final = {
                ...final,
                query: {
                    match: {
                        [q.search]: {
                            query: req.query.search
                        }
                    }
                }
            }
        }
        try {
            const { body } = await client.search({
                "index": 'opv',
                body: final
            });
            bod = body;
        } catch (error) {
            winston.log('error', error.message);

        }
        return res.status(200).send(bod);

    });

    app.get('/checklist', async (req, res) => {
        let bod = {}
        const q = findType(req.query.type);

        const calculations = {
            posts: { cardinality: { field: 'safety_boxes_filled_more_than_three_quarters' } },
            testers: { count: { field: 'no_reconstitution_syringes_equals_no_mr_vaccines_vials' } }
        }

        let single = {
            filter: {
                match_all: {}
            },
            aggs: calculations
        }

        let final = {
            size: 0,
            aggs: {
                single
            }
        }
        if (q.search && req.query.search) {
            final = {
                ...final,
                query: {
                    match: {
                        [q.search]: {
                            query: req.query.search
                        }
                    }
                }
            }
        }
        try {
            const { body } = await client.search({
                "index": 'checklist',
                body: final
            });
            bod = body;
        } catch (error) {
            winston.log('error', error.message);

        }
        return res.status(200).send(bod);

    });


    app.get('/uganda', async (req, res) => {
        const q = req.query.search;
        const uganda_subcounties = require(`./defaults/uganda_subcounties.json`);
        const soroti = uganda_subcounties.features.filter(u => {
            return u['properties']['parent'] === q
        })
        return res.status(200).send({ ...uganda_subcounties, features: soroti });
    });

    app.get('/regions', async (req, res) => {
        const q = req.query.search
        const uganda_districts = require(`./defaults/uganda_districts.json`);
        const soroti = uganda_districts.features.filter(u => {
            return u['properties']['parent'] === q
        })
        return res.status(200).send({ ...uganda_districts, features: soroti });
    });

    app.get('/country', async (req, res) => {
        const uganda_districts = require(`./defaults/uganda_districts.json`);
        return res.status(200).send(uganda_districts);
    });

    app.get('/targets', async (req, res) => {
        const targets = require(`./defaults/targets.json`);
        const sum = targets.reduce((a, b) => {
            a = {
                Population: a.Population + b.Population,
                MRTargetPopulation: a.MRTargetPopulation + b.MRTargetPopulation,
                OPVTargetPopulation: a.OPVTargetPopulation + b.OPVTargetPopulation,
                SubCounties: a.SubCounties + b.SubCounties,
                Posts: a.Posts + b.Posts,
                TownCouncils: isNaN(parseInt(a.TownCouncils, 10)) ? 0 : parseInt(a.TownCouncils, 10) + b.TownCouncils,
                Schools: a.Schools + b.Schools,
            }
            return a
        }, {
            Population: 0,
            MRTargetPopulation: 0,
            OPVTargetPopulation: 0,
            SubCounties: 0,
            Posts: 0,
            TownCouncils: 0,
            Schools: 0
        });


        const grouped = groupBy(targets, 'parent');
        const final = keys(grouped).map(k => {
            const current = grouped[k];
            const sum = current.reduce((a, b) => {
                a = {
                    Population: a.Population + b.Population,
                    MRTargetPopulation: a.MRTargetPopulation + b.MRTargetPopulation,
                    OPVTargetPopulation: a.OPVTargetPopulation + b.OPVTargetPopulation,
                    SubCounties: a.SubCounties + b.SubCounties,
                    Posts: a.Posts + b.Posts,
                    TownCouncils: isNaN(parseInt(a.TownCouncils, 10)) ? 0 : parseInt(a.TownCouncils, 10) + b.TownCouncils,
                    Schools: a.Schools + b.Schools,
                }
                return a
            }, {
                Population: 0,
                MRTargetPopulation: 0,
                OPVTargetPopulation: 0,
                SubCounties: 0,
                Posts: 0,
                TownCouncils: 0,
                Schools: 0
            });

            return [k, sum]
        });

        const allDistricts = targets.map(a => {
            return [a.id, {
                Population: a.Population,
                MRTargetPopulation: a.MRTargetPopulation,
                OPVTargetPopulation: a.OPVTargetPopulation,
                SubCounties: a.SubCounties,
                Posts: a.Posts,
                TownCouncils: parseInt(a.TownCouncils, 10),
                Schools: a.Schools,
            }]
        })


        return res.status(200).send({ region: sum, regional: fromPairs(final), districts: fromPairs(allDistricts) });
    });

    app.get('/regionalTargets', (req, res) => {
        const q = req.query.search;
        const targets = require(`./defaults/targets.json`);
        const byRegion = targets.filter(u => {
            return u.parent === q
        });


        const allDistricts = byRegion.map(a => {
            return [a.id, {
                Population: a.Population,
                MRTargetPopulation: a.MRTargetPopulation,
                OPVTargetPopulation: a.OPVTargetPopulation,
                SubCounties: a.SubCounties,
                Posts: a.Posts,
                TownCouncils: parseInt(a.TownCouncils, 10),
                Schools: a.Schools,
            }]
        });

        const region = byRegion.reduce((a, b) => {
            a = {
                Population: a.Population + b.Population,
                MRTargetPopulation: a.MRTargetPopulation + b.MRTargetPopulation,
                OPVTargetPopulation: a.OPVTargetPopulation + b.OPVTargetPopulation,
                SubCounties: a.SubCounties + b.SubCounties,
                Posts: a.Posts + b.Posts,
                TownCouncils: isNaN(parseInt(a.TownCouncils, 10)) ? 0 : parseInt(a.TownCouncils, 10) + b.TownCouncils,
                Schools: a.Schools + b.Schools,
            }
            return a
        }, {
            Population: 0,
            MRTargetPopulation: 0,
            OPVTargetPopulation: 0,
            SubCounties: 0,
            Posts: 0,
            TownCouncils: 0,
            Schools: 0
        });

        return res.status(200).send({ region, districts: fromPairs(allDistricts) });
    });


    app.get('/districtTargets', async (req, res) => {
        const q = req.query.search;
        const targets = require(`./defaults/targets.json`);
        const district = targets.filter(u => {
            return u.id === q
        });

        if (district.length > 0) {
            return res.status(200).send({
                district: district[0],
                subCounties: {
                    Population: 0,
                    MRTargetPopulation: 0,
                    OPVTargetPopulation: 0,
                    SubCounties: 0,
                    Posts: 0,
                    TownCouncils: 0,
                    Schools: 0
                }
            });
        }
        return res.status(200).send({
            district: {
                Population: 0,
                MRTargetPopulation: 0,
                OPVTargetPopulation: 0,
                SubCounties: 0,
                Posts: 0,
                TownCouncils: 0,
                Schools: 0
            },
            subCounties: {
                Population: 0,
                MRTargetPopulation: 0,
                OPVTargetPopulation: 0,
                SubCounties: 0,
                Posts: 0,
                TownCouncils: 0,
                Schools: 0
            }
        });
    });

    app.get('/management', async (req, res) => {
        const indicator = req.query.indicator;
        const period = req.query.period;
        const orgUnit = req.query.orgUnit;

        const baseUrl = getManagementUrl();

        try {
            const { data } = await getManagementAxios(`${baseUrl}/analytics.json?dimension=dx:IN_GROUP-${indicator}&dimension=pe:${period}&dimension=ou:${orgUnit}&includeNumDen=true`);
            // const { data: filtered } = await getManagementAxios(`${baseUrl}/analytics.json?dimension=dx:IN_GROUP-${indicator}&filter=pe:${period}&dimension=ou:${orgUnit}&includeNumDen=true`);
            return res.status(200).send(data);
        } catch (e) {
            console.log(e);

            return res.status(200).send({ 'error': 'It has failed' });
        }

    });

};