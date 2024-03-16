import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'node:path'

const distPath = path.join(__dirname, '../dist')
const publicPath = app.isPackaged ? distPath : path.join(distPath, '../public')
const viteDevServerUrl = process.env['VITE_DEV_SERVER_URL']

function createWindow() {
  const isWindows = process.platform === 'win32'

  const mainWindow = new BrowserWindow({
    icon: path.join(publicPath, 'android-chrome-512x512.png'),
    titleBarStyle: isWindows ? 'hidden' : 'default',
    titleBarOverlay: {
      color: '#000000',
      symbolColor: '#ffffff',
      height: 41,
    },
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload/index.js'),
    },
  })

  if (viteDevServerUrl) {
    mainWindow.loadURL(viteDevServerUrl)
  } else {
    mainWindow.loadFile(path.join(distPath, 'index.html'))
  }
}

function handleSetTitleBarColors(event: Electron.IpcMainEvent, colors: any) {
  const window = BrowserWindow.fromWebContents(event.sender)

  // might be undefined in some cases
  if (!window.setTitleBarOverlay) {
    return
  }

  window.setTitleBarOverlay({
    color: colors.backgroundColor,
    symbolColor: colors.symbolColor,
    height: 41,
  })
}

app.whenReady().then(() => {
  ipcMain.on('set-title-bar-colors', handleSetTitleBarColors)

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})