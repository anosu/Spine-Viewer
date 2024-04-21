const {contextBridge, ipcRenderer} = require('electron')


contextBridge.exposeInMainWorld('preload', {
    onDebug: (callback) => ipcRenderer.on('debug', (_event, log) => callback(log)),
    port: () => ipcRenderer.invoke('port'),
    minimize: () => ipcRenderer.send('minimize'),
    toggleMaximize: () => ipcRenderer.send('toggle-maximize'),
    close: () => ipcRenderer.send('close'),
    onMaximize: (callback) => ipcRenderer.on('set-maximized-icon', (_event) => callback()),
    onUnMaximize: (callback) => ipcRenderer.on('set-unmaximized-icon', (_event) => callback()),
    showContextMenu: (ev) => ipcRenderer.send('show-context-menu', ev),
    onCopyImage: (callback) => ipcRenderer.on('copy-image', (_event) => callback()),
    saveImage: (image) => ipcRenderer.invoke('save-image', image),
    selectExportPath: () => ipcRenderer.invoke('select-export-path'),
    prepareExport: (id) => ipcRenderer.invoke('prepare-export', id),
    executeExport: (options) => ipcRenderer.invoke('ffmpeg', options),
    onExportComplete: (callback) => ipcRenderer.on('export-complete', (_event) => callback())
})
