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



// Helper Functions
function getLocation(req, res, next) {
    let query = req.query.data;
    const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.LOCATION_API_KEY}`;

    return superagent.get(_URL)
        .then(data => {
            if (!data.body.results.length) {
                throw new Error('No Data');
            } else {
                let location = new Location(data.body.results[0]);
                location.search_query = query;
    
                res.send(location);
            }
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



// Object Constructors
function Location(data) {
    this.formatted_query = data.formatted_address;
    this.latitude = data.geometry.location.lat;
    this.longitude = data.geometry.location.lng;
}

function Weather(day) {
    this.forecast = day.summary;
    this.time = new Date(day.time * 1000).toString().slice(0, 15);
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
