import { MongoClient } from "mongodb";
import { mqttClient } from "./index.js";

const mongoUrl = process.env.MONGODB_URL;

const dbName = "esp-gas";
const collectionName = "esp-gas-collection";

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
      console.log("Inserted documents =>", result);
      console.log("Data: ", data, "Time: ", new Date().toLocaleString());
    } catch (err) {
      console.error(err);
    }
  });
};
