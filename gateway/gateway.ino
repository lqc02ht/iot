#include <espnow.h>
#include <ESP8266WiFi.h>
#include "ESPAsyncTCP.h"
#include <Arduino_JSON.h>
#include <PubSubClient.h>

#define BOARD_ID 3
const int mq2AnalogPin = A0;

// Replace with your network credentials (STATION)
const char *ssid = "iotlocal";
const char *password = "ccc123456";

// MQTT Broker
const char *mqtt_broker = "192.168.10.145";
const char *mqtt_username = "hoangndst";
const char *mqtt_password = "Hoang2002";
const int mqtt_port = 1883;

WiFiClient espClient;
PubSubClient client(espClient);

// Define your constants for R0, V (circuit voltage), b, and m
const float R0 = 1945.0;
const float Vc = 3.3; // assuming you are using 3.3V for Vcc
const float b = 1.966;
const float m = -0.505;

float calculateRs(int sensorValue) {
  // Convert the analog value to resistance
  // sensorValue is the analog sensor reading
  float sensorVoltage = sensorValue * (Vc / 1023.0); // Convert sensorValue to voltage
  float Rs = (Vc - sensorVoltage) / sensorVoltage * R0; // Calculate Rs (sensor resistance)
  return Rs;
}


float calculatePPM(float Rs) {
  // Calculate the ppm (parts per million) of CH4
  // Using the equation from the datasheet: ppm = 10^( (log10(Rs/R0) - b) / m )
  return pow(10, ((log10(Rs/R0) - b) / m));
}

// Structure example to receive data
// Must match the sender structure
typedef struct struct_message
{
    int id;
    char macAddress[18];
    int gas;
    float ch4;
} struct_message;

struct_message incomingReadings;

JSONVar board;

// callback function that will be executed when data is received
void OnDataRecv(uint8_t *mac_addr, uint8_t *incomingData, uint8_t len)
{
    // Copies the sender mac address to a string
    char macStr[18];
    Serial.print("Packet received from: ");
    snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
             mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
    Serial.println(macStr);
    memcpy(&incomingReadings, incomingData, sizeof(incomingReadings));

    board["id"] = incomingReadings.id;
    board["macAddress"] = incomingReadings.macAddress;
    board["gas"] = incomingReadings.gas;
    board["ch4"] = incomingReadings.ch4;
    String jsonString = JSON.stringify(board);
    Serial.printf("Board ID %u: %u bytes\n", incomingReadings.id, len);
    Serial.println(jsonString);
    String mqttTopic = "/esp/" + String(incomingReadings.id) + "/gas";
    uint16_t packetIdPub4 = client.publish(mqttTopic.c_str(), jsonString.c_str());
    Serial.printf("Publishing on topic %s at QoS 1, packetId %i: ", mqttTopic, jsonString.c_str());
    Serial.println();
    Serial.printf("------------------------------------");
    Serial.println();
}

void connectToWifi()
{
    // Set the device as a Station and Soft Access Point simultaneously
    WiFi.mode(WIFI_AP_STA);
    pinMode(mq2AnalogPin, INPUT);
    // Set device as a Wi-Fi Station
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(1000);
        Serial.println("Setting as a Wi-Fi Station..");
    }
    Serial.print("MacAdress: ");
    Serial.println(WiFi.macAddress());
    Serial.print("Station IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Wi-Fi Channel: ");
    Serial.println(WiFi.channel());
    Serial.print("ID: ");
    Serial.println(BOARD_ID);
    
}

void callback(char *topic, byte *payload, unsigned int length)
{
    Serial.print("Message arrived in topic: ");
    Serial.println(topic);
    Serial.print("Message:");
    for (int i = 0; i < length; i++)
    {
        Serial.print((char)payload[i]);
    }
    Serial.println();
    Serial.println("-----------------------");
}

void initMqtt()
{
    client.setServer(mqtt_broker, mqtt_port);
    client.setCallback(callback);
    while (!client.connected())
    {
        String client_id = "esp8266-client-";
        client_id += String(WiFi.macAddress());
        Serial.printf("The client %s connects to the public mqtt broker\n", client_id.c_str());
        if (client.connect(client_id.c_str(), mqtt_username, mqtt_password))
        {
            Serial.println("Mqtt broker connected");
        }
        else
        {
            Serial.print("failed with state ");
            Serial.print(client.state());
            delay(2000);
        }
    }
}

void setup()
{
    // Initialize Serial Monitor
    Serial.begin(115200);

    connectToWifi();
    initMqtt();
    // initEspNow();
    // // Set the device as a Station and Soft Access Point simultaneously
    // WiFi.mode(WIFI_AP_STA);

    // // Set device as a Wi-Fi Station
    // WiFi.begin(ssid, password);
    // while (WiFi.status() != WL_CONNECTED) {
    //   delay(1000);
    //   Serial.println("Setting as a Wi-Fi Station..");
    // }
    // Serial.print("MacAdress: ");
    // Serial.println(WiFi.macAddress());
    // Serial.print("Station IP Address: ");
    // Serial.println(WiFi.localIP());
    // Serial.print("Wi-Fi Channel: ");
    // Serial.println(WiFi.channel());

    // Init ESP-NOW
    if (esp_now_init() != 0)
    {
        Serial.println("Error initializing ESP-NOW");
        return;
    }

    esp_now_register_recv_cb(OnDataRecv);
}

unsigned long previousMillis = 0; // Stores last time temperature was published
const long interval = 10000;

void loop()
{
    client.loop();
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval)
    {
        // Save the last time a new reading was published
        previousMillis = currentMillis;

        int sensorValue = analogRead(mq2AnalogPin);
        JSONVar myBoard;
        myBoard["id"] = BOARD_ID;
        myBoard["macAddress"] = WiFi.macAddress().c_str();
        myBoard["gas"] = sensorValue;
        float rs_var = calculateRs(sensorValue);
        myBoard["ch4"] = calculatePPM(rs_var);
        String jsonString = JSON.stringify(myBoard);
        Serial.println(jsonString);
        String mqttTopic = "/esp/" + String(BOARD_ID) + "/gas";
        uint16_t packetIdPub4 = client.publish(mqttTopic.c_str(), jsonString.c_str());
        Serial.printf("Publishing on topic %s at QoS 1, packetId %i: ", mqttTopic, jsonString.c_str());
        Serial.println();
        Serial.println("------------------------------------");
    }
}