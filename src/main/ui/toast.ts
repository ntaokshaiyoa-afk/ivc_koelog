let toastEl: HTMLElement | null = null;

export function initToast() {
  toastEl = document.createElement("div");
  toastEl.id = "toast";
  document.body.appendChild(toastEl);

  const style = document.createElement("style");
  style.textContent = `
    #toast {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: #333;
      color: white;
      padding: 10px 16px;
      border-radius: 20px;
      opacity: 0;
      transition: 0.3s;
      z-index: 9999;
    }
    #toast.show {
      opacity: 1;
    }
  `;
  document.head.appendChild(style);
}

export function showToast(msg: string, duration = 2000) {
  if (!toastEl) return;

  toastEl.textContent = msg;
  toastEl.classList.add("show");

  setTimeout(() => {
    toastEl?.classList.remove("show");
  }, duration);
}
