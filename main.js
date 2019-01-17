//Import the needed electron components. 
const { app, BrowserWindow } = require("electron");
const globalShortcut = require("electron").globalShortcut;
//Wait for app to be ready. 

app.on("ready", () => {

    const DEV = !!process.env.FLAME_DEV;
    const TEST = !!process.env.FLAME_TEST;


    let win = new BrowserWindow({
        show:false,
        width: 1920,
        height: 1080,
        webPreferences : {
            nodeIntegration: true
        },
        //If in (testing or development) modes make sure that the devtools open automatically
        webPreferences:{
            devTools : (TEST || DEV)
        }
    });

    win.once("ready-to-show", function(){
        this.show();
        if(TEST || DEV) {
            console.log(`Welcome to FlameDev!`)
            this.webContents.openDevTools();
        }
    })

    if (DEV && !TEST) win.webContents.openDevTools();

    win.loadFile("./assets/html/index.html");

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
