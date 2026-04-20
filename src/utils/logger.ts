import { showToast } from "../main/ui/toast";

export function logUI(msg: string, toast = false) {
  console.log("[LOG]", msg);

  const el = document.getElementById("transcript");
  if (el) {
    const time = new Date().toLocaleTimeString();

  const line = document.createElement("div");

  line.className = "row";

  // 色分け

  if (msg.includes("ERR") || msg.includes("ERROR")) {

    line.style.color = "red";

  } else if (msg.includes("LOG")) {

    line.style.color = "gray";

  }

  line.textContent = `[${time}] ${msg}`;

  el.appendChild(line);

  el.scrollTop = el.scrollHeight;
  }

  if (toast) {
    showToast(msg);
  }
}
