/*--------------------------------
* Electron Desktop App
* File : main.js
*
* @ author              gmoita
* @ version             1.0
*
*	@ start date					21 03 2019
*	@ last update					21 03 2019
*
* Description
* Entry point of the entire app.
* Contains the setup of the main
* Browser Window.
*--------------------------------*/

/*--------------------------------
* Imports and Constants
*--------------------------------*/
const {
  app,
  Tray,
  Menu,
  dialog,
  globalShortcut,
  BrowserWindow
} = require('electron');

const url  = require('url');
const path = require('path');
const yamlparser = require('./src/config/lib/yamlparser.js');

/*--------------------------------
* Global Variables
*--------------------------------*/
let main_window = null;
let DEV_MODE = false;

/*--------------------------------
* Function: Create Window
*--------------------------------*/
function createWindow (config) {
  /* Create a Browser Window instance and associate
      it to the global variable 'main_window'
  */
  main_window = new BrowserWindow(config);

  main_window.loadURL(url.format({
    pathname: path.join(__dirname, "./src/index.html"),
    protocol: 'file:',
    slashes: true
  }));

  /* On event: Closed */
  main_window.on('closed', () => {
    main_window = null;
  });

  /* On event: Maximize */
  main_window.on("maximize", () => {
    main_window.webContents.send("maximize");
  });

  /* On event: Unmaximize */
  main_window.on("unmaximize", () => {
    main_window.webContents.send("unmaximize");
  });
}

/*--------------------------------
* Function: Add App To Tray
*--------------------------------*/
function addAppToTray (app_name, menu_template, icon_path) {
  let icon = new Tray(path.join(__dirname, icon_path));
  let menu = Menu.buildFromTemplate(menu_template);

  icon.setToolTip(app_name);
  icon.setContextMenu(menu);

  /* Restore (open) the app after clicking on tray icon.
      If window is already open, minimize it to system tray
  */
  icon.on('click', () => {
    main_window.isMinimized() ? main_window.maximize() : main_window.restore();
  })
}

/*--------------------------------
* Function: Setup Accelerators
*--------------------------------*/
function setupAccelerators (devmode_enable) {
  /* Enable/disable developers mode */
  globalShortcut.register('CommandOrControl+Shift+D', () => {
    if (devmode_enable) {
      DEV_MODE = !DEV_MODE;

      /* Close Dev tools if they are opened */
      main_window.webContents.closeDevTools();
    }
  });

  /* Open/close developers mode */
  globalShortcut.register('CommandOrControl+Shift+I', () => {
    if (DEV_MODE) {
      main_window.webContents.toggleDevTools();
    }
  });

  /*
    Safeguard for the behaviour set above
      Disable developers tools opening if DEV_MODE is false
  */
  main_window.webContents.on("devtools-opened", (e) => {
    if (!DEV_MODE) {
      e.preventDefault();
      main_window.webContents.closeDevTools();
    }
  });
}

/*--------------------------------
* Function: Initialize App
*--------------------------------*/
function initializeApp() {
  let yamldoc = yamlparser.openFile('./config.yml');
  if (yamldoc === null)  app.quit();

  createWindow({
    frame:      yamlparser.getSetting(yamldoc, ['window', 'frame']),
    width:      yamlparser.getSetting(yamldoc, ['window', 'width']),
    height:     yamlparser.getSetting(yamldoc, ['window', 'height']),
    minWidth:   yamlparser.getSetting(yamldoc, ['window', 'minWidth']),
    minHeight:  yamlparser.getSetting(yamldoc, ['window', 'minHeight']),
    hasShadow:  yamlparser.getSetting(yamldoc, ['window', 'hasShadow']),
    resizable:  yamlparser.getSetting(yamldoc, ['window', 'resizable'])
  });

  setupAccelerators(yamlparser.getSetting(
    yamldoc, ['op', 'devmode_enable']
  ));

  addAppToTray(
    yamlparser.getSetting(yamldoc, ['app', 'name']),
    [
      {
        label: yamlparser.getSetting(yamldoc, ['app', 'name']),
        enabled: false
      },
      {
        label: 'Quit',
        click: () => {
          main_window.close();
        }
      }
    ],
    yamlparser.getSetting(yamldoc, ['app', 'icon'])
  );
}

/*--------------------------------
* To Execute
*--------------------------------*/
/* On app event: Ready */
app.on('ready', initializeApp);

/* On app event: Activate */
app.on('activate', () => {
  if (win === null) {
    createWindow();
  }
});

/* On app event: Windows are all closed */
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

/* Exception Handling */
process.on("uncaughtException", (err) => {
  const msgBoxOpts = {
    type: "error",
    title: "Critical error",
    message: err.toString(),
    button: ["Exit"]
  };

  dialog.showMessageBox(msgBoxOpts);
  throw err;
});
