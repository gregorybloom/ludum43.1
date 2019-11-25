// CommonJS ClassLoader Hack
var classLoadList = ["Actor","GameCamera"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ScreenManager"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function ScreenManager() {
}
ScreenManager.prototype = new Actor;
ScreenManager.prototype.identity = function() {
	return ('ScreenManager (' +this._dom.id+ ')');
};

ScreenManager.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.screenMode = 0;

	this.screens = {};

	this.updatePosition(0,0);

    var screen = GAMEVIEW.screen;

    this.screenCamera = GameCamera.alloc();
    this.screenCamera.displaySize = {w:screen.w,h:screen.h};
    this.screenCamera.baseSize = {w:screen.w,h:screen.h};

};

ScreenManager.prototype.clear = function() {

    delete this.screenCamera;
    this.screenCamera = null;

	for(var i in this.screens)
	{
            this.screens[i].clear();
            delete this.screens[i];
	}
	this.screens = {};
};
ScreenManager.prototype.load = function() {


};

ScreenManager.prototype.updateAll = function() {
    this.update();

    var i = this.screenMode;
    if(typeof this.screens[i] !== 'undefined')
    {
			if(this.screens[i] instanceof Actor)
		        {
		            this.screens[i].updateAll();
			}
    }
};
ScreenManager.prototype.drawAll = function() {
    this.draw();

    var i = this.screenMode;
    if(typeof this.screens[i] !== 'undefined')
    {
	if(this.screens[i] instanceof Actor)
        {
            this.screens[i].drawAll();
	}
    }
};


ScreenManager.prototype.distributeInput = function(kInput)
{
	if(kInput.keyID == GAMECONTROL.keyIDs['KEY_DELETE'])		return true;
	if(kInput.keyID == GAMECONTROL.keyIDs['KEY_BACKSPACE'])		return true;

        var used = false;
        used = used | this.readInput(kInput);

        var i = this.screenMode;
        if(typeof this.screens[i] !== 'undefined')
        {
            if(this.screens[i] instanceof ViewScreen)
            {
								if(typeof this.screens[i].distributeInput === "function")           used = used | this.screens[i].distributeInput(kInput);
	              else 												used = used | this.screens[i].readInput(kInput);
            }
        }
        return used;
};




ScreenManager.prototype.update = function() {
	Actor.prototype.update.call(this);
};
ScreenManager.prototype.draw = function() {

	GAMEVIEW.clearDrawMods();
	GAMEVIEW.context.globalAlpha=1.0;

};

ScreenManager.prototype.readInput = function(kInput) {
    var used = false;

    return used;
};

ScreenManager.prototype.cleanAll = function() {

        for(var i in this.screens)
        {
                if(this.screens[i].alive == false)
                {
                    this.screens[i].clear();
                    delete this.screens[i];
                }
                else
                {
                    this.screens[i].cleanAll();
                }
        }
};




ScreenManager.alloc = function() {
	var vc = new ScreenManager();
	vc.init();
	return vc;
}

exports.ScreenManager = ScreenManager;
exports.ScreenManager._loadJSEngineClasses = _loadJSEngineClasses;
