const {
  app,
  BrowserWindow,
  ipcMain,
  Tray,
  nativeImage,
  desktopCapturer,
  session,
  screen,
} = require("electron");
const path = require("path");

let tray = undefined;
let window = undefined;
let inScreenTray = undefined;

app.on("ready", () => {
  app.dock.hide();
  app.dock.isVisible(false);

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
    skipTaskbar: true,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("set-opacity", (event, value) => {
    const webContents = event.sender;
    const win = BrowserWindow.fromWebContents(webContents);
    console.log(value);
    setBackgroundOpacity(value);
  });

  session.defaultSession.setDisplayMediaRequestHandler((request, callback) => {
    desktopCapturer
      .getSources({ types: ["window", "screen"] })
      .then((sources) => {
        for (let i = 0; i < sources.length; ++i) {
          console.log(
            sources[i].name,
            sources[i].thumbnail.getSize(),
            sources[i].thumbnail.getAspectRatio(),
            sources[i].thumbnail.getScaleFactors()
          );
        }

        callback({ video: sources[0], audio: "loopback" });
      });
  });

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  window.loadURL(`file://${path.join(__dirname, "index.html")}`);

  createInScreenTray(width, height, 0, 0);
  window.setSkipTaskbar(true);

  window.on("blur", () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
  });
};

const createInScreenTray = (width, height, x, y) => {
  inScreenTray = new BrowserWindow({
    width: width,
    height: height,
    resizable: false,
    transparent: true,
    skipTaskbar: true,
    maximizable: false,
    fullscreenable: false,
    frame: false,
    movable: false,
    show: false,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  inScreenTray.setAlwaysOnTop(true, "screen-saver");
  inScreenTray.setVisibleOnAllWorkspaces(true);
  inScreenTray.loadURL(`file://${path.join(__dirname, "tray.html")}`);
  inScreenTray.setPosition(x, y, false);
  inScreenTray.show();
  inScreenTray.setIgnoreMouseEvents(true);

  getAllWindows();
};

let isEnableOpacity = false;

const setBackgroundOpacity = (value) => {
  inScreenTray.webContents.send("send-opacity", value);
};

const getAllWindows = () => {
  const windowsLists = BrowserWindow.getAllWindows();
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
