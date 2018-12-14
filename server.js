'use strict';

// Set up dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')
const pg = require('pg');

require('dotenv').config();

const PORT = process.env.PORT;

const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('err', err => console.log(err));

const app = express();

app.use(cors());
app.use(handleError);



// Routes
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/yelp', getYelp);
app.get('/movies', getMovies);



// Error handler
function handleError(err, req, res, next) {
    console.error('ERR', err)

    if (res)
    {
        res.status(500).send('I\'m sorry, something unexpected happened');
    }
}



// Listen for traffic
app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));



// --------------------------------------- LOCATION ------------------------------------ //
// Callback
function getLocation(req, res, next) {
    const locationHandler = {
        query: req.query.data,

        cacheHit: (results) => res.send(results.rows[0]),

        cacheMiss: () => Location.fetchLocationData(req.query.data).then(data => res.send(data))
    }

    Location.lookUpLocationDB(locationHandler);
}

// Object Constructors and Prototypes
function Location(query, data) {
    this.search_query = query;
    this.formatted_query = data.formatted_address;
    this.latitude = data.geometry.location.lat;
    this.longitude = data.geometry.location.lng;
}

Location.prototype.save = function() {
    let SQL = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4)`;
    let values = Object.values(this);
    client.query(SQL, values);
}

// Helper Functions
Location.fetchLocationData = (query) => {
    const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.LOCATION_API_KEY}`;

    return superagent.get(_URL)
        .then(data => {
            if (!data.body.results.length) { throw 'No Data'; }
            else {
                let location = new Location(query, data.body.results[0]);

                location.save;

                return location;
            }
        });
}

Location.lookUpLocationDB = (handler) => {
    const SQL = `SELECT * FROM locations WHERE search_query=$1`;
    const values = [handler.query];

    return client.query(SQL, values)
        .then(results => {
            if (results.rowCount > 0) {
                handler.cacheHit(results);
            } else {
                handler.cacheMiss();
            }
        })
        .catch(console.error);
}


function getWeather(req, res, next) {
    let latitude = req.query.data.latitude;
    let longitude = req.query.data.longitude;
    const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

    return superagent.get(_URL)
        .then(result => res.send(result.body.daily.data.map(day => new Weather(day))))
        .catch(error => handleError(error, req, res, next));
}

function getYelp(req, res, next) {
    let latitude = req.query.data.latitude;
    let longitude = req.query.data.longitude;
    const _URL = `https://api.yelp.com/v3/businesses/search?term=restaurants&latitude=${latitude}&longitude=${longitude}`;

    return superagent.get(_URL)
        .set('Authorization', `Bearer ${process.env.YELP_API_KEY}`)
        .then(result => res.send(result.body.businesses.map(restaurant => new Yelp(restaurant))))
        .catch(error => handleError(error, req, res, next));
}

function getMovies(req, res, next) {
    let searchQuery = req.query.data.search_query.split(',')[0];
    const _URL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.MOVIE_DB_API_KEY}&language=en-US&query=${searchQuery}&include_adult=false&page=1`;

    return superagent.get(_URL)
        .then(result => res.send(result.body.results.map(movie => new Movie(movie))))//console.log(result.body.results[0].title))
        .catch(error => handleError(error, req, res, next));
}




function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toString().slice(0, 15);
}

function Yelp(restaurant) {
    this.name = restaurant.name;
    this.image_url = restaurant.image_url;
    this.price = restaurant.price;
    this.rating = restaurant.rating;
    this.url = restaurant.url;
}

function Movie(movie) {
    this.title = movie.title;
    this.overview = movie.overview;
    this.average_votes = movie.average_votes;
    this.image_url = `https://image.tmdb.org/t/p/original/${movie.poster_path}`;
    this.popularity = movie.popularity;
    this.releaseDate = movie.release_on;
}








