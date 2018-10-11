//Import the needed electron components. 
const {app, BrowserWindow} = require("electron");


//Wait for app to be ready. 
app.on("ready", ()=>{
	let win = new BrowserWindow({width: 1920, height: 1080});

	win.loadFile("./index.html");

	win.webContents.openDevTools();
});