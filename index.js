const Express = require('express');
const AWS = require('aws-sdk');
const config = require('./config/config.js');
const devices = require('./routes/devices.js');

AWS.config.update(config.aws_remote_config);
const app = Express();

app.use(Express.json());
app.use('/api/devices', devices);

const port = process.env.PORT || 3050;
app.listen(port, () => console.log(`listening on port ${port}`));