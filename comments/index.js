const express = require('express');
const app = express();
const {randomBytes, randomInt} = require('crypto');
const axios = require('axios');

app.use(express.json());

const comments = {};

app.get('/posts/:id/comments', (req,res)=>{
    res.send(comments[req.params.id] || []);
});

app.post('/posts/:id/comments', async(req,res)=>{
    const id = randomBytes(4).toString("hex");
    const {content} = req.body;
    const comment = comments[req.params.id] || [];
    comment.push({id, content, status:'pending'});
    comments[req.params.id] = comment;

    await axios.post('http://event-bus-srv:4005/events',{
        type: 'CommentCreated',
        data: {
            id,
            content,
            postId: req.params.id,
            status:'pending'
        }
    }).catch((err) => {
        console.log(err.message);
      });
    res.send(comments[req.params.id]);
});

app.post('/events', async(req,res)=>{
    console.log('event received', req.body.type);

    const {type,data} = req.body;

    if( type === 'CommentModerated'){
        const {postId,id,status} = data;

        const comment = comments[postId];

        const commentupdate = comment.find(comment =>{
            return comment.id === id;
        });
        commentupdate.status = status;

        await axios.post('http:localhost:4005/events',{
            type:'CommentUpdated',
            data:{
                id,
                'content':commentupdate.content,
                status,
                postId
            }
        }).catch((err) => {
            console.log(err.message);
          });
    }
    res.send({});
});

app.listen(4001,(req,res)=>{
    console.log('Listening on port 4001');
})