const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(process.env.MONGODB_URI);
const dbName = 'nodevault';
const collectionName = 'records';

async function connectDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db(dbName).collection(collectionName);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function addRecord(record) {
  const collection = await connectDB();
  const result = await collection.insertOne({
    ...record,
    createdAt: new Date()
  });
  return { ...record, _id: result.insertedId };
}

async function listRecords() {
  const collection = await connectDB();
  return await collection.find().toArray();
}

async function updateRecord(id, newName, newValue) {
  const collection = await connectDB();
  const result = await collection.updateOne(
    { _id: id },
    { $set: { name: newName, value: newValue, updatedAt: new Date() } }
  );
  return result.modifiedCount > 0;
}

async function deleteRecord(id) {
  const collection = await connectDB();
  const result = await collection.deleteOne({ _id: id });
  return result.deletedCount > 0;
}

module.exports = { addRecord, listRecords, updateRecord, deleteRecord };
