import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { database } from '@main/factory/database/database'
import { projectService } from '@main/factory/service/projectService'
import { createIpcListener } from '@main/ipc/listener'
import { taskService } from '@main/factory/service/taskService'

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit()
}

function createMainWindow() {
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

  // and load the index.html of the app.
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

  return mainWindow
}

function initialize() {
  // TODO this is a hack to create the tables

  database.createTable({
    name: 'projects',
    schema: {
      id: 'string',
      displayName: 'string',
      color: 'string',
      isBillable: 'boolean',
      createdAt: 'string',
      modifiedAt: 'string',
      deletedAt: 'string',
    },
  })

  database.createTable({
    name: 'tasks',
    schema: {
      id: 'string',
      projectId: 'string',
      displayName: 'string',
      color: 'string',
      createdAt: 'string',
      modifiedAt: 'string',
      deletedAt: 'string',
    },
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
  ipcMain.on('window:setTitleBarColors', handleSetTitleBarColors)

  ipcMain.handle('service:project:invoke', createIpcListener(projectService))
  ipcMain.handle('service:task', createIpcListener(taskService))
}

function registerIpcPublishers(mainWindow: BrowserWindow) {
  projectService.subscribeAll((event, channel) => {
    mainWindow.webContents.send('service:project:notify', event, channel)
  })
  taskService.subscribeAll((event, channel) => {
    mainWindow.webContents.send('service:task:notify', event, channel)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  initialize()
  registerIpcHandlers()
  const mainWindow = createMainWindow()
  registerIpcPublishers(mainWindow)
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
    createMainWindow()
  }
})
