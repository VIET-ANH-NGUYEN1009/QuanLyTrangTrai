// URL API backend trên Render
const API_BASE_URL = "https://api-quan-ly-trang-trai.onrender.com";

// Hàm cập nhật giao diện từ dữ liệu backend
function updateUI(data) {
  // Cập nhật cảm biến
  if (data.sensor) {
    if (tempEl) tempEl.innerText = `${data.sensor.temp}°C`;
    if (humiEl) humiEl.innerText = `${data.sensor.hum}%`;
    if (ldrEl)  ldrEl.innerText  = `${data.sensor.ldr}`;
  }

  // Cập nhật trạng thái thiết bị
  if (data.devices) {
    lightOn = data.devices.led || false;
    fanOn   = data.devices.fan || false;
    pumpOn  = data.devices.pump || false;

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

    // Bơm
    if (btnPump) {
      btnPump.innerText = pumpOn ? "Tắt bơm" : "Bật bơm";
      btnPump.className = pumpOn ? "btn-on" : "btn-off";
    }
    if (iconPump) iconPump.style.color = pumpOn ? "#00c853" : "#777";
  }
}

// Kết nối SSE để nhận tín hiệu realtime
function connectSSE() {
  const eventSource = new EventSource(`${API_BASE_URL}/api/status/stream`);

  eventSource.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      updateUI(data);
    } catch (err) {
      console.error("❌ Lỗi parse dữ liệu SSE:", err);
    }
  };

  eventSource.onerror = (err) => {
    console.error("❌ Lỗi SSE:", err);
    eventSource.close();
    // Thử kết nối lại sau 5 giây
    setTimeout(connectSSE, 5000);
  };
}

// Gửi lệnh điều khiển (giữ nguyên như cũ)
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
    return data;
  } catch (error) {
    console.error("❌ Lỗi gửi lệnh:", error);
  }
}

// Gắn sự kiện nút
if (btnLight) {
  btnLight.onclick = () => sendControl("led", !lightOn ? "on" : "off");
}
if (btnFan) {
  btnFan.onclick = () => sendControl("fan", !fanOn ? "on" : "off");
}
if (btnPump) {
  btnPump.onclick = () => sendControl("pump", !pumpOn ? "on" : "off");
}

// Khởi động SSE
connectSSE();
