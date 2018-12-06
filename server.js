'use strict';

// Set up dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')

require('dotenv').config();

const PORT = process.env.PORT;
const app = express();

app.use(cors());


// Routes
app.get('/location', (req, res) => {
    getLocation(req.query.data)
    .then(locationData => {
        res.send(locationData);
    });
});

app.get('/weather', getWeather);



// Helper Functions
function getLocation(query) {
    const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.LOCATION_API_KEY}`;

    return superagent.get(_URL)
        .then(data => {
            let location = new Location(data.body.results[0]);
            location.search_query = query;

            return location;
        });
}

function getWeather(req, res) {
    const latitude = req.query.data.latitude;
    const longitude = req.query.data.longitude;
    const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

    return superagent.get(_URL)
        .then(result => {
            const weatherSummaries = [];

            result.body.daily.data.forEach(day => {
                const summary = new Weather(day)
                weatherSummaries.push(summary);
            });
        });
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


app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));
