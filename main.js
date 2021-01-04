console.log('Main Process Started....');
console.log('Loading Index.js');

const { protocol, systemPreferences, remote, BrowserView } = require('electron');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require("path");
const url = require("url");

let main;

app.on('ready', () => {
    let main = null
    let loading = new BrowserWindow({
        show: false, 
        frame: false,
        width: 320, // here I have set the width and height
        height: 420,
        frame: false,
        minimizable: false,
        maximizable: false,
        center: true,
        closable: false,
        darkTheme: true,
        icon: path.join(__dirname, './assets/logo.png')
    })
    loading.setClosable(false);
    loading.once('show', () => {
      main = new BrowserWindow({
          show: false,
          autoHideMenuBar: true,
          frame: false,
          center: true,
          width: 1000,
          icon: path.join(__dirname, './assets/logo.png'),
          webPreferences: {
            nodeIntegration: true
          }
        })
      main.webContents.once('dom-ready', () => {
        
        setTimeout(() => { 
        console.log('Main loaded')
        main.show();
        loading.hide(); }, 9000);
        if (updatedVer.version === verRN.version && updatedAuth === authRN.auth) {
        } else setTimeout(() => { main.close() }, 9500);
      });

      // long loading html
      main.loadURL(url.format({
        pathname: path.join(__dirname, 'welcome.html'),
        protocol: 'file',
        slashes: true
    }));
    })
    loading.loadURL(url.format({
        pathname: path.join(__dirname, 'loading.html'),
        protocol: 'file',
        slashes: true
    }));
    loading.show()
    loading.on('close', () => {
        app.quit()

    app.on("window-all-closed", function() {
          if (process.platform !== "darwin") {
              app.quit();
          }
        });
    })
    });

  const verRN = require('./package.json');
const updatedVer = require('./auth.json');
const updatedAuth = 'wunuoasbdkshyvfacdlsnfusb2bdhbv43bkbs';
const authRN = require('./auth.json')