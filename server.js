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
        .then(result => res.send(result.body))
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
    //"name": "Pike Place Chowder",
    // "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
    // "price": "$$   ",
    // "rating": "4.5",
    // "url"
    this.name;
    this.image_url;
    this.price;
    this.rating;
    this.url;
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
