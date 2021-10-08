const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

const posts = {};

app.get('/posts',(req,res)=>{
    res.send(posts);
});

app.post('/events',(req,res)=>{
    console.log('Posts is ',posts);

    const {type, data} = req.body;

    if(type === 'PostCreated'){
        const {id, title} = data;
        posts[id]={ id, title, comments: []};
    }
    
    if(type === 'CommentCreated'){
        const {id, content, postId, status} = data;
        posts[postId].comments.push({id, content, status});
    }

    if(type === 'CommentUpdated'){
        const {id,content,postId,status} = data;

        const post = posts[postId];
        const comment = post.comment.find(comment=>{
            comment.id === id;
        });
        comment.status = status;
        comment.content = content;
    }
    res.send(posts);
});

app.listen('4002',()=>{
    console.log('Listening on 4002');
})