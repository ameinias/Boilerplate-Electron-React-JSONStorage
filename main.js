'use strict';

// Import parts of electron to use
const { app, ipcMain, BrowserWindow } = require('electron');
const path = require('path')
const url = require('url')

const storage = require("electron-json-storage")

// Import all app constants
const { HANDLE_FETCH_DATA, FETCH_DATA_FROM_STORAGE, HANDLE_SAVE_DATA, SAVE_DATA_IN_STORAGE, REMOVE_DATA_FROM_STORAGE,  HANDLE_REMOVE_DATA, HANDLE_EDIT_DATA, EDIT_DATA_IN_STORAGE } = require("./utils/constants")


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

// A reference to the itemsToTrack array, full of JS/JSON objects. All mutations to the array are performed in the main.js app, but each mutation will trigger a rewrite to the user's storage for data persistence
let itemsToTrack;

// Keep a reference for dev mode
let dev = false;
if ( process.defaultApp || /[\\/]electron-prebuilt[\\/]/.test(process.execPath) || /[\\/]electron[\\/]/.test(process.execPath) ) {
  dev = true;
}

// Keep a reference to the default path to userData, which will act as the app's database. It may not be necessary to use this
 const defaultDataPath = storage.getDefaultDataPath(); // Switch this back eventually 
//const defaultDataPath = 'C:/Users/gilli/Academic_local/Thesis databases/archive-BERJ/ClientApp/data.json';
// On Mac: /Users/[username]/Library/Application Support/[app-name]/storage

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024, height: 768, show: false, icon: __dirname + "/public/Lobster.icns"
  });

  // and load the index.html of the app.
  let indexPath;
  if ( dev && process.argv.indexOf('--noDevServer') === -1 ) {
    indexPath = url.format({
      protocol: 'http:',
      host: 'localhost:4000',
      pathname: 'index.html',
      slashes: true
    });
  } else {
    indexPath = url.format({
      protocol: 'file:',
      pathname: path.join(__dirname, 'dist', 'index.html'),
      slashes: true
    });
  }
  mainWindow.loadURL( indexPath );

  // Don't show until we are ready and loaded
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    // Open the DevTools automatically if developing
    if ( dev ) {
      mainWindow.webContents.openDevTools();
    }
  });

  mainWindow.webContents.send("info", {msg: "hello from main process"})

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}
// ---------------------------------------------------

// Application boot up and boot down

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// --------------------------------------------------------------

// ipcMain methods are how we interact between the window and (this) main program

// Receives a FETCH_DATA_FROM_STORAGE from renderer
ipcMain.on(FETCH_DATA_FROM_STORAGE, (event, message) => {
  console.log("Main received: FETCH_DATA_FROM_STORAGE with message:", message, defaultDataPath)
  // Get the user's itemsToTrack from storage
  // For our purposes, message = itemsToTrack array
  storage.get(message, (error, data) => {
    // if the itemsToTrack key does not yet exist in storage, data returns an empty object, so we will declare itemsToTrack to be an empty array
    itemsToTrack = JSON.stringify(data) === '{}' ? [] : data;
    if (error) {
      mainWindow.send(HANDLE_FETCH_DATA, {
        success: false,
        message: "itemsToTrack not returned",
      })
    } else {
      // Send message back to window
      mainWindow.send(HANDLE_FETCH_DATA, {
        success: true,
        message: itemsToTrack, // do something with the data
      })
    }
  })
})

// Receive a SAVE_DATA_IN_STORAGE call from renderer
ipcMain.on(SAVE_DATA_IN_STORAGE, (event, message) => {
  console.log("Main received: SAVE_DATA_IN_STORAGE to: " + defaultDataPath)
  // update the itemsToTrack array.
  itemsToTrack.push(message)
  // Save itemsToTrack to storage
  storage.set("itemsToTrack", itemsToTrack, (error) => {
    if (error) {
      console.log("We errored! What was data?")
      mainWindow.send(HANDLE_SAVE_DATA, {
        success: false,
        message: "itemsToTrack not saved",
      })
    } else {
      // Send message back to window as 2nd arg "data"
      mainWindow.send(HANDLE_SAVE_DATA, {
        success: true,
        message: message,
      })
    }
  })
});

// Receive a REMOVE_DATA_FROM_STORAGE call from renderer
ipcMain.on(REMOVE_DATA_FROM_STORAGE, (event, id) => {
  console.log('Main Received: REMOVE_DATA_FROM_STORAGE ' + id + " from " + defaultDataPath)
  // Update the items to Track array.
  itemsToTrack = itemsToTrack.filter(item => item.id !== id)
  // Save itemsToTrack to storage
  storage.set("itemsToTrack", itemsToTrack, (error) => {
    if (error) {
      console.log("We errored! What was data?")
      mainWindow.send(HANDLE_REMOVE_DATA, {
        success: false,
        message: id + " not removed",
      })
    } else {
      // Send new updated array to window as 2nd arg "data"
      mainWindow.send(HANDLE_REMOVE_DATA, {
        success: true,
        message: itemsToTrack,
      })
    }
  })
})


// Update a datapoint -- message will be the updated
ipcMain.on(EDIT_DATA_IN_STORAGE, (event, message) => {
  console.log("main received", EDIT_DATA_IN_STORAGE, "message:", message,  defaultDataPath)

  let index = itemsToTrack.findIndex(item => item.id === message.id);

  if (index !== -1) {
    itemsToTrack[index] = message;
    console.log("does this properly update the itemsToTrack array?", message)

    // Set itemsToTrack in storage
    storage.set("itemsToTrack", itemsToTrack, (error) => {
      if (error) {
        mainWindow.send(HANDLE_FETCH_DATA, {
          success: false,
          error: "error editing an expense in storage",
        })
      } else {
        // Send message back to window
        mainWindow.send(HANDLE_FETCH_DATA, {
          success: true,
          message: itemsToTrack,
        })
      }
    })
  } else {
    // The datapoint was not found
    mainWindow.send(HANDLE_FETCH_DATA, {
      success: false,
      error: "main: did not find the corresponding expense",
    })
  }
})

// renderer
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  ipcRenderer.send('show-context-menu')
})

ipcRenderer.on('context-menu-command', (e, command) => {
  // ...
})

// main
ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: 'Menu Item 1',
      click: () => { event.sender.send('context-menu-command', 'menu-item-1') }
    },
    { type: 'separator' },
    { label: 'Menu Item 2', type: 'checkbox', checked: true }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup({ window: BrowserWindow.fromWebContents(event.sender) })
})
