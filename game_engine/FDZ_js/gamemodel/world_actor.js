// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["WorldActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function WorldActor() {
}
WorldActor.prototype = new Actor;
WorldActor.prototype.identity = function() {
	return ('WorldActor (' +this._dom.id+ ')');
};

WorldActor.prototype.init = function() {
	Actor.prototype.init.call(this);

	this.gamePlayer = null;
	this.gameArtbits = [];
	this.gameActors = [];

	this.updatePosition(0,0);

//	this.sizeW = 1000;
//	this.sizeH = 1000;

//        this.drawSize = true;
};

WorldActor.prototype.clear = function() {

	delete this.gamePlayer;
	this.gamePlayer = null;

	for(var i in this.gameActors)
	{
                this.gameActors[i].clear();
                this.gameActors.splice(i,1);
	}
	for(var i in this.gameArtbits)
	{
		this.gameArtbits[i].clear();
		delete this.gameArtbits[i];
	}

	this.gameActors = {};
	this.gameArtbits = {};
};
WorldActor.prototype.load = function() {


//	this.gamePlayer = GameChar.alloc();
//	this.gamePlayer.updatePosition( GAMEVIEW.screen.w/2, GAMEVIEW.screen.h/2 );

//    this.gameActors[0] = OctActor.alloc();
//    this.gameActors[0].updatePosition( GAMEVIEW.screen.w/2-30, GAMEVIEW.screen.h/2-60 );


};
WorldActor.prototype.addActor = function(act,type) {
    var c=0;
    if(type === "act") {
        this.gameActors.push(act);
    }
    else if(type === "art") {
        for(var i in this.gameArtbits)  {
            if(this.gameArtbits[i] != null && typeof this.gameArtbits[i] !== "undefined" )    c+=1;
            else                break;
        }
        this.gameArtbits[c]=act;
    }
};
WorldActor.prototype.updateAll = function() {
    this.update();

//    if(this.gamePlayer != null)     this.gamePlayer.update();

	for(var i in this.gameActors)
	{
		if(this.gameActors[i] instanceof Actor)  this.gameActors[i].update();
	}
	for(var i in this.gameArtbits)
	{
		this.gameArtbits[i].update();
	}
};


WorldActor.prototype.distributeInput = function(kInput)
{
    if(typeof kInput.keyID !== "undefined") {
        if(kInput.keyID == GAMECONTROL.keyIDs['KEY_DELETE'])        return true;
        if(kInput.keyID == GAMECONTROL.keyIDs['KEY_BACKSPACE'])     return true;
    }

        var used = false;

        used = used | this.readInput(kInput);

        if(this.gamePlayer != null && !used)	used = used | this.gamePlayer.readInput(kInput);
        return used;
};




WorldActor.prototype.update = function() {
	Actor.prototype.update.call(this);
};
WorldActor.prototype.draw = function() {

	Actor.prototype.draw.call(this);

	GAMEVIEW.clearDrawMods();
	GAMEVIEW.context.globalAlpha=1.0;
};

WorldActor.prototype.readInput = function(kInput) {
    var used = false;
    return used;
};
WorldActor.prototype.collideWorld = function() {

    if(this.gamePlayer instanceof Actor)
    {
        this.collide( this.gamePlayer );
    }
    for(var i in this.gameActors)
    {
        if(this.gameActors[i] instanceof Actor)
        {
            this.collide( this.gameActors[i] );
        }
    }

};
WorldActor.prototype.drawAll = function() {
//    GAMEVIEW.context.fillStyle = "#CCCCCC";
//    GAMEVIEW.context.fillRect( 0, 0, GAMEVIEW.screen.w, GAMEVIEW.screen.h );

    for(var i in this.gameActors)
    {
            this.gameActors[i].draw();
    }
    for(var i in this.gameArtbits)
    {
            this.gameArtbits[i].draw();
    }

    if(this.gamePlayer != null)     this.gamePlayer.draw();
    this.draw();
};
WorldActor.prototype.collideAll = function() {
    this.collideWorld();
    for(var i in this.gameActors)
    {
            if(this.gamePlayer instanceof Actor) {
                if(this.gameActors[i] instanceof Actor)
                {
                        this.gamePlayer.collide( this.gameActors[i] );
                        this.gameActors[i].collide( this.gamePlayer );
                }
            }
            for(var j in this.gameActors)
            {
                    if(this.gameActors[j] instanceof Actor && this.gameActors[i] != this.gameActors[j])
                    {
                            this.gameActors[j].collide( this.gameActors[i] );
                            this.gameActors[i].collide( this.gameActors[j] );
                    }
            }
    }
};

WorldActor.prototype.collideType = function(act) {
	return false;
};
WorldActor.prototype.collideVs = function(act) {

};
WorldActor.prototype.collide = function(act) {
	Actor.prototype.collide.call(this);
};


WorldActor.prototype.cleanAll = function() {

        for(var i in this.gameActors)
        {
                if(this.gameActors[i] instanceof Actor && this.gameActors[i].alive == false)
                {
                        this.gameActors[i].clear();
                        delete this.gameActors[i];
                }
        }
        for(var i in this.gameArtbits)
        {
                if(this.gameArtbits[i] instanceof Actor && this.gameArtbits[i].alive == false)
                {
                        this.gameArtbits[i].clear();
                        delete this.gameArtbits[i];
                }
        }

};




WorldActor.alloc = function() {
	var vc = new WorldActor();
	vc.init();
	return vc;
}

exports.WorldActor = WorldActor;
exports.WorldActor._loadJSEngineClasses = _loadJSEngineClasses;
