import { app, BrowserWindow, globalShortcut, Menu, dialog, shell } from 'electron'
import fetch from 'electron-fetch'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    minWidth: 250,
    minHeight: 250,
    maxWidth: 800,
    maxHeight: 800,
    width: 300,
    height: 300,
    titleBarStyle: 'hiddenInset',
    frame: false,
    autoHideMenuBar: true
  })

  mainWindow.setAspectRatio(1)

  mainWindow.loadURL(winURL)

  globalShortcut.register('MediaPlayPause', () => {
    mainWindow.webContents.send('MediaPlayPause', {})
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu () {
  const template = [{
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('https://github.com/romainlp/Radio-Nova') }
      },
      {
        label: 'Radio Nova Website',
        click () { require('electron').shell.openExternal('https://www.nova.fr') }
      }
    ]
  }]

  if (process.platform === 'darwin') {
    const name = app.getName()
    template.unshift({
      label: name,
      submenu: [
        {
          role: 'about'
        },
        {
          type: 'separator'
        },
        {
          role: 'services',
          submenu: []
        },
        {
          type: 'separator'
        },
        {
          role: 'hide'
        },
        {
          role: 'hideothers'
        },
        {
          role: 'unhide'
        },
        {
          type: 'separator'
        },
        {
          role: 'quit'
        }
      ]
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function checkUpdates () {
  fetch('https://raw.githubusercontent.com/romainlp/Radio-Nova/master/package.json')
    .then(res => res.json())
    .then(function (json) {
      if (json.version) {
        var compareVersions = require('compare-versions')
        if (compareVersions(json.version, app.getVersion()) === 1) {
          dialog.showMessageBox(null, {
            title: 'Update available',
            message: 'An update for Radio Nova is available.',
            buttons: ['Download', 'Cancel']
          }, goToGithub)
        }
      }
    })
}

function goToGithub (response) {
  if (response === 0) {
    shell.openExternal('https://github.com/romainlp/Radio-Nova/releases/latest')
  }
}

app.on('ready', createWindow)
app.on('ready', createMenu)
app.on('ready', checkUpdates)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
