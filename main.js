//Import the needed electron components. 
const { app, BrowserWindow } = require("electron");
const globalShortcut = require("electron").globalShortcut;
const mouse = require("./assets/cpp/build/Release/addon");
const fs = require("fs");
const path = require("path");
//Wait for app to be ready. 



app.on("ready", () => {

    const DEV = !!process.env.FLAME_DEV;
    const TEST = !!process.env.FLAME_TEST;
    const WATCH = !!process.env.FLAME_WATCH;


    let win = new BrowserWindow({
        show:false,
        width: 1920,
        height: 1080,
        webPreferences : {
            nodeIntegration: true
        },
        //If in (testing or development) modes make sure that devtools open automatically
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

    if(WATCH && DEV){
        const watchFunction = (e,fn) =>{
            console.log(`File has changed ${fn}`);
            win.reload();
        }

        fs.watch(path.join(process.cwd(), "./assets/source"), {recursive:true},watchFunction);
        fs.watch(path.join(process.cwd(), "./node_modules/@candlefw/css/source"),{recursive:true},watchFunction);
        fs.watch(path.join(process.cwd(), "./node_modules/@candlefw/wick/source"),{recursive:true},watchFunction);
        fs.watch(path.join(process.cwd(), "./node_modules/@candlefw/whind/source"),{recursive:true},watchFunction);
        fs.watch(path.join(process.cwd(), "./node_modules/@candlefw/glow/source"),{recursive:true},watchFunction);
        fs.watch(path.join(process.cwd(), "./node_modules/@candlefw/html/source"),{recursive:true},watchFunction);
    }

    if (DEV && !TEST) win.webContents.openDevTools();

    win.loadFile("./assets/index.html");
    
    globalShortcut.register('f5', function() {
        console.log('f5 is pressed');
        win.reload();
    });
    
    globalShortcut.register('CommandOrControl+R', function() {
        console.log('CommandOrControl+R is pressed');
        win.reload();
    });
});
