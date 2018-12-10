'use strict';

// Set up dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')

require('dotenv').config();

const PORT = process.env.PORT;
const app = express();

app.use(cors());
app.use(handleError);



// Routes
app.get('/location', getLocation);
app.get('/weather', getWeather);
app.get('/yelp', getYelp);
app.get('/movies', getMovies);



// Helper Functions
function getLocation(req, res, next) {
    let query = req.query.data;
    const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.LOCATION_API_KEY}`;

    return superagent.get(_URL)
        .then(data => {
            if (!data.body.results.length) {throw new Error('No Data');}
    
            res.send(new Location(query, data.body.results[0]));
        })
        .catch(error => handleError(error, req, res, next));
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
        .then(result => res.send(result.body.results.map(movie = new Movie(movie))))
        .catch(error => handleError(error, req, res, next));
    

}



// Object Constructors
function Location(query, data) {
    this.search_query = query;
    this.formatted_query = data.formatted_address;
    this.latitude = data.geometry.location.lat;
    this.longitude = data.geometry.location.lng;
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



// Error handlers
function handleError(err, req, res, next) {
    console.error('ERR', err)

    if (res)
    {
        res.status(500).send('I\'m sorry, something unexpected happened');
    }
}

app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));
