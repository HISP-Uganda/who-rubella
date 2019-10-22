import { pullOrganisationUnits, searchPosts, mrDataValues, findType, getCOC, opvDataValues, mapEventData } from './data-utils';
import { Client } from '@elastic/elasticsearch';
import moment from 'moment';
import { generateUid } from './uid';
import winston from './winston';
import { isArray, flatten, keys, groupBy, fromPairs } from 'lodash';
const uganda_subcounties = require(`./defaults/uganda_subcounties.json`);
const uganda_districts = require(`./defaults/uganda_districts.json`);
const targets = require(`./defaults/targets.json`);
const client = new Client({ node: 'http://213.136.94.124:9200' });
// const client = new Client({ node: 'http://localhost:9200' });


// client.transport.request({
//     method: "POST",
//     path: "/_sql",
//     body: {
//         query: `SELECT region,subcounty, "list/name_of_post" FROM "mr-rubella" WHERE MATCH(region, 'vmOucp1oIW4')`
//     }
// }, function (error, response) {
//     if (error) {
//         console.log(JSON.stringify(error))
//         console.error('something does not compute');
//     } else {
//         const { body: { columns, rows } } = response
//         console.log(rows);
//         // console.log("The answer is " + JSON.stringify(response) + ".");
//     }
// });

export const routes = (app, io) => {
    app.post('/', async (req, res) => {
        let response = {};
        // try {
        let { list, date_of_results, day_of_results, _version, ...rest } = req.body;
        let ous = {};
        let processedList = [];
        let { subcounty, districts, region, other_subcountyvisited } = rest;
        subcounty = subcounty.split('_').join(' ');
        if (subcounty === 'OTHERS') {
            subcounty = String(other_subcountyvisited).split('_').join(' ');
        }
        districts = districts.split('_').join(' ');
        region = region.split('_').join(' ');
        const district = await pullOrganisationUnits(3, districts);
        day_of_results = getCOC(day_of_results);
        if (district && district.length === 1) {
            districts = district[0].id
            region = district[0].parent.id;
            const subCounties = district[0].children;
            const searchedSubCounty = subCounties.filter(s => {
                return String(s.name).toLowerCase().includes(String(subcounty).toLowerCase());
            });
            let subCounty;
            const posts = list.map(l => {
                const p = l['list/name_of_post'] || l['list/name_of_post_visited']
                const post = String(p).replace(/\\n/g, '').trim();
                return post;
            });
            if (searchedSubCounty.length === 1) {
                subCounty = searchedSubCounty[0];
                subcounty = subCounty.id;
                ous = await searchPosts(subCounty, posts);
            } else if (searchedSubCounty.length === 0) {
                const id = generateUid();
                ous = await searchPosts({ name: subcounty, id }, posts, districts, true);
                subcounty = id;
            }

            await mrDataValues(list, ous, moment(date_of_results).format('YYYYMMDD'), day_of_results);

            for (const l of list) {

                const y35 = parseInt(l['list/children_vaccinated/years3_5'], 10);
                const y614 = parseInt(l['list/children_vaccinated/years6_14'], 10);
                const y911 = parseInt(l['list/children_vaccinated/months9_11'], 10);
                const y1224 = parseInt(l['list/children_vaccinated/months12_24'], 10);
                const total = y35 + y614 + y911 + y1224;

                const partialUse = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_partial_use'], 10);
                const contamination = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_contamination'], 10);
                const otheFactors = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_other_factors'], 10);
                const colorChange = parseInt(l['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'], 10);
                const unopen = parseInt(l['list/mr_vaccine_usage/no_vaccine_vials_returned_unopened'], 10);

                const discarded = partialUse + contamination + otheFactors + colorChange;
                const original = l['list/name_of_post'];
                const post = String(original).split('_').join(' ').toLowerCase();

                processedList = [...processedList, {
                    ...l,
                    ['list/children_vaccinated/total']: isNaN(parseInt(total)) ? 0 : total,
                    ['list/mr_vaccine_usage/no_vials_discarded']: isNaN(parseInt(discarded, 10)) ? 0 : discarded,
                    ['list/name_of_post']: ous[post] ? ous[post] : original,
                    ['list/mr_vaccine_usage/no_vials_discarded_due_partial_use']: isNaN(partialUse) ? 0 : partialUse,
                    ['list/mr_vaccine_usage/no_vials_discarded_due_contamination']: isNaN(contamination) ? 0 : contamination,
                    ['list/mr_vaccine_usage/no_vials_discarded_other_factors']: isNaN(otheFactors) ? 0 : otheFactors,
                    ['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change']: isNaN(colorChange) ? 0 : colorChange,
                    ['list/children_vaccinated/months12_24']: isNaN(y35) ? 0 : y35,
                    ['list/children_vaccinated/years6_14']: isNaN(y614) ? 0 : y614,
                    ['list/children_vaccinated/months9_11']: isNaN(y911) ? 0 : y911,
                    ['list/children_vaccinated/months12_24']: isNaN(y1224) ? 0 : y1224,
                    ['list/mr_vaccine_usage/no_vaccine_vials_returned_unopened']: isNaN(unopen) ? 0 : unopen,
                    ...rest,
                    subcounty,
                    districts,
                    region,
                    date_of_results,
                    day_of_results
                }]
            }
            const body = processedList.flatMap(({ _id, ...doc }) => [{ update: { _index: 'rubella', _id } }, { doc, doc_as_upsert: true }]);
            const { body: bulkResponse } = await client.bulk({ refresh: true, body });
            // io.emit('data', { message: 'data has come' });
            response = bulkResponse;
        }
        // } catch (e) {
        //     winston.log('error', e.message);
        //     response = { message: e.message }
        // }
        return res.status(201).send(response);
    });

    app.post('/opv', async (req, res) => {
        let response = {};
        // try {
        let { list, date_of_results, day_of_results, _version, ...rest } = req.body;
        let ous = {};
        let processedList = [];
        let { subcounty, districts, region, other_subcountyvisited } = rest;
        subcounty = subcounty.split('_').join(' ');
        if (subcounty === 'OTHERS') {
            subcounty = String(other_subcountyvisited).split('_').join(' ');
        }
        districts = districts.split('_').join(' ');
        region = region.split('_').join(' ');
        const district = await pullOrganisationUnits(3, districts);
        day_of_results = getCOC(day_of_results);
        if (district && district.length === 1) {
            districts = district[0].id
            region = district[0].parent.id;
            const subCounties = district[0].children;
            const searchedSubCounty = subCounties.filter(s => {
                return String(s.name).toLowerCase().includes(String(subcounty).toLowerCase());
            });
            if (searchedSubCounty.length === 1) {
                const subCounty = searchedSubCounty[0]
                subcounty = subCounty.id;
                const posts = list.map(l => {
                    const p = l['list/name_of_post'] || l['list/name_of_post_visited']
                    const post = String(p).replace(/\\n/g, '').trim();
                    return post;
                });

                ous = await searchPosts(subCounty, posts);
                await opvDataValues(list, ous, moment(date_of_results).format('YYYYMMDD'), day_of_results);

                for (const l of list) {

                    const partialUse = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use'], 10);
                    const contamination = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_due_contamination'], 10);
                    const otheFactors = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_other_factors'], 10);
                    const colorChange = parseInt(l['list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change'], 10);


                    const target_population = parseInt(l["list/target_population"], 10)
                    const no_vaccine_vials_issued = parseInt(l["list/no_vaccine_vials_issued"], 10)
                    const chd_registered_months0_59 = parseInt(l["list/chd_registered_months0_59"], 10)
                    const months0_59 = parseInt(l["list/children_immunised/months0_59"], 10)
                    const number_mobilizers = parseInt(l["list/post_staffing/number_mobilizers"], 10)
                    const no_vaccine_vials_returned_unopened = parseInt(l["list/no_vaccine_vials_returned_unopened"], 10)
                    const number_health_workers = parseInt(l["list/post_staffing/number_health_workers"], 10)
                    const first_ever_zero_dose = parseInt(l["list/children_immunised/first_ever_zero_dose"], 10)

                    const original = l['list/name_of_post'];
                    const post = String(original).split('_').join(' ').toLowerCase();
                    const discarded = partialUse + contamination + otheFactors + colorChange;

                    processedList = [...processedList, {
                        ...l,
                        ['list/no.vials_discarded']: isNaN(parseInt(discarded, 10)) ? 0 : discarded,
                        ['list/name_of_post']: ous[post] ? ous[post] : original,

                        ["list/target_population"]: target_population,
                        ["list/no_vaccine_vials_issued"]: no_vaccine_vials_issued,
                        ["list/chd_registered_months0_59"]: chd_registered_months0_59,
                        ["list/children_immunised/months0_59"]: months0_59,
                        ["list/post_staffing/number_mobilizers"]: number_mobilizers,
                        ["list/no_vaccine_vials_returned_unopened"]: no_vaccine_vials_returned_unopened,
                        ["list/post_staffing/number_health_workers"]: number_health_workers,
                        ["list/children_immunised/first_ever_zero_dose"]: first_ever_zero_dose,

                        ['list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use']: isNaN(partialUse) ? 0 : partialUse,
                        ['list/no.vials_discarded_due_to/no_vials_discarded_due_contamination']: isNaN(contamination) ? 0 : contamination,
                        ['list/no.vials_discarded_due_to/no_vials_discarded_other_factors']: isNaN(otheFactors) ? 0 : otheFactors,
                        ['list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change']: isNaN(colorChange) ? 0 : colorChange,
                        ...rest,
                        subcounty,
                        districts,
                        region,
                        date_of_results,
                        day_of_results
                    }]
                }
                const body = processedList.flatMap(({ _id, ...doc }) => [{ update: { _index: 'opv', _id } }, { doc, doc_as_upsert: true }]);
                const { body: bulkResponse } = await client.bulk({ refresh: true, body });
                response = bulkResponse;
                // io.emit('data', { message: 'data has come' });
            }
        }
        // } catch (e) {
        //     winston.log('error', e.message);
        //     response = { message: e.message }
        // }
        return res.status(201).send(response);
    });


    app.post('/checklist', async (req, res) => {
        let response = {};
        const data = req.body;
        let rest = data[0]
        let { subcounty, districts, region, other_subcountyvisited, vaccination_post_location } = rest;
        subcounty = subcounty.split('_').join(' ');
        if (subcounty === 'OTHERS') {
            subcounty = String(other_subcountyvisited).split('_').join(' ');
        }
        districts = districts.split('_').join(' ');
        region = region.split('_').join(' ');
        const district = await pullOrganisationUnits(3, districts);

        if (district && district.length === 1) {
            districts = district[0].id
            region = district[0].parent.id;
            const subCounties = district[0].children;
            const searchedSubCounty = subCounties.filter(s => {
                return String(s.name).toLowerCase().includes(String(subcounty).toLowerCase());
            });
            if (searchedSubCounty.length === 1) {
                const subCounty = searchedSubCounty[0]
                subcounty = subCounty.id;
                const posts = [vaccination_post_location];
                const ous = await searchPosts(subCounty, posts);
                vaccination_post_location = ous[vaccination_post_location] ? ous[vaccination_post_location] : vaccination_post_location
                rest = {
                    ...rest,
                    subcounty,
                    districts,
                    region,
                    vaccination_post_location
                }

                const data = mapEventData(rest, ous);

                const { _version, _id, ...event } = rest


                const body = [event].flatMap(doc => [{ index: { _index: 'checklist' } }, doc]);
                const { body: bulkResponse } = await client.bulk({ refresh: true, body });
                response = bulkResponse;
            }
        }

        return res.status(201).send(response);
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
                "index": 'opv-polio',
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
        const q = req.query.search
        const soroti = uganda_subcounties.features.filter(u => {
            return u['properties']['parent'] === q
        })
        return res.status(200).send({ ...uganda_subcounties, features: soroti });
    });

    app.get('/regions', async (req, res) => {
        const q = req.query.search
        const soroti = uganda_districts.features.filter(u => {
            return u['properties']['parent'] === q
        })
        return res.status(200).send({ ...uganda_districts, features: soroti });
    });

    app.get('/country', async (req, res) => {
        return res.status(200).send(uganda_districts);
    });

    app.get('/targets', async (req, res) => {
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
        const q = req.query.search
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
        const q = req.query.search
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

};