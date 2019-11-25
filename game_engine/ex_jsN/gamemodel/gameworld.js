// CommonJS ClassLoader Hack
var classLoadList = ["Actor","WorldActor","LEVELLOADER","CharActor","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GameWorld"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});





function GameWorld() {
}
GameWorld.prototype = new WorldActor;
GameWorld.prototype.identity = function() {
	return ('GameWorld (' +this._dom.id+ ')');
};

GameWorld.prototype.init = function() {
	WorldActor.prototype.init.call(this);

    this.size = {w:800,h:10000};
    this.updatePosition({x:(this.size.w/2),y:(this.size.h/2)});

    this.dropper = null;
    this.camField = null;

    this.regenLists();

    this.borderBlock = "NESW";
};

GameWorld.prototype.clear = function() {
//    WorldActor.prototype.clear.call(this);

    for(var j in this.lists) {
        var actorList = this.lists[j];
        for(var i in actorList) {
            actorList[i].clear();
            actorList.splice(i,1);
        }
    }
    this.regenLists();
};
GameWorld.prototype.regenLists = function() {
    this.gameActors = [];
    this.gameLasers = [];
		this.gameRays = [];
    this.gameObstacles = [];
    this.gamePlayers = [];
		this.gameShots = [];
		this.gameBackgrounds = [];


    this.lists = {};
		this.lists['backgrounds'] = this.gameBackgrounds;
		this.lists['rays'] = this.gameRays;
    this.lists['lasers'] = this.gameLasers;
    this.lists['obstacles'] = this.gameObstacles;
    this.lists['actors'] = this.gameActors;
    this.lists['players'] = this.gamePlayers;
		this.lists['bullets'] = this.gameShots;
};
GameWorld.prototype.load = function() {


//	this.gamePlayer = GameChar.alloc();
//	this.gamePlayer.updatePosition( GAMEVIEW.screen.w/2, GAMEVIEW.screen.h/2 );

//    this.gameActors[0] = OctActor.alloc();
//    this.gameActors[0].updatePosition( GAMEVIEW.screen.w/2-30, GAMEVIEW.screen.h/2-60 );


};
GameWorld.prototype.addActor = function(act,type) {
    var c=0;
    if(type === "laser") {
        this.gameLasers.push(act);
    }
		else if(type === "bullet") {
        this.gameShots.push(act);
    }
		else if(type === "ray") {
        this.gameRays.push(act);
    }
    else if(type === "obstacle") {
        this.gameObstacles.push(act);
    }
    else if(type === "player") {
        this.gamePlayers.push(act);
    }
		else if(type === "background") {
        this.gameBackgrounds.push(act);
    }
    else        WorldActor.prototype.addActor.call(this,act,type);
};
GameWorld.prototype.update = function() {

    WorldActor.prototype.update.call(this);

    GAMEMODEL.activeObjs = 0;
    for(var j in this.lists) {
        var actorList = this.lists[j];
        for(var i in actorList) {
            if(actorList[i].alive) {
                GAMEMODEL.activeObjs+=1;
            }
        }
    }

		if(this.gamePlayer instanceof Actor) {
			if(GAMEMODEL.currentLevel != -1 && !this.gamePlayer.alive) {
//				GAMEMODEL.currentLevel = -1;
			}
		}
    if(GAMEMODEL.currentLevel != GAMEMODEL.goToLevel) {
			if(this.dropper instanceof DropperActor && this.dropper.savedCheckpt) {
      		LEVELLOADER.loadLevel(GAMEMODEL.goToLevel,this.dropper.savedCheckpt);
 			}
			else {
        	LEVELLOADER.loadLevel(GAMEMODEL.goToLevel);
			}
    }


};
GameWorld.prototype.draw = function() {

//    WorldActor.prototype.draw.call(this);

    var frame = GAMEANIMATIONS.getAnimationFrame(2, 0, 2);
    var tilesize = {w:16,h:16};
    var tileset = {w:0,h:0};
    tileset.w = Math.ceil(this.size.w / tilesize.w);
    tileset.h = Math.ceil(this.size.h / tilesize.h);
    for(var j=0; j<tileset.h; j++)
    {
        for(var i=0; i<tileset.w; i++)
        {
            var newpos = {x:0,y:0};
            newpos.x = tilesize.w* (0.5+ i) + this.absBox.x;
            newpos.y = tilesize.h* (0.5+ j) + this.absBox.y;
//            GAMEVIEW.drawFromAnimationFrame(frame, newpos, {x:0,y:0}, {x:0,y:0}, 0, null);
        }
    }

    GAMEVIEW.drawBox(this.absBox, "black");     /**/
};


GameWorld.prototype.updateAll = function() {
    this.cleanAll();
    WorldActor.prototype.updateAll.call(this);

    for(var j in this.lists) {
        var actorList = this.lists[j];
        if(j == "actors")               continue;
        for(var i in actorList) {
            if(actorList[i] instanceof Actor)  actorList[i].update();
        }
    }
//    if(this.gamePlayer != null)     this.gamePlayer.update();
};

GameWorld.prototype.drawAll = function() {

//    GAMEVIEW.context.fillStyle = "#CCCCCC";
//    GAMEVIEW.context.fillRect( 0, 0, GAMEVIEW.screen.w, GAMEVIEW.screen.h );
    var frame = GAMEANIMATIONS.getAnimationFrame(2, 0, 2);
    var camera = GAMEMODEL.modelCamera;


    for(var j in this.lists) {
        var actorList = this.lists[j];
//				console.log(j);
        for(var i in actorList) {
            actorList[i].draw();
        }
    }
    if(this.gamePlayer != null)     this.gamePlayer.draw();
    this.draw();
};



GameWorld.prototype.readInput = function(kInput) {
    var used = false;
    return used;
};


GameWorld.prototype.cleanAll = function() {

    for(var j in this.lists) {
        var actorList = this.lists[j];
        for(var i in actorList) {
            if(actorList[i] instanceof Actor && actorList[i].alive == false)
            {
                    actorList.splice(i,1);
            }
        }
    }

};


GameWorld.prototype.collide = function(act) {
    if(typeof act === "undefined")      return;
    if( !this.alive || !act.alive )             return;
    if(  this.collideType(act) != true  )                           return;
    if(  GAMEGEOM.BoxContains(this.absBox, act.absBox)==false  )
    {
        this.collideVs(act);
    }
};

GameWorld.prototype.collideType = function(act) {
    if(act instanceof CharActor)    return true;
    return false;
};
GameWorld.prototype.collideVs = function( actor ) {

    if(actor instanceof CharActor && (GAMEGEOM.BoxContains(this.absBox, actor.absBox)==false)) {
        if(actor.deathBegin)            return;
        var shiftpos = {x:0,y:0};
        if( actor.absBox.y < this.absBox.y && this.borderBlock.indexOf("N") !== -1)
        {
            var ptA = this.absBox.y;
            var ptactA = actor.absBox.y;
            if(ptactA < ptA)                shiftpos.y = ptA - ptactA;
        }
        if( this.borderBlock.indexOf("E") !== -1 )
        {
            var ptC = this.absBox.x + this.absBox.w;
            var ptactC = actor.absBox.x + actor.absBox.w;
            if(ptactC > ptC)                shiftpos.x = ptC - ptactC;
        }
        if( this.borderBlock.indexOf("S") !== -1 )
        {
            var ptD = this.absBox.y + this.absBox.h;
            var ptactD = actor.absBox.y + actor.absBox.h;
            if(ptactD > ptD)                shiftpos.y = ptD - ptactD;
        }
        if( actor.absBox.x < this.absBox.x && this.borderBlock.indexOf("W") !== -1 )
        {
            shiftpos.x = this.absBox.x - actor.absBox.x;
        }

        if(shiftpos.x != 0 || shiftpos.y != 0)
        {
            actor.shiftPosition(shiftpos);
        }
    }
};



GameWorld.prototype.collideWorld = function() {
		var collideAList = function(actorList1,actor) {
	//        for(var i in actorList1) {
				for(var i=0; i<actorList1.length; i++) {

						if(typeof actorList1[i] === "undefined")    continue;
						if(!actorList1[i].alive)   									continue;
						if(typeof actor === "undefined")    continue;
						if(actorList1[i] instanceof Actor && actor instanceof Actor)
						{
								if(actorList1[i] != actor)
								{
										actor.collide( actorList1[i] );
										actorList1[i].collide( actor );
								}
						}
				}
		};

    if(this.gamePlayer instanceof Actor)
    {
        this.gamePlayer.collide( this );
        this.collide( this.gamePlayer );
    }
		if(this.camField instanceof Actor)
		{
			var listnames = ['bullets','obstacles','actors'];
			for(var i in listnames) {
				collideAList( this.lists[ listnames[i] ],this.camField );
			}
		}

};
GameWorld.prototype.collideAll = function() {
    var collideLists = function(actorList1,actorList2) {
//        for(var i in actorList1) {
					for(var i=0; i<actorList1.length; i++) {

            if(typeof actorList1[i] === "undefined")    continue;
						if(!actorList1[i].alive)   									continue;
						for(var j=0; j<actorList2.length; j++) {
//            for(var j in actorList2) {
                if(typeof actorList2[j] === "undefined")    continue;
                if(actorList1[i] instanceof Actor && actorList2[j] instanceof Actor)
                {
                    if(actorList1[i] != actorList2[j])
                    {
                        actorList2[j].collide( actorList1[i] );
                        actorList1[i].collide( actorList2[j] );
                    }
                }
            }
        }
    };

//    WorldActor.prototype.collideAll.call(this);
    this.collideWorld();

    var cPhases = ["PHYSICAL","LASERBLOCK","LASERTOUCH","EFFECTS"];

    for(var p in cPhases) {
        var phase = cPhases[p];
        GAMEMODEL.collideMode = phase;

        if(phase == "PHYSICAL") {
						collideLists(  this.lists['bullets'],this.lists['obstacles']  );
            collideLists(  this.lists['players'],this.lists['obstacles']  );
            collideLists(  this.lists['players'],this.lists['actors']  );
						collideLists(  this.lists['actors'],this.lists['actors']  );
        }
        else if(phase == "LASERBLOCK") {
            collideLists(  this.lists['lasers'],this.lists['obstacles']  );
            collideLists(  this.lists['lasers'],this.lists['actors']  );
            collideLists(  this.lists['lasers'],this.lists['players']  );
						collideLists(  this.lists['rays'],this.lists['lasers']  );
						collideLists(  this.lists['rays'],this.lists['obstacles']  );
						collideLists(  this.lists['rays'],this.lists['actors']  );
        }
        else if(phase == "LASERTOUCH") {
						collideLists(  this.lists['lasers'],this.lists['actors']  );
            collideLists(  this.lists['rays'],this.lists['actors']  );
						collideLists(  this.lists['rays'],this.lists['players']  );
        }
        else if(phase == "EFFECTS") {
						collideLists(  this.lists['lasers'],this.lists['players']  );
            collideLists(  this.lists['lasers'],this.lists['actors']  );
						collideLists(  this.lists['actors'],this.lists['bullets']  );
            collideLists(  this.lists['players'],this.lists['obstacles']  );
						collideLists(  this.lists['players'],this.lists['bullets']  );
        }

    }
/*
    this.lists['lasers'] = this.gameLasers;
    this.lists['obstacles'] = this.gameObstacles;
    this.lists['actors'] = this.gameActors;
    this.lists['players'] = this.gamePlayers;

/*
    for(var a in this.lists) {
        var actorList = this.lists[a];

        for(var i in actorList) {
            if(a == "actors")         continue;
            if(actorList[i] instanceof Actor && actorList[i].alive && this.gamePlayer instanceof Actor)
            {
                this.gamePlayer.collide( actorList[i] );
                actorList[i].collide( this.gamePlayer );
            }
        }
    }
/**/

};

GameWorld.alloc = function() {
	var vc = new GameWorld();
	vc.init();
	return vc;
}


exports.GameWorld = GameWorld;
exports.GameWorld._loadJSEngineClasses = _loadJSEngineClasses;
