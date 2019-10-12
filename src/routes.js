import { pullOrganisationUnits, searchPosts, mrDataValues, findType, getCOC, opvDataValues } from './data-utils';
import { Client } from '@elastic/elasticsearch';
import moment from 'moment'
const client = new Client({ node: 'http://213.136.94.124:9200' });

const createIndex = async function (indexName, mapping) {
    return await client.indices.create({
        index: indexName,
        body: mapping
    });
}
const checkIndex = async function (indexName) {
    return await client.indices.exists({ index: indexName });
}

async function rubella() {

    try {
        const resp = await checkIndex('mr-rubella');
        const opv = await checkIndex('opv-polio');
        if (resp.statusCode === 404) {
            const mapping = {
                mappings: {
                    properties: {
                        _uuid: { type: 'text', fielddata: true },
                        today: { type: 'date' },
                        region: { type: 'text', fielddata: true },
                        endtime: { type: 'date' },
                        deviceid: { type: 'text' },
                        num_post: { type: 'integer' },
                        _duration: { type: 'integer' },
                        _xform_id: { type: 'integer' },
                        districts: { type: 'text', fielddata: true },
                        starttime: { type: 'date' },
                        subcounty: { type: 'text', fielddata: true },
                        list_count: { type: 'integer' },
                        _media_count: { type: 'integer' },
                        _total_media: { type: 'integer' },
                        'formhub/uuid': { type: 'text', fielddata: true },
                        _submitted_by: { type: 'text', fielddata: true },
                        day_of_results: { type: 'text', fielddata: true },
                        date_of_results: { type: 'date' },
                        'meta/instanceID': { type: 'text', fielddata: true },
                        _submission_time: { type: 'date' },
                        _xform_id_string: { type: 'text', fielddata: true },
                        _bamboo_dataset_id: { type: 'text', fielddata: true },
                        _media_all_received: { type: 'boolean' },
                        mobile_number_supervisor: { type: 'text', fielddata: true },
                        name_district_supervisor: { type: 'text', fielddata: true },
                        'list/name_of_post': { type: 'text', fielddata: true },
                        'list/target_population': { type: 'integer' },
                        'list/other_factor_specify': { type: 'integer' },
                        'list/children_vaccinated/years3_5': { type: 'integer' },
                        'list/children_vaccinated/years6_14': { type: 'integer' },
                        'list/children_vaccinated/months9_11': { type: 'integer' },
                        'list/children_vaccinated/months12_24': { type: 'integer' },
                        'list/post_staffing/number_mobilizers': { type: 'integer' },
                        'list/post_staffing/number_health_workers': { type: 'integer' },
                        'list/mr_vaccine_usage/no_vaccine_vials_issued': { type: 'integer' },
                        'list/mr_vaccine_usage/no_diluent_ampules_issued': { type: 'integer' },
                        'list/mr_vaccine_usage/no_vials_discarded_other_factors': { type: 'integer' },
                        'list/mr_vaccine_usage/no_vaccine_vials_returned_unopened': { type: 'integer' },
                        'list/mr_vaccine_usage/no_vials_discarded_due_partial_use': { type: 'integer' },
                        'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened': { type: 'integer' },
                        'list/mr_vaccine_usage/no_vials_discarded_due_contamination': { type: 'integer' },
                        'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change': { type: 'integer' }
                    }
                }
            }
            await createIndex('mr-rubella', mapping);
        }
        if (opv.statusCode === 404) {
            const mapping1 = {
                mappings: {
                    properties: {
                        _uuid: { type: 'text', fielddata: true },
                        today: { type: 'date' },
                        region: { type: 'text', fielddata: true },
                        endtime: { type: 'date' },
                        deviceid: { type: 'text' },
                        num_post: { type: 'integer' },
                        _duration: { type: 'integer' },
                        _xform_id: { type: 'integer' },
                        districts: { type: 'text', fielddata: true },
                        starttime: { type: 'date' },
                        subcounty: { type: 'text', fielddata: true },
                        list_count: { type: 'integer' },
                        _media_count: { type: 'integer' },
                        _total_media: { type: 'integer' },
                        'formhub/uuid': { type: 'text', fielddata: true },
                        _submitted_by: { type: 'text', fielddata: true },
                        day_of_results: { type: 'text', fielddata: true },
                        date_of_results: { type: 'date' },
                        'meta/instanceID': { type: 'text', fielddata: true },
                        _submission_time: { type: 'date' },
                        _xform_id_string: { type: 'text', fielddata: true },
                        _bamboo_dataset_id: { type: 'text', fielddata: true },
                        _media_all_received: { type: 'boolean' },
                        mobile_number_supervisor: { type: 'text', fielddata: true },
                        name_district_supervisor: { type: 'text', fielddata: true },
                        'list/name_of_post': { type: 'text', fielddata: true },
                        "list/physical_balance": { type: 'integer' },
                        "list/target_population": { type: 'integer' },
                        "list/no_vaccine_vials_issued": { type: 'integer' },
                        "list/chd_registered_months0_59": { type: 'integer' },
                        "list/children_immunised/months0_59": { type: 'integer' },
                        "list/post_staffing/number_mobilizers": { type: 'integer' },
                        "list/no_vaccine_vials_returned_unopened": { type: 'integer' },
                        "list/post_staffing/number_health_workers": { type: 'integer' },
                        "list/children_immunised/first_ever_zero_dose": { type: 'integer' },
                        "list/no.vials_discarded_due_to/other_factor_specify": { type: 'text', fielddata: true },
                        "list/no.vials_discarded_due_to/no_vials_discarded_other_factors": { type: 'integer' },
                        "list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use": { type: 'integer' },
                        "list/no.vials_discarded_due_to/no_vials_discarded_due_contamination": { type: 'integer' },
                        "list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change": { type: 'integer' }
                    }
                }
            }
            await createIndex('opv-polio', mapping1);
        }
    } catch (e) {
        console.log(JSON.stringify(e));
    }

}

rubella();

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
                if (searchedSubCounty.length === 1) {
                    const subCounty = searchedSubCounty[0]
                    subcounty = subCounty.id;
                    const posts = list.map(l => l['list/name_of_post']);
                    ous = await searchPosts(subCounty, posts);
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
            }
        } catch (e) {
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
            years3_5: { sum: { field: 'list/children_vaccinated/years3_5' } },
            years6_14: { sum: { field: 'list/children_vaccinated/years6_14' } },
            months9_11: { sum: { field: 'list/children_vaccinated/months9_11' } },
            months12_24: { sum: { field: 'list/children_vaccinated/months12_24' } },
            children_vaccinated: { sum: { field: 'list/children_vaccinated/total' } },
            no_vials_discarded: { sum: { field: 'list/mr_vaccine_usage/no_vials_discarded' } }
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
            children_immunised: { sum: { field: 'list/children_immunised/months0_59' } },
            no_vaccine_vials_returned_unopened: { sum: { field: 'list/no_vaccine_vials_returned_unopened' } },
            no_vials_discarded_due_contamination: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_due_contamination' } },
            no_vials_discarded_due_vvm_color_change: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_due_vvm_color_change' } },
            no_vials_discarded_due_contamination: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_other_factors' } },
            no_vials_discarded_due_contamination: { sum: { field: 'list/no.vials_discarded_due_to/no_vials_discarded_due_partial_use' } },
            no_vials_discarded: { sum: { field: 'list/no.vials_discarded' } }
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

    app.get('/regions', async (req, res) => {
        const regions = require('./regions.json');
        return res.status(200).send(regions);
    });

    app.get('/districts', async (req, res) => {
        const q = req.query.search

        let districts = require('./districts.json');
        if (q) {
            districts = districts.filter(d => {
                return d['Region'] === q || d['Region UID'] === q
            })
        }
        return res.status(200).send(districts);
    });
    app.get('/subcounties', async (req, res) => {
        const q = req.query.search
        let subcounties = require('./subcounties.json');

        if (q) {
            subcounties = subcounties.filter(d => {
                return d['District'] === q || d['District UID'] === q
            })
        }
        return res.status(200).send(subcounties);
    });

    app.get('/uganda', async (req, res) => {
        let subcounties = require('./Uganda.json');
        subcounties = subcounties.map(s => {
            const { id, name, ...rest } = s;
            const additions = {
                properties: {
                    "hc-group": "admin1",
                    "hc-middle-x": 0.74,
                    "hc-middle-y": 0.63,
                    "hc-key": s.id,
                    "labelrank": "7",
                    "hasc": "NO.MR",
                    "alt-name": "Moere og Romsdal fylk|MĂ¸re|Romsdal",
                    "woe-id": "2346391",
                    "subregion": null,
                    "fips": "NO08",
                    "postal-code": "MR",
                    "name": name,
                    "country": "Uganda",
                    "type-en": "Region",
                    "region": name,
                    "longitude": "8.35107",
                    "woe-name": "MĂ¸re og Romsdal",
                    "latitude": "62.5471",
                    "woe-label": name,
                    "type": "Fylke"
                },
                "type": "Feature",
                id,
            }
            return {
                ...additions,
                ...rest

            };
        });

        const map = {
            "title": "Norway",
            features: subcounties
        }
        return res.status(200).send(map);
    });
};