# labs-community-data
Static data files that power charts on the community profiles site

## Why
Some complex spatial queries were taking a long time to process in real time on [labs-community-portal](https://github.com/NYCPlanning/labs-community-portal).  This repo hosts static JSON files for each community district to power several charts

## How to use
`node cdrunner {id}` will grab a SQL template from `/config/{id}.js`.  The SQL template should have a `${borocd}` placeholder in it.  `cdrunner` will do a carto API call for each `borocd`, and save the response in `data/{id}/{borocd}.json`.

The static JSON files are served by github at `https://raw.githubusercontent.com/NYCPlanning/labs-community-data/master/data/{id}/{borocd}.json`

