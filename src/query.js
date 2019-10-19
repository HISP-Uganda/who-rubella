const _ = require('lodash');
const axios = require('axios');
const fileSaver = require('file-saver');
const fs = require('fs');
const moment = require('moment');
var jsonexport = require('jsonexport');

var districts = require('./districts_map.json');
var subcounties = require('./uganda.json');
var dhis2_districts = require('./dhis2_districts.json');
var dhis2_subcounties = require('./dhis2_subcounties.json');
var organisations = require('./organisationUnits.json');


// const day1 = require(`${__dirname}/data/Day1.json`);
// const day2 = require(`${__dirname}/data/Day2.json`);
// const day3 = require(`${__dirname}/data/Day3.json`);
// const day5 = require(`${__dirname}/data/Day5.json`);
// const testData = require(`${__dirname}/data/odk.json`);

// const gp1 = _.groupBy(day1, 'districts');
// const gp2 = _.groupBy(day2, 'districts');
// const gp3 = _.groupBy(day3, 'districts');
// const gp5 = _.groupBy(day5, 'districts');
// const test = _.groupBy(testData, 'districts');
// const toBePicked = [
//     'list/name_of_post',
//     'list/target_population',
//     'list/other_factor_specify',
//     'list/children_vaccinated/years3_5',
//     'list/children_vaccinated/years6_14',
//     'list/children_vaccinated/months9_11',
//     'list/children_vaccinated/months12_24',
//     'list/post_staffing/number_mobilizers',
//     'list/post_staffing/number_health_workers',
//     'list/mr_vaccine_usage/no_vaccine_vials_issued',
//     'list/mr_vaccine_usage/no_diluent_ampules_issued',
//     'list/mr_vaccine_usage/no_vials_discarded_other_factors',
//     'list/mr_vaccine_usage/no_vaccine_vials_returned_unopened',
//     'list/mr_vaccine_usage/no_vials_discarded_due_partial_use',
//     'list/mr_vaccine_usage/no_diluent_ampules_returned_unopened',
//     'list/mr_vaccine_usage/no_vials_discarded_due_contamination',
//     'list/mr_vaccine_usage/no_vials_discarded_due_vvm_color_change'
// ]


// _.forOwn(test, function (v, k) {
//     const subcounties = _.groupBy(v, 'subcounty');
//     _.forOwn(subcounties, async function (v, k) {
//         const { region, districts, subcounty, day_of_results, date_of_results } = v[0];
//         const list = v.map(function (s) {
//             return _.pick(s, toBePicked)
//         });
//         const qw = {
//             region,
//             districts,
//             subcounty,
//             day_of_results,
//             date_of_results,
//             list
//         };

//         console.log(JSON.stringify(qw));

//         // await axios.post('http://localhost:3001', qw, { headers: { 'Accept': 'application/json' } })
//     });

// });
// const data = testData.map(testData => {
//     const { list, ...rest } = testData;
//     if (list) {
//         return list.map(l => {
//             return { ...l, ...rest }
//         });
//     }
//     return null
// }).filter(f => !!f);

// let final = _.flatten(data);


// final = JSON.stringify(final);
// fs.writeFileSync('student.json', final);

// jsonexport(final, function (err, csv) {
//     if (err) return console.log(err);
//     fs.writeFileSync('student.csv', csv);
// });

// console.log(districts)

const changeDistricts = () =>{
    const processedDistricts = _.fromPairs(dhis2_districts.map(u => [String(u.name).replace(/\\n/g, '').trim().toUpperCase(), {id:u.id,parent:u.parent.id,parentName:String(u.parent.name).replace(/\\n/g, '').trim().toUpperCase()}]))

    const { features, ...rest } = districts;
    const finalFeatures = features.map(feature => {
        const props = feature.properties;
        const what = processedDistricts[props.District18];
        if(what){
            return { ...feature, properties: { id: what.id,parent:what.parent,parentName:what.parentName,name:props.District18 } }
        }else{
            return {...feature,properties: { id:'',parent:'',name:props.District18,parentName:''}}
        }
    });

    const map = { ...rest, features: finalFeatures }

    fs.writeFileSync('uganda_districts.json', JSON.stringify(map));
}

const processOrganisations = () =>{
    const openingDate = moment().subtract(1, 'years');
    let {organisationUnits,...rest} = organisations;

   organisationUnits =  organisationUnits.map(ou=>{
        return {
            ...ou,
            name:String(ou.name).replace(/\\n/g, '').trim(),
            shortName:String(ou.shortName).replace(/\\n/g, '').trim(),
            openingDate
        }
    });

    const final = {...rest,organisationUnits};

    fs.writeFileSync('organisationUnits.json', JSON.stringify(final));

}

const changeSubcounties = () =>{
    const { features, ...rest } = subcounties;
    const finalFeatures = features.map(feature => {
        const props = feature.properties;
        const district = props.District;
        const subCounty = props.Subcounty;

        const subCounties = dhis2_subcounties.filter(u=>{
            return String(u.parent.name).replace(/\\n/g, '').trim() ===  district;
        });

        const searchedSubcounty = subCounties.filter(sc=>{
            let search  = String(sc.name).replace(/\\n/g, '').trim().toUpperCase();

            if(search.endsWith(' SC')){
                search = search.replace(' SC','')
            }else if(search.endsWith(' S/C')){
                search = search.replace(' S/C','')
            }else if(search.endsWith(' TC')){
                search = search.replace(' TC',' TOWN COUNCIL')
            }else if(search.endsWith(' T/C')){
                search = search.replace(' T/C',' TOWN COUNCIL')
            }
            return search === subCounty
        });

        if(searchedSubcounty.length > 0){
            const sub = searchedSubcounty[0]
            return { ...feature, properties: { id: sub.id,parent:sub.parent.id,name:subCounty,parentName:district } }
        }else{
            return {...feature,properties: { id:'',parent:'',name:subCounty,parentName:district}}
        }
    });

    const map = { ...rest, features: finalFeatures }

    fs.writeFileSync('uganda_subcounties.json', JSON.stringify(map));
}

changeDistricts();

changeSubcounties();

// processOrganisations();