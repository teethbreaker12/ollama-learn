const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  createApplication: (formData) => ipcRenderer.invoke('create-application', formData)
})
