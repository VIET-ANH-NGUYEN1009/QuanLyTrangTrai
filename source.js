// Update time
function updateTime() {
  const now = new Date();
  const day = now.toLocaleDateString("vi-VN", { weekday: "long" });
  const date = now.toLocaleDateString("vi-VN");
  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  document.getElementById("date").innerText = `${day} - ${date}`;
  document.getElementById("time").innerText = time;
}
setInterval(updateTime, 1000);
updateTime();

// Device States - sẽ được đồng bộ từ server
let lightOn = false;
let fanOn = false;

const btnLight = document.getElementById("btn-light");
const btnFan = document.getElementById("btn-fan");
const iconLight = document.getElementById("icon-light");
const iconFan = document.getElementById("icon-fan");

// Base URL của API - tự động detect và trỏ về backend
const getApiBaseUrl = () => {
  // Nếu đang chạy từ Express server (port 3000), dùng relative URL
  if (window.location.port === "3000") {
    return "";
  }
  // Nếu đang chạy từ Live Server hoặc file://, trỏ về localhost:3000
  return "http://localhost:3000";
};
const API_BASE_URL = getApiBaseUrl();

// Lấy trạng thái từ server
async function fetchStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    
    // Cập nhật dữ liệu cảm biến
    if (data.sensor) {
      document.getElementById("temp").innerText = `${data.sensor.temp}°C`;
      document.getElementById("humi").innerText = `${data.sensor.hum}%`;
    }
    
    // Đồng bộ trạng thái thiết bị từ server
    if (data.devices) {
      lightOn = data.devices.led || false;
      fanOn = data.devices.fan || false;
      
      // Cập nhật UI cho đèn
      btnLight.innerText = lightOn ? "Tắt đèn" : "Bật đèn";
      btnLight.className = lightOn ? "btn-on" : "btn-off";
      iconLight.style.color = lightOn ? "#ffeb3b" : "#777";
      
      // Cập nhật UI cho quạt
      btnFan.innerText = fanOn ? "Tắt quạt" : "Bật quạt";
      btnFan.className = fanOn ? "btn-on" : "btn-off";
      iconFan.style.color = fanOn ? "#1c75ff" : "#777";
    }
    
    return data;
  } catch (error) {
    console.error("❌ Lỗi lấy trạng thái:", error);
  }
}

// Polling để lấy dữ liệu từ server mỗi 2 giây
setInterval(fetchStatus, 2000);
fetchStatus(); // Lấy ngay lần đầu

// Gửi lệnh điều khiển đến server
async function sendControl(device, action) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("📤 Đã gửi lệnh:", device, action);
    
    // Sau khi gửi lệnh, đồng bộ lại trạng thái từ server
    if (data.success) {
      setTimeout(fetchStatus, 100); // Đồng bộ sau 100ms
    }
    
    return data;
  } catch (error) {
    console.error("❌ Lỗi:", error);
  }
}

// Light toggle
btnLight.onclick = () => {
  const newState = !lightOn;
  const action = newState ? "on" : "off";
  sendControl("led", action);
};

// Fan toggle
btnFan.onclick = () => {
  const newState = !fanOn;
  const action = newState ? "on" : "off";
  sendControl("fan", action);
};
