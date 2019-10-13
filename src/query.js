const _ = require('lodash');
const axios = require('axios');
const day1 = require(`${__dirname}/data/Day1.json`);
const day2 = require(`${__dirname}/data/Day2.json`);
const day3 = require(`${__dirname}/data/Day3.json`);
const day5 = require(`${__dirname}/data/Day5.json`);
const testData = require(`${__dirname}/data/Test.json`);


const gp1 = _.groupBy(day1, 'districts');
const gp2 = _.groupBy(day2, 'districts');
const gp3 = _.groupBy(day3, 'districts');
const gp5 = _.groupBy(day5, 'districts');
const test = _.groupBy(testData, 'districts');
const toBePicked = [
    'list/name_of_post',
    'list/target_population',
    'list/other_factor_specify',
    'list/children_vaccinated/years3_5',
    'list/children_vaccinated/years6_14',
    'list/children_vaccinated/months9_11',
    'list/children_vaccinated/months12_24',
    'list/post_staffing/number_mobilizers',
    'list/post_staffing/number_health_workers',
    'list/mr_vaccine_usage/no_vaccine_vials_issued',
    'list/mr_vaccine_usage/no_diluent_ampules_issued',
    'list/mr_vaccine_usage/no_vials_discarded_other_factors',
    'list/mr_vaccine_usage/no_vaccine_vials_returned_unopened',
    'list/mr_vaccine_usage/no_vials_discarded_due_partial_use',
    'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened',
    'list/mr_vaccine_usage/no_vials_discarded_due_contamination',
    'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'
]


_.forOwn(test, function (v, k) {
    const subcounties = _.groupBy(v, 'subcounty');
    _.forOwn(subcounties, async function (v, k) {
        const { region, districts, subcounty, day_of_results, date_of_results } = v[0];
        const list = v.map(function (s) {
            return _.pick(s, toBePicked)
        });
        const qw = {
            region,
            districts,
            subcounty,
            day_of_results,
            date_of_results,
            list
        };

        console.log(JSON.stringify(qw));

        // await axios.post('http://localhost:3001', qw, { headers: { 'Accept': 'application/json' } })
    });

});