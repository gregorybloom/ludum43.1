// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ACTOR_FACTORY"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


ACTOR_FACTORY={
};

ACTOR_FACTORY.init = function()
{
};
ACTOR_FACTORY.createActorArgs = function(fillarr,argobj) {
  var act = null;
  var args = argobj.args;
  if(argobj.args.length == 3)    act = LEVELLOADER.createActor(fillarr,argobj.id,args[1],args[2])
  if(argobj.args.length == 4)    act = LEVELLOADER.createActor(fillarr,argobj.id,args[1],args[2],args[3])
  if(argobj.args.length == 5)    act = LEVELLOADER.createActor(fillarr,argobj.id,args[1],args[2],args[3],args[4])
  if(!argobj.objs)    argobj.objs=[];
  argobj.objs = argobj.objs.concat(fillarr);
  return act;
};
ACTOR_FACTORY.prepActors = function(argobj) {
  var fillarr = [];
  ACTOR_FACTORY.createActorArgs(fillarr,argobj);
  LEVELLOADER.fillWorldWithDropActors(fillarr);
};
ACTOR_FACTORY.prepTextActor = function(argobj) {
  var fillarr = [];
  ACTOR_FACTORY.createActorArgs(fillarr,argobj);
  GAMEMODEL.gameSession.gameWorld.addActor(fillarr[0],'act');
};
ACTOR_FACTORY.prepJumpActor = function(argobj) {
  var fillarr = [];
  var args = argobj.args;
  if(argobj.act) {
    if(argobj.objs) {
      for(var i in argobj.objs) {
        var act = argobj.objs[i];
        if(act instanceof Actor) {
          var action = argobj.act;
          if(typeof action.name !== "undefined" && typeof action.data !== "undefined") {
            BEHAVIOR_BUILDER.fetchStart(action.name,action.data)(act,argobj);
//            console.log(act.id);
          }
        }
      }
    }
  }
  //    LEVELLOADER.createActor(fillarr,"EnemyCircleBlaster",{x:350,y:100},{'laser':{'color':1,'angle':180}},{'type':"ITEMORB",'color':1});
};

/******



/**/


exports.ACTOR_FACTORY = ACTOR_FACTORY;
exports.ACTOR_FACTORY._loadJSEngineClasses = _loadJSEngineClasses;
