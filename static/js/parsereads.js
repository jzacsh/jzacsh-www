'use strict';

function parseCsv(url) {
  return new Promise((resolve, reject)  => {
    // see https://www.papaparse.com/docs#config
    const papaParseConfig = {
      delimeter: ',',
      download: true, // indicates this will be a URL, not a string of CSV
      header: true,
      worker: true,
      complete: results => resolve(results),
      error: (error, file) => reject({error, file}),
    };
    Papa.parse(url, papaParseConfig);
  });
}

function main() {
  const csvUrl = 'https://jzacsh.keybase.pub/readlog/goodreads.csv';

  parseCsv(csvUrl).then(data => {
    throw new Error('not yet implemented; but got', data); // TODO
  });
}

window.addEventListener('DOMContentLoaded', main)

