import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { UpdateDateToDB, mongodbClient } from "./mqtt/data.js";
import { makeCall } from "./alert/alert.js";
const app = express();
const port = process.env.PORT || 3000;
const dbName = "random1";
const collectionName = "random1";

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

app.get("/random1", async (req, res) => {
  try {
    await mongodbClient.connect();
    const db = mongodbClient.db(dbName);
    const collection = db.collection(collectionName);
    // Fetch the last 10 documents for the specified sensor type
    const result = await collection.find({ topic: `random1` }).sort({ createdAt: -1 }).limit(20).toArray();
    res.send(result);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data.");
  }
});

async function monitorFireStatus() {
  console.log("Starting fire monitoring...");
  try {
    await mongodbClient.connect();
    const db = mongodbClient.db(dbName);
    const collection = db.collection(collectionName);

    setInterval(async () => {
      try {
        // Lấy 20 dữ liệu gần nhất
        const fireData = await collection.find({}).sort({ createdAt: -1 }).limit(20).toArray();

        if (fireData.length >= 20) {
          const tempValues = fireData.map((data) => data.temperature);
          const fireAnalogValues = fireData.map((data) => data.fire_analog);

          const tempAlert = temperatureAlert(tempValues);
          const fireAlert = fireAlert(fireAnalogValues);

          // Kiểm tra điều kiện phát hiện cháy
          if (tempAlert && fireAlert) {
            const currentTime = Date.now();

            // Kiểm tra nếu đã qua 5 phút (300000ms) kể từ lần gọi cuối
            if (currentTime - lastCallTime >= 300000) {
              console.log("Fire condition detected! Triggering alert...");
              await makeCall();
              lastCallTime = currentTime; // Cập nhật thời gian gọi
            } else {
              console.log("Fire condition detected but call is throttled.");
            }
          }
        }
      } catch (err) {
        console.error("Error while monitoring fire status:", err);
      }
    }, 5000); // Kiểm tra mỗi 5 giây
  } catch (err) {
    console.error("Error setting up fire monitoring:", err);
  }
}
function temperatureAlert(tempValues) {
  const tempAvg = tempValues.reduce((acc, val) => acc + val, 0) / tempValues.length;
  if (tempAvg < 45) {
    return false;
  }

  const maxTemp = Math.max(...tempValues);
  const minTemp = Math.min(...tempValues);

  // Tính trung bình giữa nhiệt độ cao nhất và thấp nhất
  const avgTempThreshold = (maxTemp + minTemp) / 2;

  // Chia dữ liệu thành hai nhóm dựa trên trung bình nhiệt độ
  const highTemps = tempValues.filter((temp) => temp >= avgTempThreshold); // Nhiệt độ lớn hơn hoặc bằng trung bình
  const lowTemps = tempValues.filter((temp) => temp < avgTempThreshold); // Nhiệt độ nhỏ hơn trung bình

  // Tính nhiệt độ trung bình trong mỗi nhóm
  const avgHighTemp = highTemps.reduce((acc, val) => acc + val, 0) / highTemps.length;
  const avgLowTemp = lowTemps.reduce((acc, val) => acc + val, 0) / lowTemps.length;

  // Tính sự thay đổi nhiệt độ trung bình giữa nhóm cao và nhóm thấp
  const tempAvgChange = avgHighTemp - avgLowTemp;

  return tempAvgChange > 20;
}
function fireAlert(fireAnalogValues) {
  const fireAnalogAvg = fireAnalogValues.reduce((acc, val) => acc + val, 0) / fireAnalogValues.length;

  // Nếu giá trị analog trung bình thấp hơn 500, lập tức trả về false
  if (fireAnalogAvg < 500) {
    return false;
  }
  const maxFireAnalog = Math.max(...fireAnalogValues);
  const minFireAnalog = Math.min(...fireAnalogValues);

  // Tính trung bình giữa giá trị analog lớn nhất và nhỏ nhất
  const avgFireAnalogThreshold = (maxFireAnalog + minFireAnalog) / 2;

  // Chia dữ liệu analog thành hai nhóm
  const highFireAnalog = fireAnalogValues.filter((val) => val >= avgFireAnalogThreshold);
  const lowFireAnalog = fireAnalogValues.filter((val) => val < avgFireAnalogThreshold);

  // Tính trung bình giá trị analog cho mỗi nhóm
  const avgHighFireAnalog =
    highFireAnalog.length > 0 ? highFireAnalog.reduce((acc, val) => acc + val, 0) / highFireAnalog.length : 0;

  const avgLowFireAnalog =
    lowFireAnalog.length > 0 ? lowFireAnalog.reduce((acc, val) => acc + val, 0) / lowFireAnalog.length : 0;

  // Tính sự thay đổi trung bình giữa nhóm analog cao và thấp
  const fireAnalogAvgChange = avgHighFireAnalog - avgLowFireAnalog;

  // Kiểm tra sự thay đổi giá trị analog có đáng kể không
  return fireAnalogAvgChange > 200;
}
// Start fire monitoring
monitorFireStatus();

UpdateDateToDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
