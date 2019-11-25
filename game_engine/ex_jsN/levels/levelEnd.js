// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});




LEVELLOADER.levelEnd = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "End";

  this.levelEnd_base(checkpt);
  this.levelEnd_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelEnd_base = function(checkpt)
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
//        CF.updatePosition({x:GW.gamePlayer.position.x,y:(GW.gamePlayer.position.y-150)});
        GW.addActor(CF,'act');
        GW.camField = CF;

            var D = DropperActor.alloc();
            D.target = CF;
            D.updatePosition({x:CF.position.x,y:CF.position.y});
            GW.addActor(D,'act');
            GW.dropper = D;

        if(checkpt) {
          GW.dropper.savedCheckpt = checkpt;
        }




};
LEVELLOADER.levelEnd_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;

				var TA = TextActor.alloc();
				TA.text = "Thanks for playing...!";
				TA.fontSize = 24;
				TA.heading.x = -1;
				TA.unitSpeed = 0.03;
				TA.intoTime = 6500;
				TA.fadeOutTime = 1500;
				TA.fadeInTime = 1500;

				TA.updatePosition({x:50,y:-110});
				GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');


        GW.gamePlayer = CharActor.alloc();
        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
        GW.gamePlayer.updatePosition({x:0,y:50});
				GAMEMODEL.modelCamera.zoom = 0.5;





				var grid = BaseGrid.alloc();
				grid.updatePosition({x:0,y:0});
				grid.setGrid(6,6);
				grid.addObject('char',GW.gamePlayer,'0,0');
				grid.setStartPos({i:0,j:0});
				GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');


				var B1 = ExitActor.alloc();
				B1.toLevel = "alt1";
        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
				grid.addObject('act',B1,'6,0');

				var B1 = ExitActor.alloc();
				B1.toLevel = "altsecretA";
				B1.secret = true;
				B1.secretTimer = 5000;
        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
				grid.addObject('act',B1,'0,5');

				var TA = TextActor.alloc();
				TA.text = "Bonus Levels";
				TA.fontSize = 16;
				TA.heading.x = 0;
				TA.unitSpeed = 0;
				TA.intoTime = 9500;
				TA.fadeOutTime = 1500;
				TA.fadeInTime = 1500;

				TA.updatePosition({x:-23,y:-20});
				GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');

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
