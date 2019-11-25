// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelAlt2 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "alt3";

  this.levelAlt2_base(checkpt);
  this.levelAlt2_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelAlt2_base = function(checkpt)
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
LEVELLOADER.levelAlt2_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "ENTANGLE";
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
								grid.setGrid(9,8);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'0,0');
								grid.setStartPos({i:0,j:0});

								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');

								grid.setGridData(0,1,8,5,'tile','riser',{filled:false});
								grid.setGridData(0,6,2,6,'tile','riser',{filled:false});
								grid.setGridData(5,6,8,6,'tile','riser',{filled:false});
//								delete grid.nodeData['1,6']['tile']['riser'];
								delete grid.nodeData['3,3']['tile']['riser'];
								delete grid.nodeData['4,4']['tile']['riser'];
								delete grid.nodeData['5,4']['tile']['riser'];

								grid.setGridData(0,0,3,7,'tile','filler',{filled:false,color:0});
								grid.setGridData(4,0,8,7,'tile','filler',{filled:false,color:2});
								delete grid.nodeData['4,0']['tile']['filler'];
								delete grid.nodeData['1,2']['tile']['filler'];
								delete grid.nodeData['1,3']['tile']['filler'];
								delete grid.nodeData['2,2']['tile']['filler'];
								delete grid.nodeData['1,4']['tile']['filler'];
								delete grid.nodeData['1,5']['tile']['filler'];
								delete grid.nodeData['3,5']['tile']['filler'];
								delete grid.nodeData['3,6']['tile']['filler'];
								delete grid.nodeData['3,7']['tile']['filler'];
								delete grid.nodeData['4,1']['tile']['filler'];
								delete grid.nodeData['4,2']['tile']['filler'];
								delete grid.nodeData['4,3']['tile']['filler'];
								delete grid.nodeData['4,5']['tile']['filler'];
								delete grid.nodeData['4,6']['tile']['filler'];
								delete grid.nodeData['4,7']['tile']['filler'];
								delete grid.nodeData['5,1']['tile']['filler'];
								delete grid.nodeData['5,2']['tile']['filler'];
								delete grid.nodeData['6,5']['tile']['filler'];
								delete grid.nodeData['7,2']['tile']['filler'];
								delete grid.nodeData['7,3']['tile']['filler'];
								delete grid.nodeData['7,4']['tile']['filler'];
								delete grid.nodeData['7,5']['tile']['filler'];

								var blockset = [];
//								blockset.push({i:5,j:0});
								blockset.push({i:5,j:1});
								blockset.push({i:5,j:2});
//								blockset.push({i:4,j:1});
								blockset.push({i:4,j:6});
								blockset.push({i:4,j:2});
								blockset.push({i:4,j:3});
								blockset.push({i:1,j:2});
								blockset.push({i:2,j:2});
								blockset.push({i:7,j:2});
								blockset.push({i:7,j:3});
								blockset.push({i:7,j:5});
								blockset.push({i:6,j:5});
								blockset.push({i:4,j:5});
								blockset.push({i:3,j:5});
								blockset.push({i:1,j:5});
								blockset.push({i:1,j:4});
								blockset.push({i:3,j:6});
//								blockset.push({i:3,j:7});

								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}


																var O1 = OrbActor.alloc();
																O1.colorNum = 2;
																O1.deathTimer.lifeTime = 8000 * 2;
																O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
												        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
																grid.addObject('act',O1,'4,0');
																var O1 = OrbActor.alloc();
																O1.colorNum = 0;
																O1.deathTimer.lifeTime = 8000 * 2;
																O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
												        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
																grid.addObject('act',O1,'4,1');



								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'2,6');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'5,6');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'3,1');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'6,1');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'3,7');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'4,4');

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
