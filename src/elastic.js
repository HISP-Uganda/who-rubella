import { Client } from '@elastic/elasticsearch';
const client = new Client({ node: 'http://213.136.94.124:9200' });



client.search({
    index: 'opv',
    body: {
        query: {
            match_all: {}
        }
    }
}, (err, result) => {
    if (err) console.log(err)
    console.log(JSON.stringify(result.body.hits.hits));
})
