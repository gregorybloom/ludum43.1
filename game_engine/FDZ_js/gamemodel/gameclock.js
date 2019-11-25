// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GameClock"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function GameClock() {
}
GameClock.prototype.identity = function() {
	return ('GameClock ()');
};
GameClock.prototype.init = function() {

	var d = new Date();
	this.isActive = false;

	this.startTime = d.getTime();
	this.stopTime = this.startTime;
	this.timeRate = 1.0;
};

GameClock.prototype.restart = function()
{
	var d = new Date();
	this.startTime = d.getTime();
	this.stopTime = 0;
	this.isActive = true;
};
GameClock.prototype.clear = function()
{
	var d = new Date();
	this.startTime = d.getTime();
	this.stopTime = this.startTime;
};
GameClock.prototype.start = function()
{
	var d = new Date();
	this.startTime = d.getTime() - (this.stopTime - this.startTime);
	this.stopTime = 0.0;
	this.isActive = true;
};
GameClock.prototype.stop = function()
{
	var d = new Date();
	this.stopTime = d.getTime();
	this.isActive = false;
};
GameClock.prototype.changeRate = function(rate)
{
	var d = new Date();
	var savedTime = this.elapsedMS();

	this.startTime = d.getTime() - savedTime/rate;
	this.stopTime = this.startTime;

	this.timeRate=rate;
};

GameClock.prototype.elapsedMS = function()
{
	var d = new Date();
	if( this.isActive==false )	return (this.stopTime - this.startTime);
	return (this.timeRate)*(d.getTime() - this.startTime);
};


GameClock.alloc = function() {
	var vc = new GameClock();
	vc.init();
	return vc;
};


exports.GameClock = GameClock;
exports.GameClock._loadJSEngineClasses = _loadJSEngineClasses;
