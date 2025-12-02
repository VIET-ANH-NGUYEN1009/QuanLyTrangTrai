// ================== Cập nhật thời gian ==================
function updateTime() {
  const now = new Date();
  const day = now.toLocaleDateString("vi-VN", { weekday: "long" });
  const date = now.toLocaleDateString("vi-VN");
  const time = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  if (dateEl) dateEl.innerText = `${day} - ${date}`;
  if (timeEl) timeEl.innerText = time;
}
setInterval(updateTime, 1000);
updateTime();

// ================== Biến trạng thái ==================
let lightOn = false;
let fanOn   = false;

const btnLight  = document.getElementById("btn-light");
const btnFan    = document.getElementById("btn-fan");

const iconLight = document.getElementById("icon-light");
const iconFan   = document.getElementById("icon-fan");

const tempEl    = document.getElementById("temp");
const humiEl    = document.getElementById("humi");

// ================== URL API backend ==================
const API_BASE_URL = "https://api-quan-ly-trang-trai.onrender.com";

// ================== Hàm cập nhật giao diện ==================
function updateUI(data) {
  // Cảm biến
  if (data.sensor) {
    if (tempEl) tempEl.innerText = `${data.sensor.temp}°C`;
    if (humiEl) humiEl.innerText = `${data.sensor.hum}%`;
  }

  // Thiết bị
  if (data.devices) {
    lightOn = data.devices.led || false;
    fanOn   = data.devices.fan || false;

    // Đèn
    if (btnLight) {
      btnLight.innerText = lightOn ? "Tắt đèn" : "Bật đèn";
      btnLight.className = lightOn ? "btn-on" : "btn-off";
    }
    if (iconLight) iconLight.style.color = lightOn ? "#ffeb3b" : "#777";

    // Quạt
    if (btnFan) {
      btnFan.innerText = fanOn ? "Tắt quạt" : "Bật quạt";
      btnFan.className = fanOn ? "btn-on" : "btn-off";
    }
    if (iconFan) iconFan.style.color = fanOn ? "#1c75ff" : "#777";
  }
}

// ================== Lấy trạng thái từ server ==================
async function fetchStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    updateUI(data);
  } catch (error) {
    console.error("❌ Lỗi lấy trạng thái:", error);
  }
}

// ================== Gửi lệnh điều khiển ==================
async function sendControl(device, action) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/control`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, action }),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("📤 Đã gửi lệnh:", device, action);

    if (data.success) setTimeout(fetchStatus, 200);
  } catch (error) {
    console.error("❌ Lỗi gửi lệnh:", error);
  }
}

// ================== Gắn sự kiện nút ==================
if (btnLight) {
  btnLight.onclick = () => {
    const newState = !lightOn;
    sendControl("led", newState ? "on" : "off");
  };
}

if (btnFan) {
  btnFan.onclick = () => {
    const newState = !fanOn;
    sendControl("fan", newState ? "on" : "off");
  };
}

// ================== Khởi động ==================
setInterval(fetchStatus, 3000);
fetchStatus();
