// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports;     // Direct Load
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


GameEngine.engineStartupList = {
	"electron": [
		"core/content_loader.js",
		"core/loaders/file_loader.js",
		"core/loaders/asset_loader.js",
		"core/game_resources.js",
		"ex_jsN/resources_list.js",
	],
	"*": [
		"core/content_loader.js",
		"core/loaders/file_loader.js",
		"core/loaders/asset_loader.js",
		"core/game_resources.js",
		"ex_jsN/resources_list.js",
	],
};
