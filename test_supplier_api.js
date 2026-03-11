const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/suppliers',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`狀態碼: ${res.statusCode}`);
  console.log(`狀態訊息: ${res.statusMessage}`);
  console.log('響應標頭:', res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('響應內容:');
    try {
      const jsonData = JSON.parse(data);
      console.log(JSON.stringify(jsonData, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (error) => {
  console.error('請求錯誤:', error);
});

req.end();