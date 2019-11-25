// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.level5 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = 'end';

  this.level5_base(checkpt);
  this.level5_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.level5_base = function(checkpt)
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
LEVELLOADER.level5_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;

var TA = TextActor.alloc();
TA.text = "ACHE";
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
								grid.setGrid(12,8);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'11,0');
								grid.setStartPos({i:11,j:0});
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');


								var blockset = [];
								for(var b=0;b<4;b++) {
									blockset.push({i:9,j:b});
									blockset.push({i:5,j:b});
									blockset.push({i:2,j:b});
								}
								for(var a=2;a<12;a++) {
										if(a != 7 && a != 4)	blockset.push({i:a,j:3});
								}
								blockset.push({i:2,j:4});
								blockset.push({i:1,j:2});
//								blockset.push({i:2,j:6});

								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									if(name == "5,2")		B1.solid = false;
									grid.addObject('act',B1,name);
								}
								grid.setGridData(10,2,10,2,'tile','igniter',{filled:false,color:0,targets:[{i:9,j:0},{i:9,j:1},{i:5,j:2}]});
								grid.setGridData(10,2,10,2,'lines','line10-2a',{color:0,master:{i:10,j:2},target:{i:9,j:0},lines:[{i:9,j:0},{i:10,j:0},{i:10,j:1},{i:10,j:2}]});
								grid.setGridData(10,2,10,2,'lines','line10-2b',{color:0,master:{i:10,j:2},target:{i:9,j:1},lines:[{i:9,j:1},{i:10,j:1}]});
								grid.setGridData(10,2,10,2,'lines','line10-2c',{color:0,master:{i:10,j:2},target:{i:5,j:2},lines:[{i:5,j:2},{i:6,j:2},{i:7,j:2},{i:8,j:2},{i:9,j:2},{i:10,j:2}]});

								grid.setGridData(7,3,7,3,'tile','laserfield',{filled:true,damage:1,color:2,heading:'H',master:undefined,ends:[0,1]});

								grid.setGridData(0,3,0,3,'tile','igniter',{filled:false,color:0,targets:[{i:5,j:2}]});
								grid.setGridData(0,3,0,3,'lines','line4-4a',{color:0,master:{i:0,j:3},target:{i:5,j:2},lines:[{i:0,j:3},{i:0,j:2},{i:1,j:2},{i:2,j:2},{i:3,j:2},{i:4,j:2},{i:4,j:2},{i:5,j:2}]});

								var O1 = OrbActor.alloc();
								O1.colorNum = 1;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'3,2');

								grid.setGridData(10,6,11,7,'tile','filler',{filled:false,color:1});
								grid.setGridData(3,0,4,1,'tile','filler',{filled:false,color:0});
								grid.setGridData(0,0,1,1,'tile','filler',{filled:false,color:0});

								grid.setGridData(3,5,8,7,'tile','riser',{filled:false});


								var shiftblockset = [];
								shiftblockset.push({i:4,j:5,t:1});
								shiftblockset.push({i:5,j:5,t:1});
								shiftblockset.push({i:7,j:4,t:1});
								shiftblockset.push({i:6,j:5,t:1});
								shiftblockset.push({i:0,j:5,t:1});

								// horizontals
								shiftblockset.push({i:8,j:4,t:2});
								shiftblockset.push({i:7,j:7,t:2});
								shiftblockset.push({i:3,j:4,t:2});
								shiftblockset.push({i:3,j:5,t:2});
								shiftblockset.push({i:5,j:4,t:2});
								shiftblockset.push({i:2,j:6,t:2});

								// verticals
								shiftblockset.push({i:7,j:5,t:3});
								shiftblockset.push({i:8,j:5,t:3});
								shiftblockset.push({i:1,j:5,t:3});

								for(var i in shiftblockset) {
									var BS1 = BoxShiftActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
									var name = shiftblockset[i].i+','+shiftblockset[i].j;
									BS1.setBoxType(shiftblockset[i].t);
									grid.addObject('act',BS1,name);
								}




								/*
								grid.setGridData(1,3,1,3,'tile','filler',{filled:false,color:1});
								grid.setGridData(2,3,2,3,'tile','filler',{filled:false,color:2});
								grid.setGridData(4,3,5,3,'tile','pit',{filled:false});

								grid.setGridData(2,5,2,5,'tile','laserfield',{filled:true,damage:1,color:1,heading:'V',master:undefined,ends:[0,1]});


								var O1 = OrbActor.alloc();
								O1.colorNum = 1;
								O1.deathTimer.lifeTime = 8000 * 1.5;
								O1.lifelineTimer.lifeTime = 8000 * 1.5;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'1,5');

								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(1);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'7,4');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(3);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'7,2');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(3);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'7,5');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(3);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'6,3');

								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(2);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'6,5');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(2);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'8,3');
								var BS1 = BoxShiftActor.alloc();
								BS1.setBoxType(2);
				        GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
								grid.addObject('act',BS1,'8,4');


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
