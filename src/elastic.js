const _ = require('lodash');
const axios = require('axios');
const moment = require('moment');
const fs = require('fs');

// var odk = require('./data/odk.json');
var sembabule = require('./data/sembabule.json');

// const filtered = odk.filter(d => {
//     return String(d.districts).includes('BAULE');
// });

// fs.writeFileSync('sembabule.json', JSON.stringify(filtered));


async function post() {
    for (const data of sembabule) {
        console.log('Inserting for ' + data.subcounty);
        const response = await axios.post('http://localhost:3001', data, { headers: { 'Accept': 'application/json' } });
        console.log('Done for ' + data.subcounty);
    }


}

post().then(function () {
    console.log('finished');
})
