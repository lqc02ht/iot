import * as mqtt from "mqtt";
import dotenv from "dotenv";
dotenv.config();

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
export const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_SERVER}:${process.env.MQTT_PORT}`, {
  clientId,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
});

const topic = "random1";

mqttClient.on("connect", () => {
  console.log(`Subscribing to topic: ${topic}`);
  mqttClient.subscribe(topic);
});

// Handle errors
mqttClient.on("error", (err) => {
  console.error("MQTT error:", err);
});

// Handle MQTT disconnection
mqttClient.on("close", () => {
  console.log(process.env.MQTT_USERNAME);
  console.log(process.env.MQTT_PASSWORD);
  console.log("MQTT connection closed. Reconnecting...");
  mqttClient.reconnect();
});
