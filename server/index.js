import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { UpdateDateToDB, mongodbClient } from "./mqtt/data.js";
const { makeCall } = require("./alerts/alert");

const app = express();
const port = process.env.PORT || 3000;
const dbName = "esp-fire";
const collectionName = "esp-fire-collection";

app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Hello, this is IoT app!");
});

// app.get('/esp/:id/gas', async (req, res) => {
//   const { id } = req.params;
//   try {
//     await mongodbClient.connect();
//     const db = mongodbClient.db(dbName);
//     const collection = db.collection(collectionName);
//     // get the last 10 documents
//     const result = await collection.find({ topic: `/esp/${id}/gas` }).sort({ createdAt: -1 }).limit(10).toArray();
//     res.send(result);
//   } catch (err) {
//     console.error(err);
//   }
// });

app.get("/esp/:id/:sensorType", async (req, res) => {
  const { id, sensorType } = req.params;
  try {
    await mongodbClient.connect();
    const db = mongodbClient.db(dbName);
    const collection = db.collection(collectionName);
    // Fetch the last 10 documents for the specified sensor type
    const result = await collection
      .find({ topic: `/esp/${id}/${sensorType}` })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data.");
  }
});

// Background fire monitoring
async function monitorFireStatus() {
  console.log("Starting fire monitoring...");
  try {
    await mongodbClient.connect();
    const db = mongodbClient.db(dbName);
    const collection = db.collection(collectionName);

    setInterval(async () => {
      try {
        // Lấy 10 dữ liệu gần nhất
        const fireData = await collection
          .find({})
          .sort({ createdAt: -1 })
          .limit(10)
          .toArray();

        if (fireData.length >= 10) {
          const tempValues = fireData.map(data => data.temperature);
          const fireAnalogValues = fireData.map(data => data.fire_analog);

          // Kiểm tra sự thay đổi trong nhiệt độ
          const tempChange = tempValues[tempValues.length - 1] - tempValues[0];
          const fireAnalogChange = fireAnalogValues[fireAnalogValues.length - 1] - fireAnalogValues[0];

          // Kiểm tra xu hướng tăng dần hoặc thay đổi lớn
          const isSignificantTempChange = Math.abs(tempChange) > 15; // Thay đổi > 15 độ
          const isSignificantFireChange = Math.abs(fireAnalogChange) > 200; // Thay đổi > 200 giá trị

          if (isSignificantTempChange || isSignificantFireChange) {
            console.log("Significant change detected in last 10 records! Triggering alert...");
            await makeCall("Cảnh báo, đang có cháy. Vui lòng kiểm tra ngay!");
          }
        }
      } catch (err) {
        console.error("Error while monitoring fire status:", err);
      }
    }, 10000); // Kiểm tra mỗi 10 giây
  } catch (err) {
    console.error("Error setting up fire monitoring:", err);
  }
}


// Start fire monitoring
monitorFireStatus();

UpdateDateToDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
