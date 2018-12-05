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
    const locationData = searchToLatLong(req.query.data);
    res.send(locationData);
});


// Helper Functions
function searchToLatLong(query) {
    console.log(`Query = ${query}`);
    const geoData = require('./data/geo.json');
    const location = new Location(geoData.results[0]);

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
