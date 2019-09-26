import express from 'express';
import bodyParser from 'body-parser';
import cors from "cors";
import socket from 'socket.io';
import http from 'http';
import { routes } from './routes';

const app = express();

app.use(bodyParser.json({ limit: '100mb' }));
app.use(cors());

const server = http.createServer(app).listen(3001, () => {
    console.log('HTTP server listening on port 3001');
});

let io = socket.listen(server);
io.on('connection', (socket) => {
    socket.on('message', (data) => {
        console.log(data);
    });
    socket.on("disconnect", () => console.log("Client disconnected"));
});

routes(app, io);

// app.post('/', Schedule.create);

// app.listen(3001);

// console.log('Server running at http://localhost:3001/');



// import { Client } from '@elastic/elasticsearch';
// const client = new Client({ node: 'http://localhost:9200' });


// async function run () {
//     // Let's start by indexing some data
//     await client.index({
//         index: 'game-of-thrones',
//         // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
//         body: {
//             character: 'Ned Stark',
//             quote: 'Winter is coming.'
//         }
//     });

//     await client.index({
//         index: 'game-of-thrones',
//         // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
//         body: {
//             character: 'Daenerys Targaryen',
//             quote: 'I am the blood of the dragon.'
//         }
//     });

//     await client.index({
//         index: 'game-of-thrones',
//         // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
//         body: {
//             character: 'Tyrion Lannister',
//             quote: 'A mind needs books like a sword needs a whetstone.'
//         }
//     });

//     // here we are forcing an index refresh, otherwise we will not
//     // get any result in the consequent search
//     await client.indices.refresh({ index: 'game-of-thrones' })

//     // Let's search!
//     const { body } = await client.search({
//         index: 'game-of-thrones',
//         // type: '_doc', // uncomment this line if you are using Elasticsearch ≤ 6
//         body: {
//             query: {
//                 match: { quote: 'winter' }
//             }
//         }
//     });

//     console.log(body.hits.hits)
// }

// run().catch(console.log);
