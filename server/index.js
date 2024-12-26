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
  let lastCallTime = Date.now(); // Thời gian lần gọi cuối
  let lastTemp = null; // Lưu nhiệt độ lần kiểm tra trước

  try {
    await mongodbClient.connect();
    const db = mongodbClient.db(dbName);
    const collection = db.collection(collectionName);

    setInterval(async () => {
      try {
        // Lấy 50 dữ liệu gần nhất
        const fireData = await collection.find({}).sort({ createdAt: -1 }).limit(10).toArray();

        if (fireData.length > 0) {
          const tempValues = fireData.map((data) => data.temperature);
          const fireAnalogValues = fireData.map((data) => data.fire_analog);

          // Kiểm tra điều kiện nhiệt độ và fire analog
          const tempAlert = temperatureAlert(tempValues, lastTemp);
          const fireAlert = fireAlertFunc(fireAnalogValues);
          console.log("Alert temperature:", tempAlert);
          // Nếu cả hai điều kiện đều đạt, thực hiện gọi
          if (fireAlert && tempAlert) {
            const currentTime = Date.now();

            // Kiểm tra nếu đã qua 30 giây kể từ lần gọi cuối
            if (currentTime - lastCallTime >= 30000) {
              console.log("Fire condition detected! Triggering alert...");
              await makeCall();
              lastCallTime = currentTime; // Cập nhật thời gian gọi
              lastTemp = tempValues[0]; // Cập nhật nhiệt độ cuối cùng
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
  if (tempValues.length < 10) return false; // Không đủ dữ liệu để tính toán

  // Tính sự thay đổi nhiệt độ giữa các giá trị liên tiếp
  const deltas = [];
  for (let i = 1; i < tempValues.length; i++) {
    deltas.push(tempValues[i] - tempValues[i - 1]);
  }
  // Kiểm tra nếu các giá trị delta tăng dần
  const isTempIncreasing = deltas.every((delta, index) => index === 0 || delta + 0.1 >= deltas[index - 1]);

  // Tính tổng độ lệch (delta) để xem biến động có đáng kể không
  const diffTemp = Math.max(...tempValues) - Math.min(...tempValues);
  console.log("Temperature increasing:", isTempIncreasing);
  console.log("Change in temperature:", diffTemp);
  // Kiểm tra nếu tổng độ lệch vượt ngưỡng (ví dụ: 30) và delta tăng dần
  return isTempIncreasing && diffTemp >= 0.5;
}

function fireAlertFunc(fireAnalogValues) {
  // Kiểm tra nếu bất kỳ giá trị nào trong fire_analog <= 200
  return fireAnalogValues.some((value) => value <= 200);
}

// Start fire monitoring
monitorFireStatus();

UpdateDateToDB();

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
