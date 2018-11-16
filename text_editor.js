//Import the needed electron components. 
const {
    app,
    BrowserWindow
} = require("electron");
const globalShortcut = require("electron").globalShortcut;

//Wait for app to be ready. 
app.on("ready", () => {
	const DEV = !!process.env.FLAME_DEV;
    const TEST = !!process.env.FLAME_TEST;

    console.log(DEV && !TEST)

    let win = new BrowserWindow({
        width: 1920,
        height: 1080,
    });
    
    win.loadFile("./assets/html/text_edit.html");
    if(DEV && !TEST) win.webContents.openDevTools()

    //win.webContents.openDevTools();
    globalShortcut.register('f5', function() {
        console.log('f5 is pressed');
        win.reload();
    });
    globalShortcut.register('CommandOrControl+R', function() {
        console.log('CommandOrControl+R is pressed');
        win.reload();
    });
});