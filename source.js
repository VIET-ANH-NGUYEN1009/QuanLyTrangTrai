// server.js
const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();
const port = 3000;

// Trạng thái thiết bị
let devices = {
  fan: false,
  led: false,
  pump: false,
  temp: 0,
  hum: 0,
  ldr: 0,
};

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== API điều khiển thiết bị =====
// Quạt
app.get("/fan/on", (req, res) => {
  devices.fan = true;
  console.log("Fan ON");
  res.send("Fan ON");
});
app.get("/fan/off", (req, res) => {
  devices.fan = false;
  console.log("Fan OFF");
  res.send("Fan OFF");
});

// LED
app.get("/led/on", (req, res) => {
  devices.led = true;
  console.log("LED ON");
  res.send("LED ON");
});
app.get("/led/off", (req, res) => {
  devices.led = false;
  console.log("LED OFF");
  res.send("LED OFF");
});

// Bơm
app.get("/pump/on", (req, res) => {
  devices.pump = true;
  console.log("Pump ON");
  res.send("Pump ON");
});
app.get("/pump/off", (req, res) => {
  devices.pump = false;
  console.log("Pump OFF");
  res.send("Pump OFF");
});

// ===== API nhận dữ liệu từ ESP32 =====
app.post("/api/sensor", (req, res) => {
  try {
    const { temp, hum } = req.body;
    if (typeof temp === "number" && typeof hum === "number") {
      devices.temp = temp;
      devices.hum = hum;
      console.log(`🌡️ Temp: ${temp}°C, 💧 Hum: ${hum}%`);
      res.json({ success: true });
    } else {
      res.status(400).json({ error: "Invalid sensor data" });
    }
  } catch (error) {
    console.error("Error receiving sensor data:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

// API: Lấy trạng thái hiện tại (cho web client)
app.get("/api/status", (req, res) => {
  // LDR vẫn giả lập
  devices.ldr = Math.floor(Math.random() * 2000); // 0-2000

  res.json({
    devices: {
      fan: devices.fan,
      led: devices.led,
      pump: devices.pump,
    },
    sensor: {
      temp: devices.temp,
      hum: devices.hum,
      ldr: devices.ldr,
    },
  });
});

// API: Điều khiển thiết bị (từ web client)
app.post("/api/control", (req, res) => {
  try {
    const { device, action } = req.body;
    if (device === "led" || device === "fan") {
      devices[device] = action === "on";
      console.log(`💡 ${device.toUpperCase()}: ${action.toUpperCase()}`);
      res.json({
        success: true,
        devices: { led: devices.led, fan: devices.fan },
      });
    } else {
      res.status(400).json({ error: "Invalid device" });
    }
  } catch (error) {
    console.error("Error processing control command:", error);
    res.status(400).json({ error: "Invalid request" });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📡 API endpoints:`);
  console.log(` GET /api/status - Lấy trạng thái (web client)`);
  console.log(` POST /api/control - Điều khiển thiết bị (web client)`);
  console.log(` POST /api/sensor - ESP32 gửi nhiệt độ & độ ẩm`);
  console.log(` GET /fan/on - Bật quạt`);
  console.log(` GET /fan/off - Tắt quạt`);
  console.log(` GET /led/on - Bật đèn`);
  console.log(` GET /led/off - Tắt đèn`);
  console.log(` GET /pump/on - Bật bơm`);
  console.log(` GET /pump/off - Tắt bơm\n`);
});
