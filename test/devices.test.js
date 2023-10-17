const request = require('supertest');
const express = require('express');
const app = express();
const myRoutes = require('../routes/devices.js');

app.use(express.json()); // Add JSON body parsing middleware
app.use('/api/devices', myRoutes);

// Mock the AWS.DynamoDB.DocumentClient
jest.mock('aws-sdk', () => {
  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => ({
        get: jest.fn().mockImplementation((params) => {
          if (params.Key.id === '123') {
            return {
              promise: jest.fn().mockResolvedValue({
                Item: {
                  id: '123',
                  deviceModel: 'Device Model',
                  name: 'Device Name',
                  note: 'Device Note',
                  serial: 'Device Serial',
                },
              }),
            };
          } else if (params.Key.id === 'invalid22') {
            return {
              promise: jest.fn().mockResolvedValue({ 
                Item:  {
                  id: 'invalid22',
                  deviceModel: 'Device Model',
                  nameErr: 'Device Name'
                },
              }),
            };
          } else {
            return {
              promise: jest.fn().mockResolvedValue({ Item: null }),
            };
          }
        }),
        put: jest.fn().mockImplementation((params) => {
          if (params.Item.id === 'errTest') {
            throw new Error('Simulated DynamoDB error');
          }
          return { promise: jest.fn().mockResolvedValue({}) };
        }),
      })),
    },
  };
});

describe('GET /api/devices/:id', () => {
  it('should return the item with a valid ID', async () => {
    const response = await request(app).get('/api/devices/123');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: '123',
      deviceModel: 'Device Model',
      name: 'Device Name',
      note: 'Device Note',
      serial: 'Device Serial',
    });
  });

  it('should return a 400 Bad Request for invalid data', async () => {
    const response = await request(app).get('/api/devices/invalid22');
    expect(response.status).toBe(400);
  });

  it('should return a 404 Not Found for a not existing data', async () => {
    const response = await request(app).get('/api/devices/456');
    expect(response.status).toBe(404);
  });

});

describe('POST /api/devices', () => {
  it('should create a new item with valid data', async () => {
    const newItem = {
      id: 'new123',
      deviceModel: 'New Device Model',
      name: 'New Device Name',
      note: 'New Device Note',
      serial: 'New Device Serial',
    };

    const response = await request(app)
      .post('/api/devices')
      .send(newItem);

    expect(response.status).toBe(201); // Return 201 for successful creation
    expect(response.text).toBe('Created successfully');
  });

  it('should return a 400 Bad Request for invalid Post data with missing fields', async () => {
    const invalidItem = {
      id: 'invalid123', // The other fields are intentionally missing
    };

    const response = await request(app)
      .post('/api/devices')
      .send(invalidItem);

    expect(response.status).toBe(400); // Return 400 for bad requests
  });

  it('should return a 400 Bad Request for invalid Post data with wrong value type', async () => {
    const invalidItem = {
      id: 'new123',
      deviceModel: 'New Device Model',
      name: 35277, // The name field should be a string
      note: 'New Device Note',
      serial: 'New Device Serial',
    };

    const response = await request(app)
      .post('/api/devices')
      .send(invalidItem);

    expect(response.status).toBe(400); // Return 400 for bad requests
  });

  it('should return a 500 Internal Server Error for DB internal error', async () => {
    const newItem = {
      id: 'errTest',
      deviceModel: 'New Device Model',
      name: 'New Device Name',
      note: 'New Device Note',
      serial: 'New Device Serial',
    };

    const response = await request(app)
      .post('/api/devices')
      .send(newItem);

    expect(response.status).toBe(500); // Return 500 for Internal Server Error
  });
});
