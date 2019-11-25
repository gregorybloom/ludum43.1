// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.level2 = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = nextlvl;

  this.level2_base(checkpt);
  this.level2_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.level2_base = function(checkpt)
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
LEVELLOADER.level2_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;



				        GW.gamePlayer = CharActor.alloc();
				        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
				        GW.gamePlayer.updatePosition({x:0,y:50});


								var TA = TextActor.alloc();
								TA.text = "Music - Jeremy 'Nitacku' Ouillette";
								TA.fontSize = 28;
								TA.heading.x = -1;
								TA.unitSpeed = 0.03;
								TA.intoTime = 6500;
								TA.fadeOutTime = 1500;
								TA.waitTime = 2000;
								TA.fadeInTime = 1500;
								TA.updatePosition({x:50,y:110});
								GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');

								var TA = TextActor.alloc();
								TA.text = "BARRIER";
								TA.fontSize = 32;
								TA.heading.x = -1;
								TA.unitSpeed = 0.03;
								TA.intoTime = 5500;
								TA.fadeOutTime = 1500;
								TA.fadeInTime = 1500;

								TA.updatePosition({x:50,y:-110});
								GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');


								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(10,8);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'9,0');
								grid.setStartPos({i:9,j:0});
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');

								grid.setGridData(1,0,8,0,'tile','riser',{filled:false});

								grid.setGridData(2,2,3,5,'tile','filler',{filled:false,color:2});
								grid.setGridData(6,2,7,5,'tile','filler',{filled:false,color:0});

								grid.setGridData(4,2,5,2,'tile','laserfield',{filled:true,damage:1,color:2,heading:'V',master:undefined,ends:[0,1]});
								grid.setGridData(4,5,5,5,'tile','laserfield',{filled:true,damage:1,color:0,heading:'V',master:undefined,ends:[0,1]});
								grid.nodeData['4,2']['tile']['laserfield'].damage=2;
								grid.nodeData['4,5']['tile']['laserfield'].damage=2;

								var blockset = [];
								for(var a=1;a<9;a++)				blockset.push({i:a,j:1});
								for(var b=2;b<6;b++)				blockset.push({i:1,j:b});
								for(var b=2;b<6;b++)				blockset.push({i:8,j:b});
								for(var a=4;a<6;a++) {
										for(var b=3;b<5;b++)		blockset.push({i:a,j:b});
								}
								for(var a=4;a<6;a++) {
										for(var b=6;b<8;b++)		blockset.push({i:a,j:b});
								}

								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}

								var O1 = OrbActor.alloc();
								O1.colorNum = 0;
								O1.deathTimer.lifeTime = 8000;
								O1.lifelineTimer.lifeTime = 8000 * 2;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'0,3');

								var O1 = OrbActor.alloc();
								O1.colorNum = 2;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'9,3');




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
