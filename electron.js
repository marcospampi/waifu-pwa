const { app, BrowserWindow } = require('electron')

function createWindow () {
  // Crea la finestra del browser
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      
    }
  })

  // and load the index.html of the app.
  win.loadURL('http://localhost:80')
}

app.whenReady().then(createWindow)

app.on('certificate-error', (ev,wC,url,err,cert,cb) => {
  ev.preventDefault();
  cb(true)
})