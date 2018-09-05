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
      console.log(data.rows[0]);
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
      console.log(data.rows[0]);
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
      let imageUrl = '';
      if (results.body.documentSentiment.score < -.25) {
        imageUrl = 'negative';
      } else if (results.body.documentSentiment.score > .25) {
        imageUrl = 'positive';
      } else {
        imageUrl = 'neutral';
      }
      // this is sending to the database
      let SQL = `INSERT INTO posts (date, score, magnitude, avatar, content) VALUES ($1, $2, $3, $4, $5)`;
      let values = [
        new Date(),
        results.body.documentSentiment.score,
        results.body.documentSentiment.magnitude,
        imageUrl,
        request.body.description
      ];
      client.query(SQL, values)
        .then( () => {
          response.render('master', {
            posts: [{
              date: values[0],
              score: values[1],
              magnitude: values[2],
              avatar: values[3],
              content: values[4]
            }],
            'pageTitle': 'Result',
            'pagePath': 'pages/result.ejs'
          });
        });
    });
}

// functions for routes - edit post



// functions for routes - errors

// other functions