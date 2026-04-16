import { showToast } from "../main/ui/toast";

export function logUI(msg: string, toast = false) {
  console.log("[LOG]", msg);

  const el = document.getElementById("transcript");
  if (el) {
    const div = document.createElement("div");
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    el.appendChild(div);
    el.scrollTop = el.scrollHeight;
  }

  if (toast) {
    showToast(msg);
  }
}
