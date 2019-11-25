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


var loadResources = function(callback) {

	GAMESOUNDS.loadSoundList( GAMESOUNDS.audioContext, GAMESOUNDS.gameSFX );
  GAMESOUNDS.loadReverb( GAMESOUNDS.audioContext, GAMESOUNDS.reverb );

	GAMEVIEW.loadTextures();

	console.log("LOADED RESOURCES");

	GAMEMODEL.gameScreens.screenMode = "openScreen";
	GAMEMODEL.modelMode = "GAME_SCREENS";

	setInterval( function() { worldUpdate(); }, 25);
  //do work

	if(typeof callback === "function")		callback.call(GameEngine);
}.bind(GameEngine);

GameEngine.currentFunctionList['loadResources'] = function(callback) {
		if(document.readyState === "loading") {
			document.addEventListener("DOMContentLoaded",function() {
				loadResources(callback);
			}.bind(GameEngine));
		}
		else {
			loadResources(callback);
		}
}.bind(GameEngine);






function worldUpdate() {
	GAMEMODEL.updateAll();
	GAMEMODEL.collideAll();

	GAMEVIEW.updateAll();
	GAMEVIEW.drawAll();
}
