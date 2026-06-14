const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');

const region = process.env.AWS_REGION || 'ap-south-1';
const endpoint = process.env.DYNAMODB_ENDPOINT;

const clientConfig = { region };

if (endpoint) {
  clientConfig.endpoint = endpoint;
}

if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
} else if (endpoint) {
  clientConfig.credentials = {
    accessKeyId: 'fakeMyKeyId',
    secretAccessKey: 'fakeSecretAccessKey',
  };
}

const client = new DynamoDBClient(clientConfig);

const dynamo = DynamoDBDocumentClient.from(client);

module.exports = { dynamo, client };
