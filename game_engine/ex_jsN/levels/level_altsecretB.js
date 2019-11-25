// CommonJS ClassLoader Hack
var classLoadList = ["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



LEVELLOADER.levelAltSecretB = function(nextlvl,args) {
  var checkpt;
  if(args) {
    checkpt = JSON.parse(JSON.stringify(args));
  }
	GAMEMODEL.nextLevelUp = "endpath3";

  this.levelAltSecretB_base(checkpt);
  this.levelAltSecretB_dropper();

  GAMEMUSIC.currSong=0;
	//  GAMEMUSIC.playAudio();
};
LEVELLOADER.levelAltSecretB_base = function(checkpt)
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

        GAMEMODEL.modelCamera.updatePosition({x:-10,y:-20});


        var CF = CamField.alloc();
        CF.player = GW.gamePlayer;
        GW.addActor(CF,'act');
        GW.camField = CF;

        if(checkpt) {
          GW.dropper.savedCheckpt = checkpt;
        }



};
LEVELLOADER.levelAltSecretB_dropper = function()
{
  var GW = GAMEMODEL.gameSession.gameWorld;

var prepactors = ACTOR_FACTORY.prepActors;
var preptext = ACTOR_FACTORY.prepTextActor;
var prepjump = ACTOR_FACTORY.prepJumpActor;


var TA = TextActor.alloc();
TA.text = "LOST";
TA.fontSize = 32;
TA.heading.x = -1;
TA.unitSpeed = 0.03;
TA.intoTime = 5500;
TA.fadeOutTime = 1500;
TA.fadeInTime = 1500;

TA.updatePosition({x:50,y:-135});
GAMEMODEL.gameSession.gameWorld.addActor(TA,'act');



				        GW.gamePlayer = CharActor.alloc();
				        GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
								GW.gamePlayer.updatePosition({x:0,y:0});



								var grid = BaseGrid.alloc();
								grid.updatePosition({x:0,y:0});
								grid.setGrid(15,10);
								GAMEMODEL.modelCamera.zoom = 0.5;
								grid.addObject('char',GW.gamePlayer,'7,9');
								grid.setStartPos({i:7,j:9});
								grid.startColorNum = 3;
								GAMEMODEL.gameSession.gameWorld.addActor(grid,'act');




								grid.setGridData(3,0,3,5,'tile','pit',{filled:false});
								grid.setGridData(11,0,11,5,'tile','pit',{filled:false});
								grid.setGridData(0,0,0,0,'tile','pit',{filled:false});
								grid.setGridData(14,0,14,0,'tile','pit',{filled:false});


								var delpts=[];
								delpts.push({i:0,j:5, w:3,h:5});
								delpts.push({i:12,j:5, w:3,h:5});

//								delpts.push({i:0,j:7, w:5,h:3});
//								delpts.push({i:10,j:7, w:5,h:3});

								for(var a in delpts) {
										var delset = delpts[a];
										for(var J=delset.j; J<(delset.j+delset.h);J++) {
											for(var I=delset.i; I<(delset.i+delset.w);I++) {
												var delstr=I+','+J;
												grid.deletePoint(delstr);
											}
										}
								}



								for(var j=0; j<5; j+=1) {
									for(var i=4; i<11; i+=1) {
										if((j%2)==0 && (i%2)==1)		continue;
										if((j%2)==1 && (i%2)==0)		continue;
										var B1 = BlockActor.alloc();
										GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
										var name = i+','+j;
										grid.addObject('act',B1,name);
									}
								}

								for(var j=0; j<5; j+=1) {
									for(var i=4; i<11; i+=1) {
										if((j%2)==0 && (i%2)==0)		continue;
										if((j%2)==1 && (i%2)==1)		continue;
										var targetlist=[];
										if(j > 0)	targetlist.push({'i':i,'j':(j-1)});
										if(j < 4)	targetlist.push({'i':i,'j':(j+1)});
										if(i > 4)	targetlist.push({'i':(i-1),'j':j});
										if(i < 10)	targetlist.push({'i':(i+1),'j':j});
										grid.setGridData(i,j,i,j,'tile','igniter',{filled:false,color:0,targets:targetlist,innerc:[1,2]});
									}
								}

								grid.setGridData(3,9,3,9,'tile','igniter',{filled:false,color:1,targets:[{'i':12,'j':1}]});
								var targetlist=[];
								for(i=3;i<12;i++)			targetlist.push({'i':i,'j':9});
								grid.setGridData(3,9,3,9,'lines','line3-9a',{color:1,master:{i:3,j:9},target:{i:12,j:1},lines:targetlist});
								var targetlist2=[];
								for(j=4;j>0;j--)			targetlist2.push({'i':14,'j':j});
								for(i=14;i>11;i--)			targetlist2.push({'i':i,'j':1});
								grid.setGridData(3,9,3,9,'lines','line3-9b',{color:1,master:{i:3,j:9},target:{i:12,j:1},lines:targetlist2});


								var shiftblockset = [];
								shiftblockset.push({i:3,j:7,t:1});
								shiftblockset.push({i:11,j:7,t:1});

								shiftblockset.push({i:7,j:6,t:1});
								//maze
								shiftblockset.push({i:6,j:3,t:2});
								shiftblockset.push({i:7,j:0,t:1});
								// right wing
								shiftblockset.push({i:12,j:0,t:1});
								shiftblockset.push({i:12,j:1,t:2});
								shiftblockset.push({i:13,j:1,t:2});
								shiftblockset.push({i:12,j:2,t:3});
								shiftblockset.push({i:13,j:2,t:2});
								shiftblockset.push({i:14,j:3,t:2});
								shiftblockset.push({i:12,j:4,t:2});
								// left wing
//								shiftblockset.push({i:0,j:0,t:1});
								shiftblockset.push({i:1,j:1,t:3});
								shiftblockset.push({i:2,j:1,t:3});
								shiftblockset.push({i:2,j:2,t:2});
								shiftblockset.push({i:1,j:3,t:1});
								shiftblockset.push({i:2,j:4,t:2});
								shiftblockset.push({i:2,j:3,t:3});
								for(var i in shiftblockset) {
									var BS1 = BoxShiftActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
									var name = shiftblockset[i].i+','+shiftblockset[i].j;
									BS1.setBoxType(shiftblockset[i].t);
									grid.addObject('act',BS1,name);
								}

								grid.setGridData(2,1,2,1,'tile','riser',{filled:false});
								grid.setGridData(12,1,12,1,'tile','riser',{filled:false});
								grid.setGridData(6,1,6,1,'tile','riser',{filled:false});
								grid.setGridData(8,3,8,3,'tile','riser',{filled:false});
								grid.setGridData(5,2,5,2,'tile','riser',{filled:false});
								grid.setGridData(9,2,9,2,'tile','riser',{filled:false});



								var blockset = [];
								blockset.push({i:4,j:5});
								blockset.push({i:4,j:6});
								blockset.push({i:10,j:5});
								blockset.push({i:10,j:6});
								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}

								grid.setGridData(4,7,4,7,'tile','laserfield',{filled:true,damage:4,color:1,heading:'V',master:undefined,ends:[0]});
								grid.setGridData(4,8,4,8,'tile','laserfield',{filled:true,damage:4,color:1,heading:'V',master:undefined,ends:[]});
								grid.setGridData(4,9,4,9,'tile','laserfield',{filled:true,damage:4,color:1,heading:'V',master:undefined,ends:[1]});

								grid.setGridData(10,7,10,7,'tile','laserfield',{filled:true,damage:4,color:2,heading:'V',master:undefined,ends:[0]});
								grid.setGridData(10,8,10,8,'tile','laserfield',{filled:true,damage:4,color:2,heading:'V',master:undefined,ends:[]});
								grid.setGridData(10,9,10,9,'tile','laserfield',{filled:true,damage:4,color:2,heading:'V',master:undefined,ends:[1]});

								grid.setGridData(3,0,3,4,'tile','filler',{filled:false,color:2});
								grid.setGridData(11,0,11,4,'tile','filler',{filled:false,color:1});

								grid.setGridData(3,5,3,5,'tile','filler',{filled:false,color:2});
								grid.setGridData(11,5,11,5,'tile','filler',{filled:false,color:1});

								var O1 = OrbActor.alloc();
								O1.colorNum = 1;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*(4*8*4);
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'14,1');

								var O1 = OrbActor.alloc();
								O1.colorNum = 2;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*(4*8*4);
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'0,4');

								var O1 = OrbActor.alloc();
								O1.colorNum = 1;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*(4*8*4);
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'11,9');


								grid.update = function() {
										BaseGrid.prototype.update.call(this);
										var GW = GAMEMODEL.gameSession.gameWorld;

										for(var ptname in this.nodeData) {
												if(typeof this.nodeData[ptname]['tile'] !== "undefined") {
														for(var i in this.nodeData[ptname]['tile']) {
																var tiledata = this.nodeData[ptname]['tile'][i];
																if(i == 'igniter') {
																		if(typeof tiledata.innerc !== "undefined" && Array.isArray(tiledata.innerc)) {
																				if(GW.gamePlayer.colorNum != tiledata.color && GW.gamePlayer.colorNum < 3) {
																						var redoarray=[];
																						redoarray.push(tiledata.color);
																						for(var a=0; a<tiledata.innerc.length;a++) {
																								var c=tiledata.innerc[a];
																								if(c != GW.gamePlayer.colorNum)				redoarray.push(c);
																						}
																						this.nodeData[ptname]['tile'][i].color = GW.gamePlayer.colorNum;
																						this.nodeData[ptname]['tile'][i].innerc = redoarray;
																				}
																		}

																}
														}
												}
										}
								}.bind(grid);
								grid.drawTile = function(pos,ptname,tilename) {
										BaseGrid.prototype.drawTile.call(this,pos,ptname,tilename);
										var tiledata = this.nodeData[ptname]['tile'][tilename];
										if(tilename == 'igniter') {
												if(typeof tiledata.innerc !== "undefined" && Array.isArray(tiledata.innerc)) {
														for(var a=0; a<tiledata.innerc.length;a++) {
																var shape = {type:"circle",pt:this.position,radius:(8-1-a)};
																var prop = {fill:false, color:"#CCCCCC", width:1};
																prop.color = this.getNumericColor(0.4, tiledata.innerc[a], 'halo');
																GAMEVIEW.drawElement(pos, shape, prop, {});
														}
												}
										}
								}.bind(grid);
/*

								grid.setGridData(0,0,10,3,'tile','riser',{filled:false});
								delete grid.nodeData['5,0']['tile']['riser'];

								grid.setGridData(3,2,3,3,'tile','filler',{filled:false,color:0});
								grid.setGridData(5,3,5,3,'tile','filler',{filled:false,color:2});
								grid.setGridData(7,2,7,3,'tile','filler',{filled:false,color:1});

								var blockset = [];
								blockset.push({i:0,j:2});
								blockset.push({i:0,j:3});
								blockset.push({i:0,j:4});
								blockset.push({i:2,j:1});
								blockset.push({i:2,j:2});
								blockset.push({i:2,j:3});
								blockset.push({i:4,j:2});
								blockset.push({i:4,j:3});
								blockset.push({i:6,j:2});
								blockset.push({i:6,j:3});
								blockset.push({i:8,j:1});
								blockset.push({i:8,j:2});
								blockset.push({i:8,j:3});
								blockset.push({i:10,j:2});
								blockset.push({i:10,j:3});
								blockset.push({i:10,j:4});


								for(var i in blockset) {
									var B1 = BlockActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
									var name = blockset[i].i+','+blockset[i].j;
									grid.addObject('act',B1,name);
								}


								var O1 = OrbActor.alloc();
								O1.colorNum = 1;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'6,1');
								var O1 = OrbActor.alloc();
								O1.colorNum = 2;
								O1.deathTimer.lifeTime = 8000 * 2;
								O1.lifelineTimer.lifeTime = 8000 * 2*2*4;
				        GAMEMODEL.gameSession.gameWorld.addActor(O1,'act');
								grid.addObject('act',O1,'5,2');


								grid.setGridData(3,1,3,1,'tile','laserfield',{filled:true,damage:4,color:0,heading:'H',master:undefined,ends:[0,1]});
								grid.setGridData(7,1,7,1,'tile','laserfield',{filled:true,damage:4,color:1,heading:'H',master:undefined,ends:[0,1]});
								grid.setGridData(1,4,1,4,'tile','pit',{filled:false});
								grid.setGridData(9,4,9,4,'tile','pit',{filled:false});

								var shiftblockset = [];
								shiftblockset.push({i:1,j:3,t:1});
								shiftblockset.push({i:2,j:4,t:1});
								shiftblockset.push({i:9,j:3,t:1});
								shiftblockset.push({i:8,j:4,t:1});

								for(var i in shiftblockset) {
									var BS1 = BoxShiftActor.alloc();
									GAMEMODEL.gameSession.gameWorld.addActor(BS1,'act');
									var name = shiftblockset[i].i+','+shiftblockset[i].j;
									BS1.setBoxType(shiftblockset[i].t);
									grid.addObject('act',BS1,name);
								}

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
