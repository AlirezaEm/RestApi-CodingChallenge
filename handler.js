'use strict';
const app = require ('./app.js');
const serverless = require('serverless-http');
module.exports.server = app.server;
module.exports.hello = serverless(app);

