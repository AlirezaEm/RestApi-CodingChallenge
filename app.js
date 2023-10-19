const Express = require('express');
const devices = require('./routes/devices.js');

const app = Express();

app.use(Express.json());
app.use('/api/devices', devices);

module.exports = app;