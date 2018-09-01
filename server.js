'use strict';

require('dotenv').config();
const express = require('express');
const pg = require('pg');
const superagent = require('superagent');

let app = express();
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
const PORT = process.env.PORT;

const CONSTRING = process.env.DATABASE_URL;
// const CONSTRING = 'postgres://localhost:5432/books_app';

let client = new pg.Client(CONSTRING);
client.connect();
client.on('error', err => {
  console.error(err);
});

app.get('/', (request, response) => {
  response.render('master');
});

app.use( express.static('./public') );

app.use('*', (req, res) => res.render('pages/error'));

app.listen( PORT, () => console.log('Server Up on ', PORT) );
