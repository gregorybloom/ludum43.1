// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelEndPath3 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "endpath4";

  this.levelEndPath3_base(checkpt);
  this.levelEndPath3_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelEndPath3_base = function(checkpt)
{
        GAMEMODEL.modelClock.changeRate(1);

        GAMEMODEL.activeObjs = 0;

        var GW = GameWorld.alloc();

        GAMEMODEL.gameSession.gameWorldList[0]=GW;
        GAMEMODEL.gameSession.gameWorld=GW;
        GAMEMODEL.gameSession.gameWorld.clear();


        GW.load();
        GW.size = {w:800,h:600};
        GW.updatePosition({x:0,y:0});

        GAMEMODEL.modelCamera.updatePosition({x:0,y:-20});



        var CF = CamField.alloc();
        CF.player = GW.gamePlayer;
        GW.addActor(CF,'act');
        GW.camField = CF;

        if(checkpt) {
          GW.dropper.savedCheckpt = checkpt;
        }



};
LEVELLOADER.levelEndPath3_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "FLY";
TA.fontSize = 32;
TA.heading.x = -1;
TA.unitSpeed = 0.03;
TA.intoTime = 5500;
TA.fadeOutTime = 1500;
TA.fadeInTime = 1500;

TA.updatePosition({x:50,y:-147});
GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');



				        GW.gamePlayer = CharActor.alloc();
				        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
								GW.gamePlayer.updatePosition({x:0,y:0});



								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(12,11);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'0,8');
								grid.setStartPos({i:0,j:8});
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');

								grid.setGridData(5,2,6,2,'tile','filler',{filled:false,color:1});
									grid.setGridData(0,6,8,7,'tile','riser',{filled:false});
									grid.setGridData(0,9,9,10,'tile','riser',{filled:false});
									grid.setGridData(10,2,11,10,'tile','riser',{filled:false});
									grid.setGridData(8,0,11,1,'tile','riser',{filled:false});
									grid.setGridData(8,3,8,4,'tile','riser',{filled:false});

								grid.setGridData(1,8,1,8,'tile','laserfield',{filled:true,damage:1,color:1,heading:'V',master:undefined,ends:[0,1]});
								grid.setGridData(7,8,7,8,'tile','laserfield',{filled:true,damage:1,color:0,heading:'V',master:undefined,ends:[0,1]});
								grid.setGridData(7,2,7,2,'tile','laserfield',{filled:true,damage:1,color:1,heading:'V',master:undefined,ends:[0,1]});
								grid.setGridData(9,5,9,5,'tile','laserfield',{filled:true,damage:1,color:2,heading:'H',master:undefined,ends:[0,1]});

								var blockset = [];
								for(var x=0;x<12;x++) {
										if(x!=9)			blockset.push({i:x,j:5});
								}
								blockset.push({i:1,j:6});
								blockset.push({i:1,j:7});
								blockset.push({i:1,j:9});
								blockset.push({i:1,j:10});
								for(var y=0;y<11;y++) {
										if(y!=8 && y!=2)			blockset.push({i:7,j:y});
								}
								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}

								var orbset = [];
								orbset.push({i:0,j:6,n:1});
								orbset.push({i:0,j:10,n:2});
								orbset.push({i:2,j:6,n:2});
								orbset.push({i:2,j:10,n:0});
								orbset.push({i:6,j:6,n:1});
								orbset.push({i:6,j:10,n:1});

								orbset.push({i:2,j:8,n:1});
								orbset.push({i:3,j:8,n:0});
								orbset.push({i:4,j:8,n:2});
								orbset.push({i:5,j:8,n:0});
								orbset.push({i:6,j:8,n:2});

								orbset.push({i:8,j:8,n:0});
								orbset.push({i:9,j:8,n:1});
								orbset.push({i:9,j:7,n:2});
								orbset.push({i:9,j:6,n:1});
								orbset.push({i:9,j:4,n:0});
								orbset.push({i:9,j:3,n:1});
								orbset.push({i:9,j:2,n:2});
								orbset.push({i:8,j:2,n:1});


								for(var i in orbset) {
									var O1 = OrbActor.alloc();
									O1.colorNum = orbset[i].n;
									O1.deathTimer.lifeTime = 8000 * 2;
									O1.lifelineTimer.lifeTime = 8000 * 2*4;
									GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
									var name = orbset[i].i+','+orbset[i].j;
									grid.addObject('act',O1,name);
								}

/*

								grid.setGridData(2,4,2,4,'tile','pit',{filled:false});
								grid.setGridData(4,2,4,2,'tile','pit',{filled:false});

								grid.setGridData(3,3,4,4,'tile','filler',{filled:false,color:0});
								grid.setGridData(3,3,4,4,'tile','riser',{filled:false});


/*
phases -
  startup
    titlecard & names
        - "StarPath"
        - "Development by Gregory Bloom"
        - "Music by Jeremy Ouillette"
  opening measure
        - base circle, shooting left, at bottom
          - "teleport to move!"
        - then, following circle: "Use big teleports by holding and releasing SPACEBAR!"
          - base circle, shooting right, at top. holds blue orb


    /**/

};
