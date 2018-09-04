'use strict';

// app configuration
require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');
const app = express();

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

// post routes
app.use( express.static('./public') );
app.use('*', (req, res) => res.render('pages/error'));

app.listen( PORT, () => console.log('Server Up on ', PORT) );


// functions for routes - get

function getHome(request, response) {
  let SQL = 'SELECT avatar, content FROM posts';
  client.query(SQL)
    .then(data => {
      response.render('master', {
        posts:data.rows,
        'pageTitle': 'Home',
        'pagePath': 'pages/home.ejs'
      });
    });
}

function getNew(request, response) {
  response.render('master', {
    'pageTitle': 'New Post',
    'pagePath': 'partials/new.ejs'
  });
}

function getAbout(request, response) {
  response.render('master', {
    'pageTitle': 'About',
    'pagePath': 'partials/about.ejs'
  });
}

// functions for routes - post

// functions for routes - put/delete

// functions for routes - errors