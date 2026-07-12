const http = require('https');

const data = JSON.stringify([]);

const options = {
  hostname: 'jsonblob.com',
  port: 443,
  path: '/api/jsonBlob',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, res => {
  console.log('Location:', res.headers.location);
});

req.write(data);
req.end();
