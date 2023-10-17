const { Router } = require("express");
const AWS = require("aws-sdk");
const config = require("../config/config.js");
const joi = require("joi");

const router = Router();

// Define Joi validation schema
const deviceSchema = joi.object({
  id: joi.string().required(),
  deviceModel: joi.string().required(),
  name: joi.string().required(),
  note: joi.string().min(4).required(),
  serial: joi.string().min(4).required(),
});

// GET endpoint to retrieve an item by ID
router.get('/:id', async (req, res) => {
  let docClient = new AWS.DynamoDB.DocumentClient();
  try {
    const params = {
      TableName: config.aws_table_name,
      Key: {
        "id": req.params.id
      }
    };

    const { Item } = await docClient.get(params).promise();

    if (!Item) {
      return res.status(404).send('404 Not Found');
    }

    const { error } = deviceSchema.validate(Item);
    if (error) {
      return res.status(400).send(error.details[0].message + ', The object is not a valid device.');
    }

    return res.send(Item);
  } 
  catch (error) {
    return res.status(500).send(error.message);
  }
});

// POST endpoint to create a new item
router.post('/', async (req, res) => {
  try {
    const { error } = deviceSchema.validate(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message + ', please edit your request.');
    }

    const params = {
      TableName: config.aws_table_name,
      Item: req.body
    };
    let docClient = new AWS.DynamoDB.DocumentClient();
    await docClient.put(params).promise();
    return res.status(201).send('Created successfully');
  } 
  catch (error) {
    return res.status(500).send(error.message);
  }
});

module.exports = router;