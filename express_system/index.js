require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');
const app = require('./app');

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 3000;

app.listen(PORT, HOST, () => {
  console.log(`HTTP server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
});

if (process.env.HTTPS_ENABLED === 'true') {
  try {
    const keyPath = process.env.SSL_KEY_PATH || path.join(__dirname, 'key.pem');
    const certPath = process.env.SSL_CERT_PATH || path.join(__dirname, 'cert.pem');
    const credentials = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    const HTTPS_PORT = process.env.HTTPS_PORT || 3443;
    https.createServer(credentials, app).listen(HTTPS_PORT, HOST, () => {
      console.log(`HTTPS server running on https://localhost:${HTTPS_PORT}`);
    });
  } catch (error) {
    console.warn('Failed to start HTTPS server:', error.message);
  }
}
