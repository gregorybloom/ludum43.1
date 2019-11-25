// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["MenuItemActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function MenuItemActor() {
}
MenuItemActor.prototype = new Actor;
MenuItemActor.prototype.identity = function() {
	return ('MenuItemActor (' +this._dom.id+ ')');
};

MenuItemActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.items = {};

	this.updatePosition(0,0);

	this.load();
};

MenuItemActor.prototype.clear = function() {
	for(var i in this.items)
	{
        this.items[i].clear();
		delete this.items[i];
	}
	this.items = {};
};
MenuItemActor.prototype.load = function() {


};


MenuItemActor.prototype.updateAll = function() {
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
MenuItemActor.prototype.drawAll = function() {
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


MenuItemActor.prototype.distributeInput = function(kInput)
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



MenuItemActor.prototype.cleanAll = function() {

        for(var i in this.items)
        {
                if(this.items[i].alive == false)
                {
                    this.items[i].clear();
                    delete this.items[i];
                }
        }
};



MenuItemActor.alloc = function() {
	var vc = new MenuItemActor();
	vc.init();
	return vc;
}

exports.MenuItemActor = MenuItemActor;
exports.MenuItemActor._loadJSEngineClasses = _loadJSEngineClasses;
