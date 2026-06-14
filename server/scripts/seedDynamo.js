require('dotenv').config();

const { CreateTableCommand, DescribeTableCommand, ListTablesCommand } = require('@aws-sdk/client-dynamodb');
const { PutCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo, client } = require('../db/dynamo');
const { products, orders, marketplace, users, returns, config } = require('../data/seedData');

const TABLES = ['Products', 'Orders', 'Marketplace', 'Users', 'Returns', 'Config'];

async function createTableIfNotExists(tableName) {
  const { TableNames = [] } = await client.send(new ListTablesCommand({}));
  if (TableNames.includes(tableName)) {
    console.log(`Table ${tableName} already exists.`);
    await waitForTable(tableName);
    return;
  }

  console.log(`Creating table ${tableName}...`);
  await client.send(new CreateTableCommand({
    TableName: tableName,
    AttributeDefinitions: [{ AttributeName: 'id', AttributeType: 'S' }],
    KeySchema: [{ AttributeName: 'id', KeyType: 'HASH' }],
    BillingMode: 'PAY_PER_REQUEST',
  }));
  await waitForTable(tableName);
  console.log(`Table ${tableName} created and active.`);
}

async function waitForTable(tableName) {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    const { Table } = await client.send(new DescribeTableCommand({ TableName: tableName }));
    if (Table?.TableStatus === 'ACTIVE') return;
    console.log(`Waiting for ${tableName} to become ACTIVE (${Table?.TableStatus || 'unknown'})...`);
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error(`Timed out waiting for ${tableName} to become ACTIVE`);
}

async function seedData(tableName, items) {
  console.log(`Seeding ${items.length} items into ${tableName}...`);
  for (const item of items) {
    await dynamo.send(new PutCommand({ TableName: tableName, Item: item }));
  }
  console.log(`Finished seeding ${tableName}.`);
}

async function main() {
  console.log(`Starting DynamoDB seed in ${process.env.AWS_REGION || 'ap-south-1'}${process.env.DYNAMODB_ENDPOINT ? ` via ${process.env.DYNAMODB_ENDPOINT}` : ''}...`);
  for (const table of TABLES) {
    await createTableIfNotExists(table);
  }

  await seedData('Products', products);
  await seedData('Orders', orders);
  await seedData('Marketplace', marketplace);
  await seedData('Users', users);
  await seedData('Returns', returns);
  await seedData('Config', config);

  console.log('DynamoDB seeding complete.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
