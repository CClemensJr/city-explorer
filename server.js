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
    res.send(locationData);
});


// Helper Functions
function getLocation(query) {
    const _URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.LOCATION_API_KEY}`;

    return superagent.get(_URL)
        .then(data => {
            let location = new Location(data);
            location.search_query = query;

            return location;
        })

}

// Constructors
function Location(data) {
    this.formatted_query = data.formatted_address;
    this.latitude = data.geometry.location.lat;
    this.longitude = data.geometry.location.lng;
}


app.listen(PORT, () => console.log(`App is running on PORT: ${PORT}`));
