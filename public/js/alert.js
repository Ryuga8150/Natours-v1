// type is success or error

export const hideAlert = () => {
  const el = document.querySelector(".alert");

  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, mssg, time = 7) => {
  hideAlert();
  const markup = `<div class="alert alert--${type}">${mssg}</div>`;

  const el = document.querySelector("body");
  el.insertAdjacentHTML("afterbegin", markup);

  window.setTimeout(hideAlert, time * 1000);
};
