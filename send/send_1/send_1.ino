#include <espnow.h>
#include <ESP8266WiFi.h>

#define BOARD_ID 1
const int mq2AnalogPin = A0;
// MAC Address of the receiver
// A4:E5:7C:B7:E5:9C-node2
// node1 send to node 2

// Define your constants for R0, V (circuit voltage), b, and m
const float R0 = 1945.0;
const float Vc = 3.3; // assuming you are using 3.3V for Vcc
const float b = 1.966;
const float m = -0.505;

uint8_t broadcastAddress[] = {0xA4, 0xE5, 0x7C, 0xB7, 0xE5, 0x9C};

// Structure example to send data
// Must match the receiver structure
typedef struct struct_message
{
  int id;
  char macAddress[18];
  int gas;
  float ch4;
} struct_message;

// Create a struct_message called myData
struct_message myData;

unsigned long previousMillis = 0; // Stores last time temperature was published
const long interval = 10000;      // Interval at which to publish sensor readings

unsigned int readingId = 0;

// Insert your SSID
constexpr char WIFI_SSID[] = "iotlocal";

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

int32_t getWiFiChannel(const char *ssid)
{
  if (int32_t n = WiFi.scanNetworks())
  {
    for (uint8_t i = 0; i < n; i++)
    {
      if (!strcmp(ssid, WiFi.SSID(i).c_str()))
      {
        return WiFi.channel(i);
      }
    }
  }
  return 0;
}

// Callback when data is sent
void OnDataSent(uint8_t *mac_addr, uint8_t sendStatus)
{
  Serial.print("Last Packet Send Status: ");
  if (sendStatus == 0)
  {
    Serial.println("Delivery success");
  }
  else
  {
    Serial.println("Delivery success");
  }
}

struct_message incomingReadings;
// callback function that will be executed when data is received
void OnDataRecv(uint8_t * mac_addr, uint8_t *incomingData, uint8_t len) { 
  // Copies the sender mac address to a string
  char macStr[18];
  Serial.print("Packet received from: ");
  snprintf(macStr, sizeof(macStr), "%02x:%02x:%02x:%02x:%02x:%02x",
           mac_addr[0], mac_addr[1], mac_addr[2], mac_addr[3], mac_addr[4], mac_addr[5]);
  Serial.println(macStr);
  memcpy(&incomingReadings, incomingData, sizeof(incomingReadings));
  Serial.printf("Board ID %u: %u bytes\n", incomingReadings.id, len);
  esp_now_send(broadcastAddress, (uint8_t *)&incomingReadings, sizeof(incomingReadings));
  Serial.printf("------------------------------------");
  Serial.println();
}

void setup()
{
  // Init Serial Monitor
  Serial.begin(115200);
  pinMode(mq2AnalogPin, INPUT);
  // Set device as a Wi-Fi Station and set channel
  WiFi.mode(WIFI_STA);

  int32_t channel = getWiFiChannel(WIFI_SSID);

  WiFi.printDiag(Serial); // Uncomment to verify channel number before
  wifi_promiscuous_enable(1);
  wifi_set_channel(channel);
  wifi_promiscuous_enable(0);
  WiFi.printDiag(Serial); // Uncomment to verify channel change after
  Serial.print("MacAddress: ");
  Serial.println(WiFi.macAddress());
  Serial.print("ID: ");
  Serial.println(BOARD_ID);
  // Init ESP-NOW
  if (esp_now_init() != 0)
  {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_set_self_role(ESP_NOW_ROLE_CONTROLLER);

  esp_now_register_send_cb(OnDataSent);
  esp_now_register_recv_cb(OnDataRecv);

  esp_now_add_peer(broadcastAddress, ESP_NOW_ROLE_SLAVE, 1, NULL, 0);
}

void loop()
{
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval)
  {
    int sensorValue = analogRead(mq2AnalogPin);
    // Save the last time a new reading was published
    previousMillis = currentMillis;
    myData.id = BOARD_ID;
    strcpy(myData.macAddress,WiFi.macAddress().c_str());
    myData.gas = sensorValue;
    float rs_var = calculateRs(sensorValue);
    myData.ch4 = calculatePPM(rs_var);
    esp_now_send(broadcastAddress, (uint8_t *)&myData, sizeof(myData));
  }
}
