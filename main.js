const { app, BrowserWindow, ipcMain, Tray, nativeImage, desktopCapturer, session, screen } = require("electron");
const path = require("path");

let tray = undefined;
let window = undefined;
let inScreenTray = undefined

app.dock.hide()           

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
    height: 488,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: true,
    transparent: true,
    vibrancy: "fullscreen-ui",
    webPreferences: {
      backgroundThrottling: false,
    },
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
