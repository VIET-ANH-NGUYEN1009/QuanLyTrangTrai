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

// Device States
let lightOn = false;
let fanOn = false;

const btnLight = document.getElementById("btn-light");
const btnFan = document.getElementById("btn-fan");
const iconLight = document.getElementById("icon-light");
const iconFan = document.getElementById("icon-fan");

// Light toggle
btnLight.onclick = () => {
  lightOn = !lightOn;
  btnLight.innerText = lightOn ? "Tắt đèn" : "Bật đèn";
  btnLight.className = lightOn ? "btn-on" : "btn-off";
  iconLight.style.color = lightOn ? "#ffeb3b" : "#777";
};

// Fan toggle
btnFan.onclick = () => {
  fanOn = !fanOn;
  btnFan.innerText = fanOn ? "Tắt quạt" : "Bật quạt";
  btnFan.className = fanOn ? "btn-on" : "btn-off";
  iconFan.style.color = fanOn ? "#1c75ff" : "#777";
};
