import { Router } from "express"
import AWS from "aws-sdk"
import config from "../config/config.js"
import joi from "joi"

const router = Router()

router.get('/:id', async (req, res) => {
    let docClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: config.aws_table_name ,
        Key: {
            "id": req.params.id
        }
    };
    docClient.get(params, (err, data) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        else {
            if (Object.keys(data).length === 0) {
                return res.status(404).send('404 Not Found');
            }
            return res.send(data.Item);
        }
    });
    
});

router.post('/', async (req, res) => {
    const docClient = new AWS.DynamoDB.DocumentClient();
    const Item = { ...req.body };
    const validateBody = function (device) {
        const schema = joi.object({
          id: joi.string().required(),
          deviceModel: joi.required(),
          name: joi.string().required(),
          note: joi.string().required().min(4),
          serial: joi.string().min(4).required(),
        });
        return schema.validate(device);
    }
    const { error } = validateBody(Item);
    if (error) return res.status(400).send(error.details[0].message + ', please edit your request.');
    let params = {
        TableName: config.aws_table_name,
        Item: Item
    };
    docClient.put(params, (err, data) => {
        if (err) {
           return res.status(500).send(err.message);
        } else {
           return res.status(201).send('Created successfully');
        }
    });
});

export default router;