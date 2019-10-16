import { pullOrganisationUnits, searchPosts, mrDataValues, findType, getCOC, opvDataValues } from './data-utils';
import { Client } from '@elastic/elasticsearch';
import moment from 'moment';
import { generateUid } from './uid';

// const client = new Client({ node: 'http://213.136.94.124:9200' });
const client = new Client({ node: 'http://localhost:9200' });


export const routes = (app, io) => {
    app.post('/', async (req, res) => {
        let response = {};
        try {
            let { list, date_of_results, day_of_results, _id, _version, ...rest } = req.body;
            let ous = {};
            let processedList = [];
            let { subcounty, districts, region } = rest;
            subcounty = subcounty.split('_').join(' ');
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
                if (searchedSubCounty.length === 1) {
                    subCounty = searchedSubCounty[0];
                    subcounty = subCounty.id;
                    const posts = list.map(l => l['list/name_of_post']);
                    ous = await searchPosts(subCounty, posts);
                }else if(searchedSubCounty.length === 0){
                    const id =  generateUid();
                    const posts = list.map(l => l['list/name_of_post']);
                    ous = await searchPosts({name:subcounty,id}, posts,districts,true);
                    subcounty = id;
                }
                
                    await mrDataValues(list, ous, moment(date_of_results).format('YYYYMMDD'), day_of_results);

                    for (const l of list) {
                        const total = l['list/children_vaccinated/years3_5'] +
                            l['list/children_vaccinated/years6_14'] +
                            l['list/children_vaccinated/months9_11'] +
                            l['list/children_vaccinated/months12_24'];
                        const discarded =
                            l['list/mr_vaccine_usage/no_vials_discarded_due_partial_use'] +
                            l['list/mr_vaccine_usage/no_vials_discarded_due_contamination'] +
                            l['list/mr_vaccine_usage/no_vials_discarded_other_factors'] +
                            l['list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'];
                        const original = l['list/name_of_post'];
                        const post = String(original).split('_').join(' ').toLowerCase();

                        processedList = [...processedList, {
                            ...l,
                            ['list/children_vaccinated/total']: total,
                            ['list/mr_vaccine_usage/no_vials_discarded']: discarded,
                            ['list/name_of_post']: ous[post] ? ous[post] : original,
                            ...rest,
                            subcounty,
                            districts,
                            region,
                            date_of_results,
                            day_of_results
                        }]
                    }
                    const body = processedList.flatMap(doc => [{ index: { _index: 'mr-rubella' } }, doc]);
                    const { body: bulkResponse } = await client.bulk({ refresh: true, body });
                    io.emit('data', { message: 'data has come' });
                    response = bulkResponse;
            }
        } catch (e) {
            console.log(e.response.data.response.errorReports);
            response = { message: e.message }
        }
        return res.status(201).send(response);
    });

    app.post('/opv', async (req, res) => {
        let response = {};
        try {
            let { list, date_of_results, day_of_results, _id, _version, ...rest } = req.body;
            let ous = {};
            let processedList = [];
            let { subcounty, districts, region } = rest;
            subcounty = subcounty.split('_').join(' ');
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
                    const posts = list.map(l => l['list/name_of_post']);
                    ous = await searchPosts(subCounty, posts);
                    await opvDataValues(list, ous, moment(date_of_results).format('YYYYMMDD'), day_of_results);

                    for (const l of list) {
                        const discarded =
                            l['list/no.vials_discarded_due_to/no_vials_discarded_other_factors'] +
                            l['list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use'] +
                            l['list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change'] +
                            l['list/no.vials_discarded_due_to/no_vials_discarded_due_contamination'];

                        const original = l['list/name_of_post'];
                        const post = String(original).split('_').join(' ').toLowerCase();

                        processedList = [...processedList, {
                            ...l,
                            ['list/no.vials_discarded']: discarded,
                            ['list/name_of_post']: ous[post] ? ous[post] : original,
                            ...rest,
                            subcounty,
                            districts,
                            region,
                            date_of_results,
                            day_of_results
                        }]
                    }
                    const body = processedList.flatMap(doc => [{ index: { _index: 'opv-polio' } }, doc]);
                    const { body: bulkResponse } = await client.bulk({ refresh: true, body });
                    response = bulkResponse;
                    io.emit('data', { message: 'data has come' });
                }
            }
        } catch (e) {
            response = { message: e.message }
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
            no_diluent_ampules_returned_unopened: { sum: { field: 'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened' } },
            no_vials_discarded_due_contamination: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded_due_contamination' } },
            no_vials_discarded_due_vvm_color_change: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change' } },
            children_vaccinated: { sum: { field: 'list/children_vaccinated/total' } },
            no_vials_discarded: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded' } },
            posts: { cardinality: { field: 'list/name_of_post' } }
        }

        const summary = {
            terms: {
                field: q.disaggregation
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
                field: 'day_of_results'
            },
            aggs: calculations
        }

        const data = {
            terms: {
                field: q.disaggregation
            },
            aggs: {
                days: {
                    terms: {
                        field: 'day_of_results'
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
                "index": 'mr-rubella',
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
            posts: { cardinality: { field: 'list/name_of_post' } }
        }
        const summary = {
            terms: {
                field: q.disaggregation
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
                field: 'day_of_results'
            },
            aggs: calculations
        }

        const data = {
            terms: {
                field: q.disaggregation
            },
            aggs: {
                days: {
                    terms: {
                        field: 'day_of_results'
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
            console.log(error);
        }
        return res.status(200).send(bod);

    });

    app.get('/uganda', async (req, res) => {
        const uganda = require('./uganda.json');
        const q = req.query.search
        const soroti = uganda.features.filter(u=>{
            return u['properties']['District'] === q
        })
        return res.status(200).send({...uganda,features:soroti});
    });

};