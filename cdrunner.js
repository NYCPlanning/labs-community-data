const fs = require('fs');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // eslint-disable-line
const FormData = require('form-data');
const borocds = require('./borocds');
const Headers = fetch.Headers;
const configName = process.argv[2];

const configPath = `./config/${configName}`;
const getSQL = require(configPath); // eslint-disable-line

dotenv.load();

let i = 0;

const outputPath = `./data/${configName}`;

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

const cartoUser = 'data';
const cartoDomain = 'carto.planninglabs.nyc';
const url = `https://${cartoDomain}/user/${cartoUser}/api/v2/sql/job?api_key=${process.env.CARTO_API_KEY}`;

const buildSqlUrl = (cleanedQuery, type = 'json') => { // eslint-disable-line
  return `https://${cartoDomain}/user/${cartoUser}/api/v2/sql?q=${cleanedQuery}&format=${type}`;
};

const buildJobOptions = (query) => {
  const body = JSON.stringify({query});

  const headers = new Headers({
    "content-type": "application/json"
  });

  return {
    method: "POST",
    headers,
    body
  };
}

function getCDData(borocd) {
  const sql = getSQL(borocd);
  const cleanedQuery = sql.replace('\n', '');
  const options = buildJobOptions(cleanedQuery);

  console.log(`fetching data for borocd ${borocd}...`);  // eslint-disable-line

  fetch(url, options)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }

      throw new Error(`Network response was not ok. ${response.status} ${response.statusText}`);
    })
    .then((json) => {
      console.log(`Received! Writing JSON to ${outputPath}/${borocd}.json`);  // eslint-disable-line
      fetch(`https://carto.planninglabs.nyc/user/data/api/v2/sql?api_key=${process.env.CARTO_API_KEY}&q=select%20*%20%20from%20job_result`).then(response => {
        return response.json();
      })
      .then(json => {
        const data = json.rows;

        fs.writeFileSync(`${outputPath}/${borocd}.json`, JSON.stringify(data));
        if (i < borocds.length - 1) {
          i += 1;
          getCDData(borocds[i]);
        }
      });
    })
    .catch(function(error) {
      console.log(`There has been a problem with your fetch operation: ${error.message}`);
    });
}

getCDData(borocds[i]);
