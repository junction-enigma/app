const { app, BrowserWindow, ipcMain, Tray, nativeImage } = require("electron");
const path = require("path");

let tray = undefined;
let window = undefined;

app.on("ready", () => {
  createTray();
  createWindow();
});

const createTray = () => {
  const icon = nativeImage.createFromPath(path.join("logo.png"));
  tray = new Tray(icon);
  tray.on("click", function (event) {
    toggleWindow();
  });
};

const getWindowPosition = () => {
  const windowBounds = window.getBounds();
  const trayBounds = tray.getBounds();

  const x = Math.round(
    trayBounds.x + trayBounds.width / 2 - windowBounds.width / 2
  );

  const y = Math.round(trayBounds.y + trayBounds.height + 4);

  return { x: x, y: y };
};

const createWindow = () => {
  window = new BrowserWindow({
    width: 260,
    height: 450,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true,
    webPreferences: {
      backgroundThrottling: false,
    },
    vibrancy: "fullscreen-ui",
  });
  window.loadURL(`file://${path.join(__dirname, "index.html")}`);

  window.on("blur", () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
};

const toggleWindow = () => {
  window.isVisible() ? window.hide() : showWindow();
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
};

ipcMain.on("show-window", () => {
  showWindow();
});
