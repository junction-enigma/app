const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setOpacity: (value) => ipcRenderer.send("set-opacity", value),
  onUpdateOpacity: (callback) =>
    ipcRenderer.on("send-opacity", (_event, value) => callback(value)),
  quit: () => ipcRenderer.send("quit"),
  showOverlay: () => ipcRenderer.send("show-overlay"),
  hideOverlay: () => ipcRenderer.send("hide-overlay"),
});
