const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

var mr = require('./data/opv.json');

// const filtered = odk.filter(d => {
//     return String(d.districts).includes('BAULE');
// });
// fs.writeFileSync('sembabule.json', JSON.stringify(filtered));


const grouped = _.groupBy(mr, 'districts');


const districts = _.keys(grouped);

async function post() {
    for (const district of districts) {
        console.log(`Inserting for ${district}`);
        const data = grouped[district];
        await axios.post('http://localhost:3001/bulk_opv', data, { headers: { 'Accept': 'application/json' } });
        console.log(`Finished for ${district}`);
    }

}

post().then(function () {
    console.log('finished');
})
