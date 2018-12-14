DROP TABLE IF EXISTS locations, weathers, yelps, movies, meetups, trails;

CREATE TABLE IF NOT EXISTS locations (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude NUMERIC(8, 6),
    longitude NUMERIC(9, 6)
);

CREATE TABLE IF NOT EXISTS weathers (
    id SERIAL PRIMARY KEY, 
    forecast VARCHAR(255),
    time VARCHAR(255),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS yelps (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    image_url VARCHAR(255),
    price CHAR(5),
    rating NUMERIC(2, 1), 
    url VARCHAR(255),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS movies (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    overview VARCHAR(1000),
    average_votes NUMERIC(4,2),
    total_votes INTEGER,
    image_url VARCHAR(255),
    popularity NUMERIC(6,4),
    released_on CHAR(10),
    created_at BIGINT,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS meetups (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);

CREATE TABLE IF NOT EXISTS trails (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id)
);