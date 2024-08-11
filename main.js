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
let overlayWindow = undefined;

const trayIcon = nativeImage.createFromPath(path.join("tray.png"));
const appIcon = nativeImage.createFromPath(path.join("icon.png"));

app.dock.hide();
app.on("ready", () => {
  app.dock.hide();
  app.dock.isVisible(false);

  createTray();
  createWindow();
  createOverlayWindow();
});

const createTray = () => {
  tray = new Tray(trayIcon);
  tray.on("click", function (event) {
    toggleWindow();
  });
};

const createWindow = () => {
  window = new BrowserWindow({
    width: 260,
    height: 140,
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: true,
    transparent: true,
    vibrancy: "fullscreen-ui",
    skipTaskbar: true,
    icon: appIcon,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("set-opacity", (_, value) => {
    setBackgroundOpacity(value);
  });

  session.defaultSession.setDisplayMediaRequestHandler((_, callback) => {
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

  window.loadURL(`file://${path.join(__dirname, "index.html")}`);
  window.setSkipTaskbar(true);

  window.on("blur", () => {
    if (!window.webContents.isDevToolsOpened()) {
      window.hide();
    }
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

const setBackgroundOpacity = (value) => {
  overlayWindow.webContents.send("send-opacity", value);
};

const toggleWindow = () => {
  window.isVisible() ? window.hide() : showWindow();
};

const showWindow = () => {
  const position = getWindowPosition();
  window.setPosition(position.x, position.y, false);
  window.show();
};

const createOverlayWindow = () => {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  overlayWindow = new BrowserWindow({
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
    icon: appIcon,
    webPreferences: {
      backgroundThrottling: false,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  overlayWindow.setAlwaysOnTop(true, "screen-saver");
  overlayWindow.setVisibleOnAllWorkspaces(true);
  overlayWindow.loadURL(`file://${path.join(__dirname, "tray.html")}`);
  overlayWindow.setPosition(0, 0, false);
  overlayWindow.show();
  overlayWindow.setIgnoreMouseEvents(true);
};

ipcMain.on("show-overlay", () => {
  overlayWindow.show();
});

ipcMain.on("hide-overlay", () => {
  overlayWindow.hide();
});

ipcMain.on("quit", () => {
  app.quit();
});
