'use strict';

// Set up dependencies
const express = require('express');
const superagent = require('superagent');
const cors = require('cors')

require('dotenv').config();

const PORT = process.env.PORT;
const app = express();

app.use(cors());


// Create routes
app.get('/location', (req, res) => {
    const locationData = getLocation(req.query.data);
    console.log(`In app.get, req.query.data = ${req.query.data}`);
    res.send(locationData);
});


// Helper Functions
function getLocation(query) {
    const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=${process.env.LOCATION_API_KEY}`;
    const geoData = require(query_string);
    const location = new Location(geoData);

    location.search_query = query;
    console.log(`Location.search_query = ${location.search_query}`);
    return location;
}

// Constructors
function Location(data) {
    this.formatted_query = data.formatted_address;
    this.latitude = data.geometry.location.lat;
    this.longitude = data.geometry.location.lng;
}


app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));
