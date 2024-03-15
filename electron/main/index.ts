import { app, BrowserWindow } from 'electron'
import path from 'node:path'

const distPath = path.join(__dirname, '../dist')
const publicPath = app.isPackaged ? distPath : path.join(distPath, '../public')
const viteDevServerUrl = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(publicPath, 'android-chrome-512x512.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.removeMenu()

  if (viteDevServerUrl) {
    win.loadURL(viteDevServerUrl)
  } else {
    win.loadFile(path.join(distPath, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(createWindow)