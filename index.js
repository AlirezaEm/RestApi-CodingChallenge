import  Express  from 'express';
import AWS from "aws-sdk";
import config from "./config/config.js"
import devices from './routes/devices.js'

AWS.config.update(config.aws_remote_config);
const app = Express();

app.use(Express.json());
app.use('/api/devices', devices);

const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`listening on port ${port}`));