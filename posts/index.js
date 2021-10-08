const express = require('express');
const { randomBytes} = require('crypto');
const axios = require('axios');

const app = express();
app.use(express.json());

const posts = {};

app.get('/posts', (req,res)=>{
    res.send(posts);
});

app.post('/posts', async (req,res)=>{
    const id = randomBytes(4).toString('hex');
    const {title} = req.body;
    posts[id] = {
        id,title
    };
    
    await axios.post('http://event-bus-srv:4005/events',{
        type: 'PostCreated',
        data: {
            id,title
        }
    });

    res.status(201).send(posts[id]);
});

app.post('/events',(req,res)=>{
    console.log('event received', req.body.type);
});

app.listen(4000, ()=>{
    console.log('v30');
    console.log('Listening on port 4000');
});