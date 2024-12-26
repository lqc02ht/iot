import { MongoClient } from "mongodb";
import { mqttClient } from "./index.js";

const mongoUrl = process.env.MONGODB_URL;

const dbName = "random1";
const collectionName = "random1";

export const mongodbClient = new MongoClient(mongoUrl);

export const UpdateDateToDB = () => {
  mqttClient.on("message", async (topic, message) => {
    const data = JSON.parse(message.toString());
    try {
      await mongodbClient.connect();
      const db = mongodbClient.db(dbName);
      const collection = db.collection(collectionName);
      const result = await collection.insertOne({
        topic,
        ...data,
        createdAt: new Date(),
      });
    } catch (err) {
      console.error(err);
    }
  });
};
