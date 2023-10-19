const AWS = require('aws-sdk');
const config = require('./config/config.js');
const app = require('./app.js');
AWS.config.update(config.aws_remote_config);

const port = process.env.PORT || 3051;
app.listen(port, () => console.log(`listening on port ${port}`));