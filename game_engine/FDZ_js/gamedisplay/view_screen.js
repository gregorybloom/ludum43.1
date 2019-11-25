// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ViewScreen"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function ViewScreen() {
}
ViewScreen.prototype = new Actor;
ViewScreen.prototype.identity = function() {
	return ('ViewScreen (' +this._dom.id+ ')');
};

ViewScreen.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.elements = {};

	this.updatePosition(0,0);

	this.load();
};

ViewScreen.prototype.clear = function() {
	for(var i in this.elements)
	{
        this.elements[i].clear();
		delete this.elements[i];
	}
	this.elements = {};
};
ViewScreen.prototype.load = function() {


};

ViewScreen.prototype.updateAll = function() {
    this.update();
    for(var i in this.elements)
    {
    	if(this.elements[i] instanceof Actor)
      {
					if(typeof this.elements[i].updateAll === "function")            this.elements[i].updateAll();
					else            this.elements[i].update();
	   	}
    }
};
ViewScreen.prototype.drawAll = function() {
    this.draw();
    for(var i in this.elements)
    {
    	if(this.elements[i] instanceof Actor)
        {
					if(typeof this.elements[i].drawAll === "function")            this.elements[i].drawAll();
					else            this.elements[i].draw();
        }
    }
};


ViewScreen.prototype.distributeInput = function(kInput)
{
	if(kInput.keyID == GAMECONTROL.keyIDs['KEY_DELETE'])		return true;
	if(kInput.keyID == GAMECONTROL.keyIDs['KEY_BACKSPACE'])		return true;

        var used = false;
        used = used | this.readInput(kInput);

        for(var i in this.elements)
        {
            if(this.elements[i] instanceof Actor)
            {
							if(typeof this.elements[i].distributeInput === "function")           used = used | this.elements[i].distributeInput(kInput);
              else 												used = used | this.elements[i].readInput(kInput);
            }
        }
        return used;
};




ViewScreen.prototype.update = function() {
	Actor.prototype.update.call(this);

};
ViewScreen.prototype.draw = function() {

	GAMEVIEW.clearDrawMods();
	GAMEVIEW.context.globalAlpha=1.0;

};

ViewScreen.prototype.readInput = function(kInput) {
    var used = false;

    return used;
};

ViewScreen.prototype.cleanAll = function() {

        for(var i in this.elements)
        {
                if(this.elements[i].alive == false)
                {
                    this.elements[i].clear();
                    delete this.elements[i];
                }
        }
};



ViewScreen.alloc = function() {
	var vc = new ViewScreen();
	vc.init();
	return vc;
}

exports.ViewScreen = ViewScreen;
exports.ViewScreen._loadJSEngineClasses = _loadJSEngineClasses;
