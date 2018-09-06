'use strict';

// app configuration
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const fs = require('fs');
const superagent = require('superagent');
const app = express();

const api_key = process.env.GOOGLE_API_KEY;

app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
const PORT = process.env.PORT;

// DB
const CONSTRING = process.env.DATABASE_URL;
let client = new pg.Client(CONSTRING);
client.connect();

client.on('error', err => {
  console.error(err);
});

// get routes
app.get('/', getHome);
app.get('/new', getNew);
app.get('/about', getAbout);
app.get('/edit/:id', getEdit);
app.get('/delete/:id', getDelete);

// post routes
app.post('/new/submit', postNewPost);

//put/delete routes
app.post('/delete/:id/submit', deletePost);
app.post('/edit/:id/submit', editPost);

app.use( express.static('./public') );
app.use(express.urlencoded({ extended: true }));
app.use('*', (req, res) => res.render('pages/error'));

app.listen( PORT, () => console.log('Server Up on ', PORT) );


// functions for routes - get

function getHome(request, response) {
  let SQL = 'SELECT * FROM posts ORDER BY id DESC LIMIT 50';
  client.query(SQL)
    .then(data => {
      response.render('master', {
        posts: data.rows,
        'pageTitle': 'Home',
        'pagePath': 'pages/home.ejs'
      });
    });
}

function getNew(request, response) {
  response.render('master', {
    'pageTitle': 'New Post',
    'pagePath': 'pages/new.ejs'
  });
}

function getAbout(request, response) {
  response.render('master', {
    'pageTitle': 'About',
    'pagePath': 'pages/about.ejs'
  });
}

function getEdit(request, response) {
  let SQL = `SELECT * FROM posts WHERE id = $1`;
  let values = [request.params.id];
  client.query(SQL, values)
    .then( (data) => {
      response.render('master', {
        post: data.rows[0],
        'pageTitle': 'Edit Post',
        'pagePath': 'pages/edit.ejs'
      });
    })
    .catch( (err) => console.log(err) );
}

function getDelete(request, response) {
  let SQL = `SELECT * FROM posts WHERE id = $1`;
  let values = [request.params.id];
  client.query(SQL, values)
    .then( (data) => {
      response.render('master', {
        post: data.rows[0],
        'pageTitle': 'Delete Post',
        'pagePath': 'pages/delete.ejs'
      });
    })
    .catch( (err) => console.log(err) );
}

// functions for routes - post

function postNewPost(request, response) {
  // this gets the url to post
  let url = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + api_key;

  // this puts the post content in the correct format to send to google
  let documents = {
    "document": {
      "type":"plain_text",
      "language": "EN",
      "content": request.body.description
    },
    "encodingType":"UTF8"
  };

  // this sends to google
  superagent
    .post(url)
    .send(documents)
    .then(results => {
      // this gets the image url based on the score
      let date = new Date();
      let imageUrl = '';
      if (results.body.documentSentiment.score < -.25) {
        imageUrl = 'negative';
      } else if (results.body.documentSentiment.score > .25) {
        imageUrl = 'positive';
      } else {
        imageUrl = 'neutral';
      }
      // this is sending to the database
      let SQL = `INSERT INTO posts (date, score, magnitude, avatar, content, password) VALUES ($1, $2, $3, $4, $5, $6)`;
      let values = [
        date.toDateString() + ' ' + getTime(date),
        results.body.documentSentiment.score,
        results.body.documentSentiment.magnitude,
        imageUrl,
        request.body.description,
        request.body.secretId
      ];
      client.query(SQL, values)
        .then( () => {
          response.render('master', {
            posts: [{
              date: values[0],
              score: values[1],
              magnitude: values[2],
              avatar: values[3],
              content: values[4],
              secretId: values[5]
            }],
            'pageTitle': 'Result',
            'pagePath': 'pages/result.ejs'
          });
        });
    });
}

// functions for routes - edit post

function editPost(request, response) {
  let SQL = `SELECT * FROM posts WHERE id = $1`;
  let values = [request.params.id];
  client.query(SQL, values)
    .then( (data) => {
      if (data.rows[0].password === request.body.secretId) {
        let url = 'https://language.googleapis.com/v1/documents:analyzeSentiment?key=' + api_key;
        // this puts the post content in the correct format to send to google
        let documents = {
          "document": {
            "type":"plain_text",
            "language": "EN",
            "content": request.body.postContent
          },
          "encodingType":"UTF8"
        };
      
        // this sends to google
        superagent
          .post(url)
          .send(documents)
          .then(results => {
            // this gets the image url based on the score
            let imageUrl = '';
            if (results.body.documentSentiment.score < -.25) {
              imageUrl = 'negative';
            } else if (results.body.documentSentiment.score > .25) {
              imageUrl = 'positive';
            } else {
              imageUrl = 'neutral';
            }
            // this is sending to the database
            let SQL2 = `UPDATE posts SET score = $1, magnitude = $2, avatar = $3, content = $4 WHERE id = $5`;
            let values2 = [
              results.body.documentSentiment.score,
              results.body.documentSentiment.magnitude,
              imageUrl,
              request.body.postContent,
              request.params.id
            ];
            client.query(SQL2, values2)
              .then( () => {
                response.redirect('/');
              });
          });
      } else {
        response.render('master', {
          'pageTitle': 'Incorrect Password',
          'pagePath': 'pages/incorrect.ejs'
        });
      }
    });
}

// functions for routes - delete post

function deletePost(request, response) {
  let SQL = `SELECT * FROM posts WHERE id = $1`;
  let values = [request.params.id];
  client.query(SQL, values)
    .then( (data) => {
      if (data.rows[0].password === request.body.secretId) {
        let SQL2 = `DELETE FROM posts WHERE id = $1`;
        client.query(SQL2, values)
          .then( () => {
            response.redirect('/');
          });
      } else {
        response.render('master', {
          'pageTitle': 'Incorrect Password',
          'pagePath': 'pages/incorrect.ejs'
        });
      }
    });
}

// functions for routes - errors

// other functions

function getTime(date) {
  let minutes = date.getMinutes().toString();
  if (minutes.length === 1) { minutes = '0' + minutes; }
  if (date.getHours() > 12) {
    return (date.getHours() - 12) + ':' + minutes + ' PM';
  } else if (date.getHours() === 12 ) {
    return '12:' + minutes + ' PM';
  } else {
    return date.getHours() + ':' + minutes + ' AM';
  }
}
