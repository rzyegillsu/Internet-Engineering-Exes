// middleware/logger.js
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const accessLogStream = fs.createWriteStream(path.join(__dirname, '..', 'access.log'), { flags: 'a' });
morgan.token('id', () => '-');

const fileLogger = morgan(':id :remote-addr :method :url :status :res[content-length] - :response-time ms', {
  stream: accessLogStream
});
const consoleLogger = morgan('dev');

module.exports = (req, res, next) => {
  consoleLogger(req, res, () => {});
  fileLogger(req, res, next);
};
