// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMELOADER"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



GAMELOADER={
	loadStates: {},
	loadPhases: {},

	phaseNum: 0,
	stateNum: 0

};

GAMELOADER.init = function()
{


	return true;
};


GAMELOADER.distributeInput = function(inobj)
{

};
GAMELOADER.updateAll = function()
{

};



GAMELOADER.drawAll = function()
{

};


exports.GAMELOADER = GAMELOADER;
exports.GAMELOADER._loadJSEngineClasses = _loadJSEngineClasses;
