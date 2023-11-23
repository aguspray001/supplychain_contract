const mqtt = require("mqtt");
const { performance } = require("perf_hooks");
// controller
const { storeData, getData } = require("./src/controller/dhtLoRa");
// MQTT broker details
const brokerUrl = "ws://103.106.72.182:8885";
const clientId = "mqtt-client";
const dhtTopic = "/lora/dht";
// Create MQTT client with WebSocket transport
const options = {
  clientId,
  transport: "websocket",
};

const client = mqtt.connect(brokerUrl, options);

const subscibeToTopic = () => {
  client.subscribe(dhtTopic, { qos: 2 }, (err) => {
    if (err) {
      console.error("Error subscribing to topic:", err);
    } else {
      console.log("Subscribed to topic");
    }
  });
}

// // Callbacks for MQTT events
// client.on("connect", () => {
//   console.log("Connected to MQTT broker");
// });
let isProcessing = false;

subscibeToTopic();

client.on("message", async (topic, message) => {
  if(!isProcessing){
    isProcessing = true;

    let payload = message.toString();
    const privateKey = "0x" + "8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63";
    if (payload !== null || payload !== undefined) {
      const data = JSON.parse(payload);
      // console.log(data);
      const txPayload = {
        nodeID: data.nodeID,
        gatewayID: data.gatewayID,
        data: data.data,
        unixtime: data.unixtime,
      };
  
      var startTime = performance.now();
      // Subscribe to a topic with QoS 2
      const storedData = await storeData(txPayload, privateKey);
      // client.unsubscribe(dhtTopic);
      isProcessing = false; //change processing to false if process is finish
      var endTime = performance.now();
      console.log(`${endTime - startTime}`);
    }
  }
});
