// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["CollisionModule"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function CollisionModule() {
}
CollisionModule.prototype.identity = function() {
	return ('CollisionModule (?)');
};
CollisionModule.prototype.init = function() {
	this.actionLists = {};

	this.parent = null;
	this.target = null;
	this.filter = null;

	this.shape = null;
/*
	this.lastUpdateTicks = GAMEMODEL.getTime();
	this.thisUpdateTicks = GAMEMODEL.getTime();

	this.ticksDiff = 0;	/**/
};
CollisionModule.prototype.clear = function() {
};

CollisionModule.prototype.update = function() {
		if(this.shape instanceof ShapeObject) {
				this.shape.update();
		}
};
CollisionModule.prototype.collideVs = function(obj,args) {
      if(this.shape instanceof ShapeObject) {

              if(obj instanceof CollisionModule) {
                      if(obj.shape instanceof ShapeObject)            return this.shape.collideVs(obj.shape,args);
              }
              else if(obj instanceof ShapeObject) {
                      return this.shape.collideVs(obj,args);
              }
              else if(obj instanceof Actor) {
                      if(obj.collisionModule instanceof CollisionModule) {
                              if(obj.collisionModule.shape instanceof ShapeObject) {
                                      return this.shape.collideVs(obj.collisionModule.shape,args);
                              }
                      }
              }
      }
};
CollisionModule.prototype.addShape = function(shape) {
      if(shape instanceof ShapeObject) {
            this.shape = shape;
            this.shape.parent = this;
      }
};

CollisionModule.alloc = function() {
	var vc = new CollisionModule();
	vc.init();
	return vc;
};


exports.CollisionModule = CollisionModule;
exports.CollisionModule._loadJSEngineClasses = _loadJSEngineClasses;
