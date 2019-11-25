// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.


//    https://electronjs.org/docs/tutorial/first-app
//    https://electronjs.org/docs/tutorial/quick-start
//    https://electronjs.org/docs/tutorial/application-architecture

//    https://medium.freecodecamp.org/how-to-build-your-first-app-with-electron-41ebdb796930
//    https://www.tutorialspoint.com/electron/index.htm
//    https://hackr.io/tutorials/learn-electron


//      http://www.commonjs.org/specs/modules/1.0/
//      https://electronjs.org/docs/tutorial/application-distribution

//    https://www.toptal.com/nodejs/top-10-common-nodejs-developer-mistakes
//    https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/
//    https://technology.amis.nl/2017/05/18/sequential-asynchronous-calls-in-node-js-using-callbacks-async-and-es6-promises/
//    https://medium.com/dev-bits/writing-neat-asynchronous-node-js-code-with-promises-32ed3a4fd098


if (typeof require === "function") {
	var $ = jQuery = require('jquery'); // as node_modules
}


var initializeGame = function(callback) {
    GAMEGEOM.init();
    GAMECONTROL.init();
    GAMEVIEW.init();
    GAMEVIEW.set({w:800,h:600});


//    GAMEVIEW.drawAll();

    GAMEANIMATIONS.init();

    GAMEMUSIC.init();
    GAMESOUNDS.init();

    GAMEMODEL.init();


    $(document).keyup(GAMECONTROL.onKeyUp);
    $(document).keydown(GAMECONTROL.onKeyDown);

    var topCanvas = "div#renderarea canvas.top";
    $(topCanvas).mousemove(GAMECONTROL.onMouseMove);
    $(topCanvas).mousedown(GAMECONTROL.onMouseDown);
    $(window).mouseup(GAMECONTROL.onMouseUp);
    $(topCanvas).click(GAMECONTROL.onMouseClick);
    $(topCanvas).dblclick(GAMECONTROL.onMouseDoubleClick);


		console.log("INITIALIZED ENGINE");
		if(typeof callback === "function")		callback.call(GameEngine);
}.bind(GameEngine);

GameEngine.currentFunctionList['initializeGame'] = function(callback) {
	if(document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded",function() {
			initializeGame(callback);
		}.bind(GameEngine));
	}
	else {
		initializeGame(callback);
	}
}.bind(GameEngine);
