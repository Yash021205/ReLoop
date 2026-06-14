const { GetCommand, PutCommand, ScanCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { dynamo } = require('./dynamo');

async function getItem(tableName, id) {
  const { Item } = await dynamo.send(new GetCommand({ TableName: tableName, Key: { id } }));
  return Item || null;
}

async function scanTable(tableName) {
  const { Items = [] } = await dynamo.send(new ScanCommand({ TableName: tableName }));
  return Items;
}

async function putItem(tableName, item) {
  await dynamo.send(new PutCommand({ TableName: tableName, Item: item }));
  return item;
}

async function deleteItem(tableName, id) {
  await dynamo.send(new DeleteCommand({ TableName: tableName, Key: { id } }));
  return { id };
}

async function updateItem(tableName, id, values) {
  const entries = Object.entries(values).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return getItem(tableName, id);

  const names = {};
  const attrs = {};
  const sets = entries.map(([key, value], index) => {
    const nameKey = `#k${index}`;
    const valueKey = `:v${index}`;
    names[nameKey] = key;
    attrs[valueKey] = value;
    return `${nameKey} = ${valueKey}`;
  });

  const { Attributes } = await dynamo.send(new UpdateCommand({
    TableName: tableName,
    Key: { id },
    UpdateExpression: `set ${sets.join(', ')}`,
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: attrs,
    ReturnValues: 'ALL_NEW',
  }));

  return Attributes;
}

function byDateDesc(items) {
  return [...items].sort((a, b) => String(b.date || b.createdAt || '').localeCompare(String(a.date || a.createdAt || '')));
}

module.exports = {
  getItem,
  putItem,
  deleteItem,
  scanTable,
  updateItem,
  byDateDesc,
};
