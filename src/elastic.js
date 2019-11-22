const _ = require('lodash');
const axios = require('axios');

var mr = require('./data/mr.json');
var opv = require('./data/opv.json');


async function insertMR() {
    const grouped = _.groupBy(mr, 'districts');
    const districts = _.keys(grouped);

    for (const district of districts) {
        console.log(`Inserting for ${district}`);
        const data = grouped[district];
        await axios.post('http://localhost:3001', data, { headers: { 'Accept': 'application/json' } });
        console.log(`Finished for ${district}`);
    }

}

async function insertOPV() {
    const grouped = _.groupBy(opv, 'districts');
    const districts = _.keys(grouped);
    for (const district of districts) {
        console.log(`Inserting for ${district}`);
        const data = grouped[district];
        await axios.post('http://localhost:3001/opv', data, { headers: { 'Accept': 'application/json' } });
        console.log(`Finished for ${district}`);
    }
}

insertMR().then(function () {
    console.log('finished MR');
    // insertOPV().then(function () {
    //     console.log('finished OPV');
    // })
});


