import express from "express";
import bodyParser from 'body-parser';
import cors from 'cors';
import { UpdateDateToDB, mongodbClient } from "./mqtt/data.js";

const app = express();
const port = process.env.PORT || 3000;
const dbName = "esp-gas";
const collectionName = "esp-gas-collection";

app.use(cors());
app.use(bodyParser.json())

// Routes
app.get('/', (req, res) => {
  res.send('Hello, this is IoT app!');
});

app.get('/esp/:id/gas', async (req, res) => {
  const { id } = req.params;
  try {
    await mongodbClient.connect();
    const db = mongodbClient.db(dbName);
    const collection = db.collection(collectionName);
    // get the last 10 documents
    const result = await collection.find({ topic: `/esp/${id}/gas` }).sort({ createdAt: -1 }).limit(10).toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
  }
});

UpdateDateToDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});