// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelTest1 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = nextlvl;

  this.levelTest1_base(checkpt);
  this.levelTest1_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
	GAMEMUSIC.stopAudio();
};
LEVELLOADER.levelTest1_base = function(checkpt)
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
LEVELLOADER.levelTest1_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;



        GW.gamePlayer = CharActor.alloc();
        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
        GW.gamePlayer.updatePosition({x:0,y:0});





				var grid = BaseGrid.alloc();
				grid.updatePosition({x:0,y:0});
				grid.setGrid(12,12);
				GAMEMODEL.modelCamera.zoom = 0.75;
				grid.addObject('char',GW.gamePlayer,'0,0');
				grid.setStartPos({i:0,j:0});
				GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');

				//	(x1,y1,x2,y2,type,names,data)
				grid.setGridData(1,2,3,4,'tile','riser',{filled:false});
				grid.setGridData(5,5,6,6,'tile','filler',{filled:false,color:0});
				grid.setGridData(7,5,7,6,'tile','filler',{filled:true,color:0});
				grid.setGridData(0,10,1,11,'tile','filler',{filled:false,color:3});

				grid.setGridData(8,8,9,9,'tile','riser',{filled:false});
				grid.setGridData(8,8,9,9,'tile','filler',{filled:false,color:0});
				grid.setGridData(11,11,11,11,'tile','pit',{filled:false});

				grid.setGridData(0,9,0,9,'tile','igniter',{filled:false,color:0,target:{i:2,j:7},targets:[{i:0,j:11},{i:1,j:10}]});
				grid.setGridData(5,0,5,0,'tile','laserfield',{filled:false,damage:1,color:2,heading:'H',master:undefined,ends:[0,1]});
				grid.setGridData(6,0,6,0,'tile','laserfield',{filled:true,damage:1,color:2,heading:'H',master:undefined,ends:[0,1]});
				grid.setGridData(5,2,5,2,'tile','laserfield',{filled:false,damage:2,color:2,heading:'H',master:undefined,ends:[0,1]});
				grid.setGridData(6,2,6,2,'tile','laserfield',{filled:true,damage:2,color:2,heading:'H',master:undefined,ends:[0,1]});

				grid.setGridData(9,4,9,4,'tile','laserfield',{filled:true,damage:3,color:2,heading:'V',master:undefined,ends:[0,1]});
				grid.setGridData(9,5,9,5,'tile','laserfield',{filled:false,damage:3,color:2,heading:'V',master:undefined,ends:[0,1]});
				grid.setGridData(11,4,11,4,'tile','laserfield',{filled:true,damage:4,color:2,heading:'V',master:undefined,ends:[0,1]});
				grid.setGridData(11,5,11,5,'tile','laserfield',{filled:false,damage:4,color:2,heading:'V',master:undefined,ends:[0,1]});

				grid.setGridData(0,9,0,9,'lines','line0-9a',{color:0,master:{i:0,j:9},target:{i:2,j:7},lines:[{i:0,j:9},{i:0,j:8},{i:0,j:7},{i:1,j:7},{i:2,j:7}]});
				grid.setGridData(0,9,0,9,'lines','line0-9b',{color:0,master:{i:0,j:9},lines:[{i:0,j:9},{i:0,j:10},{i:0,j:11}]});
				grid.setGridData(0,9,0,9,'lines','line0-9c',{color:0,master:{i:0,j:9},lines:[{i:0,j:10},{i:1,j:10}]});

				var B1 = BlockActor.alloc();
        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
				grid.addObject('act',B1,'2,7');
				var B1 = BlockActor.alloc();
        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
				B1.solid = false;
				grid.addObject('act',B1,'0,11');
				var B1 = BlockActor.alloc();
        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
				B1.solid = false;
				grid.addObject('act',B1,'1,10');


				var B1 = BlockActor.alloc();
        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
				grid.addObject('act',B1,'0,5');

				for(var i=7; i<=11; i++) {
					if(i==10)	continue;
					var B1 = BlockActor.alloc();
	        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
					grid.addObject('act',B1,(i+',3'));
				}
				for(var j=0; j<=2; j++) {
					if(j==1)	continue;
					var B1 = BlockActor.alloc();
	        GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
					grid.addObject('act',B1,('7,'+j));
				}
				grid.setGridData(8,0,11,2,'tile','riser',{filled:false});
				grid.setGridData(10,3,10,3,'tile','pit',{filled:false});
				grid.setGridData(7,1,7,1,'tile','pit',{filled:false});



				var BS1 = BoxShiftActor.alloc();
				BS1.setBoxType(1);
        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
				grid.addObject('act',BS1,'8,7');

				var BS11 = BoxShiftActor.alloc();
				BS11.setBoxType(1);
        GAMEMODEL.gameSession.gameWorld.addActor(BS11,'act');
				grid.addObject('act',BS11,'6,8');

				var BS2 = BoxShiftActor.alloc();
				BS2.setBoxType(2);
        GAMEMODEL.gameSession.gameWorld.addActor(BS2,'act');
				grid.addObject('act',BS2,'5,9');

				var BS3 = BoxShiftActor.alloc();
				BS3.setBoxType(3);
        GAMEMODEL.gameSession.gameWorld.addActor(BS3,'act');
				grid.addObject('act',BS3,'10,7');

				var BS3 = BoxShiftActor.alloc();
				BS3.setBoxType(1);
				BS3.shiftType.u = 0;
				BS3.shiftType.r = 0;
        GAMEMODEL.gameSession.gameWorld.addActor(BS3,'act');
				grid.addObject('act',BS3,'2,8');





				var O1 = OrbActor.alloc();
				O1.colorNum = 3;
        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
				grid.addObject('act',O1,'8,2');



				var O1 = OrbActor.alloc();
				O1.colorNum = 2;
				O1.lifelineTimer.lifeTime = 16000;
        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
				grid.addObject('act',O1,'9,2');



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
