// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MenuActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MenuActor() {
}
MenuActor.prototype = new Actor;
MenuActor.prototype.identity = function() {
	return ('MenuActor (' +this._dom.id+ ')');
};

MenuActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.items = {};
  this.selection = null;

	this.updatePosition(0,0);

	this.load();
};

MenuActor.prototype.clear = function() {
	for(var i in this.items)
	{
        this.items[i].clear();
		delete this.items[i];
	}
	this.items = {};
};
MenuActor.prototype.load = function() {


};

MenuActor.prototype.updateAll = function() {
    this.update();

    for(var i in this.items)
    {
    	if(this.items[i] instanceof Actor)
        {
					if(typeof this.items[i].updateAll === "function")            this.items[i].updateAll();
					else            this.items[i].update();
	   }
    }
};
MenuActor.prototype.drawAll = function() {
    this.draw();

    for(var i in this.items)
    {
    	if(this.items[i] instanceof Actor)
        {
						if(typeof this.items[i].drawAll === "function")            this.items[i].drawAll();
						else            this.items[i].draw();
        }
    }
};


MenuActor.prototype.distributeInput = function(kInput)
{
	if(kInput.keyID == GAMECONTROL.keyIDs['KEY_DELETE'])		return true;
	if(kInput.keyID == GAMECONTROL.keyIDs['KEY_BACKSPACE'])		return true;

        var used = false;
        used = used | this.readInput(kInput);

        var i = this.selection;
        if(typeof this.items[i] !== "undefined")
        {
            if(this.items[i] instanceof Actor)
            {
							if(typeof this.items[i].distributeInput === "function")           used = used | this.items[i].distributeInput(kInput);
              else 												used = used | this.items[i].readInput(kInput);
            }
        }
        return used;
};




MenuActor.prototype.update = function() {
	Actor.prototype.update.call(this);

};
MenuActor.prototype.draw = function() {

};

MenuActor.prototype.readInput = function(kInput) {
    var used = false;

    return used;
};

MenuActor.prototype.cleanAll = function() {

        for(var i in this.items)
        {
                if(this.items[i].alive == false)
                {
                    this.items[i].clear();
                    delete this.items[i];
                }
        }
};



MenuActor.alloc = function() {
	var vc = new MenuActor();
	vc.init();
	return vc;
}

exports.MenuActor = MenuActor;
exports.MenuActor._loadJSEngineClasses = _loadJSEngineClasses;
