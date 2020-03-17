/************************************************     CONSTANTES ET VARIABLES   *********************************************/

const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const listPingPath = './Data/ip_data.json';
const listPing = require(listPingPath);
const {
  ipcMain
} = require('electron');
const isDev = require('electron-is-dev');
const {
  app,
  BrowserWindow,
  Menu,
  dialog
} = electron;

let mainWindow;
let modifyWindow;
let loadWindow;

/**************************************************     CREATION DES FENETRES   **********************************************/
// Fenêtre principale
app.on('ready', function () {
  // Fenetre principale
  mainWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    show: false
  });

  // Charger l'HTML qui permet de définir la fenetre
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'View/mainWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );

  // N'afficher la fenêtre que lorsqu'elle est fini de charger
  mainWindow.once('ready-to-show', function () {
    mainWindow.show();
  });

  // Quitter l'appli quand la fenetre principale est fermée
  mainWindow.on('closed', function () {
    app.quit();
  });

  // Creer le menu à partir du template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Inserer le menu
  Menu.setApplicationMenu(mainMenu);
});

// Fenetre secondaire de création de requête
function createModifyWindow() {
  modifyWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    height: 700,
    width: 700,
    show: false
  });

  modifyWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'View/modifyWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );
  // Creer le menu à partir du template
  const modifyMenu = Menu.buildFromTemplate(modifyMenuTemplate);
  // Inserer le menu
  modifyWindow.setMenu(modifyMenu);

  modifyWindow.once('ready-to-show', function () {
    modifyWindow.show();
  });
}

function createLoadWindow(liste) {
  loadWindow = new BrowserWindow({
    webPreferences: {
      nodeIntegration: true
    },
    height: 600,
    width: 700,
    show: false
  });

  loadWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, 'View/loadWindow.html'),
      protocol: 'file:',
      slashes: true
    })
  );
  // Creer le menu à partir du template
  const loadMenu = Menu.buildFromTemplate(loadMenuTemplate);
  // Inserer le menu
  loadWindow.setMenu(loadMenu);

  loadWindow.once('ready-to-show', function () {
    loadWindow.show();
    loadWindow.webContents.send('checkedList:send', liste);
  });
}

/**************************************************    GESTION  DES MENUS  ****************************************************/
// Template menu fenêtre principale
const mainMenuTemplate = [{
  label: 'Menu',
  submenu: [{
      label: 'Modifier IP',
      accelerator: process.platform == 'darwin' ? 'Command+N' : 'Ctrl+N',
      click() {
        createModifyWindow();
      }
    },
    {
      label: 'Quitter',
      accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
      click() {
        app.quit();
      }
    }
  ]
}];

// Template menu fenêtre de modification IP
const modifyMenuTemplate = [{
  label: 'Menu',
  submenu: [{
    label: 'Fermer la fenêtre',
    accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
    click() {
      modifyWindow.close();
    }
  }]
}];

// Template menu fenêtre de déploiement
const loadMenuTemplate = [{
  label: 'Menu',
  submenu: [{
    label: 'Fermer la fenêtre',
    accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
    click() {
      loadWindow.close();
    }
  }]
}];

// Dev Tools
if (isDev) {
  mainMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      },
      {
        label: 'Debug Window',
        accelerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
        click() {
          console.log('debug');
        }
      }
    ]
  });
  modifyMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      },
      {
        label: 'Debug Window',
        accelerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
        click() {
          console.log('debug');
        }
      }
    ]
  });
  loadMenuTemplate.push({
    label: 'Developer Tools',
    submenu: [{
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      },
      {
        label: 'Debug Window',
        accelerator: process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
        click() {
          console.log('debug');
        }
      }
    ]
  });
}

/***************************************************    GESTION DES IPC RENDERER **********************************************/
// Validation de la modification de la liste IP
ipcMain.on('modif:valider', function (e, json) {
  console.log(json);
  fs.writeFile(listPingPath, JSON.stringify(json, null, 2), err => {
    if (err) console.log(err);
  });
  mainWindow.reload();
  modifyWindow.close();
});

ipcMain.on('action:deploy', function (e, indexChecked) {
  createLoadWindow(indexChecked);
});