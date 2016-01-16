const electron = require('electron');
const app = electron.app;
const clipboard = electron.clipboard;
const Menu = electron.Menu;
const Tray = electron.Tray;
const fs = require('original-fs');
const filename = '.clipboard-history';

var appIcon = null;
var contextMenu = null;

app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  appIcon = new Tray('./icon.png');
  contextMenu = Menu.buildFromTemplate([
    { label: '終了', accelerator: 'Command+Q', click: () => {app.quit();} } 
  ]);
  appIcon.setContextMenu(contextMenu);
});

var lastString = null;
fs.exists(filename, (exists) => {
  if (!exists) {
    fs.writeFile(filename, '[]', 'utf8');
  } else {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err;
      var list = JSON.parse(data);
      if (list.length === 0) return;
      lastString = list[list.length - 1].text;
      console.log(lastString);
    });
  }
});


setInterval(() => {
  var cb = clipboard.readText();
  if (!cb) return;
  if (lastString === null || lastString !== cb) {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) throw err;
      var list = JSON.parse(data);
      list.push({utc: Date.now(), text: cb});
      fs.writeFile(filename, JSON.stringify(list), 'utf8');
    });
    lastString = cb;
    console.log(lastString);
  }
}, 500);

app.dock.hide();
