const fs = require('fs');
const fetch = require('node-fetch'); // eslint-disable-line
const borocds = require('./borocds');

const configName = process.argv[2];

const configPath = `./config/${configName}`;
const getSQL = require(configPath); // eslint-disable-line

let i = 0;

const outputPath = `./data/${configName}`;

if (!fs.existsSync(outputPath)) {
  fs.mkdirSync(outputPath);
}

const cartoUser = 'cpp';
const cartoDomain = 'cartoprod.capitalplanning.nyc';

const buildSqlUrl = (cleanedQuery, type = 'json') => { // eslint-disable-line
  return `https://${cartoDomain}/user/${cartoUser}/api/v2/sql?q=${cleanedQuery}&format=${type}`;
};

function getCDData(borocd) {
  const sql = getSQL(borocd);
  const cleanedQuery = sql.replace('\n', '');
  const url = buildSqlUrl(cleanedQuery);

  console.log(`fetching data for borocd ${borocd}...`);  // eslint-disable-line
  fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
    })
    .then((json) => {
      console.log(`Received! Writing JSON to ${outputPath}/${borocd}.json`);  // eslint-disable-line
      const data = json.rows;
      fs.writeFileSync(`${outputPath}/${borocd}.json`, JSON.stringify(data));
      if (i < borocds.length - 1) {
        i += 1;
        getCDData(borocds[i]);
      }
    });
}

getCDData(borocds[i]);
