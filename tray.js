window.electronAPI.onUpdateOpacity((value) => {
  console.log(value);
  document.querySelector(
    "body"
  ).style.backgroundColor = `rgb(0, 0, 0, ${value})`;
  document.querySelector("body").innerHTML = value;
});
