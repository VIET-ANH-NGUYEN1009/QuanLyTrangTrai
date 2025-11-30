// Cập nhật thời gian
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

// Trạng thái thiết bị
let lightOn = false;
let fanOn = false;

const btnLight = document.getElementById("btn-light");
const btnFan = document.getElementById("btn-fan");
const iconLight = document.getElementById("icon-light");
const iconFan = document.getElementById("icon-fan");

// URL API backend trên Render
const API_BASE_URL = "https://api-quan-ly-trang-trai.onrender.com";

// Lấy trạng thái từ server
async function fetchStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/status`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    // Cập nhật cảm biến
    if (data.sensor) {
      document.getElementById("temp").innerText = `${data.sensor.temp}°C`;
      document.getElementById("humi").innerText = `${data.sensor.hum}%`;
    }

    // Cập nhật trạng thái thiết bị
    if (data.devices) {
      lightOn = data.devices.led || false;
      fanOn = data.devices.fan || false;

      btnLight.innerText = lightOn ? "Tắt đèn" : "Bật đèn";
      btnLight.className = lightOn ? "btn-on" : "btn-off";
      iconLight.style.color = lightOn ? "#ffeb3b" : "#777";

      btnFan.innerText = fanOn ? "Tắt quạt" : "Bật quạt";
      btnFan.className = fanOn ? "btn-on" : "btn-off";
      iconFan.style.color = fanOn ? "#1c75ff" : "#777";
    }

    return data;
  } catch (error) {
    console.error("❌ Lỗi lấy trạng thái:", error);
  }
}

// Gửi lệnh điều khiển
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

    if (data.success) setTimeout(fetchStatus, 100);
    return data;
  } catch (error) {
    console.error("❌ Lỗi gửi lệnh:", error);
  }
}

// Gắn sự kiện nút
btnLight.onclick = () => {
  const newState = !lightOn;
  sendControl("led", newState ? "on" : "off");
};

btnFan.onclick = () => {
  const newState = !fanOn;
  sendControl("fan", newState ? "on" : "off");
};

// Khởi động lấy trạng thái
setInterval(fetchStatus, 2000);
fetchStatus();
