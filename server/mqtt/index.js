import * as mqtt from "mqtt";
import dotenv from "dotenv";
dotenv.config();

const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
export const mqttClient = mqtt.connect(
  `mqtt://${process.env.MQTT_SERVER}:${process.env.MQTT_PORT}`,
  {
    clientId,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
  }
);

const topic = [1, 2, 3];

mqttClient.on('connect', () => {
  topic.forEach((t) => {
    console.log(`Subscribing to topic: /esp/${t}/gas`);
    mqttClient.subscribe(`/esp/${t}/gas`);
  });
})

// Handle errors
mqttClient.on('error', (err) => {
  console.error('MQTT error:', err);
});

// Handle MQTT disconnection
mqttClient.on('close', () => {
  console.log('MQTT connection closed. Reconnecting...');
  mqttClient.reconnect();
});

