// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.level3 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = nextlvl;

  this.level3_base(checkpt);
  this.level3_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.level3_base = function(checkpt)
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
LEVELLOADER.level3_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "WITHIN";
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
				        GW.gamePlayer.updatePosition({x:0,y:50});





								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(9,8);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'0,0');
								grid.setStartPos({i:0,j:0});
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');

								grid.setGridData(0,1,8,5,'tile','riser',{filled:false});
								grid.setGridData(0,6,1,6,'tile','riser',{filled:false});
								grid.setGridData(7,6,8,6,'tile','riser',{filled:false});
								delete grid.nodeData['1,6']['tile']['riser'];
								delete grid.nodeData['3,3']['tile']['riser'];
								delete grid.nodeData['5,4']['tile']['riser'];

								grid.setGridData(2,3,3,4,'tile','filler',{filled:false,color:0});
								grid.setGridData(5,3,6,4,'tile','filler',{filled:false,color:0});

								var blockset = [];
								blockset.push({i:5,j:0});
								blockset.push({i:5,j:1});
								blockset.push({i:5,j:2});
								blockset.push({i:4,j:1});
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
								blockset.push({i:3,j:7});

								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}

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
