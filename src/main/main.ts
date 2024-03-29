import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

function createWindow() {
  const isWindows = process.platform === 'win32'

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    icon: path.join(__dirname, 'android-chrome-512x512.png'),
    width: 800,
    height: 600,
    titleBarStyle: isWindows ? 'hidden' : 'default',
    titleBarOverlay: isWindows
      ? {
          color: '#000000',
          symbolColor: '#ffffff',
          height: 41,
        }
      : undefined,
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  // and load the splashWindow.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    )
  }

  // only show the main window after it has been loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })
}

function handleSetTitleBarColors(event: Electron.IpcMainEvent, colors: any) {
  const eventWindow = BrowserWindow.fromWebContents(event.sender)

  // might be undefined in some cases
  if (!eventWindow?.setTitleBarOverlay) {
    return
  }

  eventWindow.setTitleBarOverlay({
    color: colors.backgroundColor,
    symbolColor: colors.symbolColor,
    height: 41,
  })
}

function registerIpcHandlers() {
  ipcMain.on('set-title-bar-colors', handleSetTitleBarColors)
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  registerIpcHandlers()
  createWindow()
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
