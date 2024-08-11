window.electronAPI.onUpdateOpacity((value) => {
  document.querySelector(
    "body"
  ).style.backgroundColor = `rgb(0, 0, 0, ${value})`;
  document.querySelector("body").innerHTML = value;
});
