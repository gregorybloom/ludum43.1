// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MirrorActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MirrorActor() {
}
MirrorActor.prototype = new Actor;
MirrorActor.prototype.identity = function() {
	return ('MirrorActor (' +this._dom.id+ ')');
};
MirrorActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.enemyClass = "BASICENEMY";
	this.enemyType = 0;

	this.scoreValue = 0;

	this.solid = true;
	this.transparent = false;

	this.doorColorNum = 0;
	this.doorColor = "";
	this.haloAlpha = 0.5;

	this.activated = false;

	this.radius = 20;

	this.started = false;
	this.startedTime = GAMEMODEL.getTime();

	this.size = {w:100,h:20};
	this.position = {x:0,y:0};
	this.updatePosition();
};
MirrorActor.prototype.clear = function() {
	Actor.prototype.clear.call(this);
	this.steps = null;
};
MirrorActor.prototype.loadingData = function(data)
{
	if(data.class)		this.enemyClass = data.class;
	if(data.classtype)	this.enemyType = data.classtype;
};

MirrorActor.prototype.draw = function() {
	Actor.prototype.draw.call(this);


 	var prop = {fill:false, color:"#000000", width:1.5};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"circle",radius:this.radius};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

    // Draw Box
/* 	var prop = {fill:true, color:"#999999"};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w,height:this.size.h};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

 	var prop = {fill:false, color:this.doorColor,width:4};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w-2,height:this.size.h-2};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);

 	var prop = {fill:false, color:"#000000",width:1};
    prop.source = "default";
    prop.writeTo = 2;
 	var shape = {type:"box",width:this.size.w+1,height:this.size.h+1};
    var transf = {};
    GAMEVIEW.drawElement(this.position, shape, prop, transf);
/**/


//	GAMEVIEW.drawBox(this.absBox,"#660000");
};
MirrorActor.prototype.update = function() {
	Actor.prototype.update.call(this);

	this.updatePosition();

	var curtime = GAMEMODEL.getTime();

	this.doorColor = this.getNumericColor(this.haloAlpha, this.doorColorNum, 'door');
};
MirrorActor.prototype.collide = function(act) {
	if(typeof act === "undefined")		return;
	Actor.prototype.collide.call(this,act);
};

MirrorActor.prototype.collideType = function(act) {
	if(act == this)					return false;
	return false;
};
MirrorActor.prototype.collideVs = function(act) {

};
MirrorActor.alloc = function() {
	var vc = new MirrorActor();
	vc.init();
	return vc;
};
exports.MirrorActor = MirrorActor;
exports.MirrorActor._loadJSEngineClasses = _loadJSEngineClasses;
