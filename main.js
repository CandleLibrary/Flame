//Import the needed electron components. 
const {app, BrowserWindow} = require("electron");


//Wait for app to be ready. 
app.on("ready", ()=>{
	let win = new BrowserWindow({width: 800, height: 600});

	win.loadFile("./index.html");

	win.webContents.openDevTools();

	console.log(win.devToolsWebContents)
})