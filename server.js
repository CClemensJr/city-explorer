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

app.get('/weather', (req, res) => {
    getWeather(req.query.data)
    .then( weatherData => {
        res.send(weatherData);
    });
});


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

function getWeather(query) {
    const latitude = '37.8267';
    const longitude = '-122.4233';
    const _URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${latitude},${longitude}`;

    return superagent.get(_URL);
        // .then(data => {
        //     let weather = new weather(data.body.results[0]);
        // });
}

// Constructors
function Location(data) {
    this.formatted_query = data.formatted_address;
    this.latitude = data.geometry.location.lat;
    this.longitude = data.geometry.location.lng;
}


app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));
