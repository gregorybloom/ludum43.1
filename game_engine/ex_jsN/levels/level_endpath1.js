// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelEndPath1 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "endpath2";

  this.levelEndPath1_base(checkpt);
  this.levelEndPath1_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelEndPath1_base = function(checkpt)
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

        GAMEMODEL.modelCamera.updatePosition({x:0,y:0});



        var CF = CamField.alloc();
        CF.player = GW.gamePlayer;
        GW.addActor(CF,'act');
        GW.camField = CF;

        if(checkpt) {
          GW.dropper.savedCheckpt = checkpt;
        }



};
LEVELLOADER.levelEndPath1_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "SACRIFICE";
TA.fontSize = 32;
TA.heading.x = -1;
TA.unitSpeed = 0.03;
TA.intoTime = 5500;
TA.fadeOutTime = 1500;
TA.fadeInTime = 1500;

TA.updatePosition({x:50,y:-110});
GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');



				        GW.gamePlayer = CharActor.alloc();
				        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
								GW.gamePlayer.updatePosition({x:0,y:0});



								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(5,5);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'0,0');
								grid.setStartPos({i:0,j:0});
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');




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
