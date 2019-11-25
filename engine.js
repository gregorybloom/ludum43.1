//      https://github.com/electron-userland/electron-packager#usage

//      https://humanwhocodes.com/blog/2009/07/28/the-best-way-to-load-external-javascript/

var GameEngine = GameEngine || {};
GameEngine.classes = {};

GameEngine.basePath = './game_engine/';
GameEngine.staticURLPath = '';
GameEngine.engineMode = null;
GameEngine.engineStartupList = {};

GameEngine.currentFunctionList = {};
GameEngine.currentTask = "NONE";
GameEngine.currentSteps = [];
GameEngine.phaseSets = {
    "ENGINE_START": ["LOADCLASSES","INITCLASSES","LOADRESOURCES"],
    "GAME_START": [],
};

//    https://stackoverflow.com/questions/42731381/module-exports-returns-an-empty-object
//		https://stackoverflow.com/questions/12820953/asynchronous-script-loading-callback


GameEngine.getEngineType = function() {};
GameEngine.asyncBrowserLoad = function(url, opts, call) {};
if(typeof getEngineType === "function") {
  GameEngine.getEngineType = getEngineType;
}
if(typeof asyncBrowserLoad === "function") {
  GameEngine.asyncBrowserLoad = asyncBrowserLoad;
}

GameEngine.init = function(staticpath,engineMode) {
    if(typeof staticpath === "undefined")   staticpath = null;
    GameEngine.staticURLPath = staticpath;
    GameEngine.engineMode = engineMode;

    GameEngine.startPhaseSet("ENGINE_START");
    GameEngine.phaseStep(function() {
      console.log('steps complete');
    }.bind(this));
};
GameEngine.startPhaseSet = function(loadset) {
    if(typeof GameEngine.phaseSets[loadset] === "undefined")    return;
    GameEngine.currentSteps = JSON.parse( JSON.stringify(GameEngine.phaseSets[loadset]) );
    GameEngine.currentTask = "PERFORM_PHASES";
};
GameEngine.getNextPhase = function() {
    if(typeof GameEngine.currentSteps === "undefined") {
        GameEngine.currentTask = "NONE";
        return null;
    }
    if( GameEngine.currentSteps.length > 0 )     return GameEngine.currentSteps.shift();
    GameEngine.currentTask = "NONE";
    return null;
};
GameEngine.phaseStep = function(finishcallback) {
    var phaseName = GameEngine.getNextPhase();
    console.log('phasename',phaseName);
    if(phaseName != null) {
        GameEngine.executePhase(phaseName, function() {
            GameEngine.phaseStep(finishcallback);
        }.bind(this));
    }
    else {
        if(typeof finishcallback === "function")  finishcallback.call(this);
    }
};
GameEngine.executePhase = function(phasename,callback) {
    var opts = {};
    if(phasename == "LOADCLASSES") {
      this.loadStartupData(function (_opts) {

          if( this.engineMode == 'electron' ) {
              this.FileLoader.loadEngineFiles("CLASSLOAD","ClassList",GameEngine.GameResources.classList,GameEngine,opts, function(state,loadopts) {
              }.bind(this));
              this.FileLoader.loadEngineFiles("CODELOAD","CodeList",GameEngine.GameResources.codeList,GameEngine,opts);

              if(typeof callback === "function")    callback.call(this);
          }
          if( /^(?:file|node)?\s*web\s*browser\s*$/.test(this.engineMode) ) {
              console.log("load classes");
//              if(staticpath != null)    opts={basepath:staticpath};
              this.FileLoader.loadEngineFiles("CLASSLOAD","ClassList",GameEngine.GameResources.classList,GameEngine,opts, function(state,loadopts) {
                  this.loadJSClasses("FIXCLASSLOAD");
                  console.log("DONE2");
                  this.FileLoader.loadEngineFiles("CODELOAD","CodeList",GameEngine.GameResources.codeList,GameEngine,opts, function(state2,loadopts2) {
                      console.log("LOAD COMPLETE!");
                      if(typeof callback === "function")    callback.call(this);
                  }.bind(this));
              }.bind(this));
          }
      }.bind(this));
    }
    if(phasename == "INITCLASSES") {
        if( this.engineMode == 'electron' ) {
//            require(this.basePath+"core/game_startup.js");
//            if(typeof callback === "function")    callback.call(this);
        }
        if( /^(?:file|node)?\s*web\s*browser\s*$/.test(this.engineMode) ) {
          this.FileLoader.loadEngineFiles("CODELOAD","InitCodeList",GameEngine.GameResources.initCodeList,GameEngine,opts, function(state,loadopts) {
             this.currentFunctionList['initializeGame'].call(this, function() {
               delete this.currentFunctionList['initializeGame'];
               if(typeof callback === "function")    callback.call(this);
             }.bind(this));
          }.bind(this));

//            GameEngine.asyncBrowserLoad(GameEngine.staticURLPath+"/game_engine/core/game_startup.js", {}, function(_opts, _e) {
//                if(typeof callback === "function")    callback.call(this);
//            }.bind(this));
        }
    }
    if(phasename == "LOADRESOURCES") {
      if(this.currentFunctionList['loadResources']) {
        this.currentFunctionList['loadResources'].call(this, function() {
          delete this.currentFunctionList['loadResources'];
          console.log("LOADED SHIT");
        }.bind(this));
      }
      if(typeof callback === "function")    callback.call(this);
    }
};
GameEngine.loadJSClasses = function(loadphase) {
    for(var classIndex in this.classes) {
        var classListItem = this.classes[ classIndex ];
        if(classListItem != null && typeof classListItem !== "undefined") {
          if(typeof classListItem._loadJSEngineClasses === "function")   classListItem._loadJSEngineClasses({"mode":"loaduses"});
        }
    }
};
GameEngine.loadStartupData = function(call) {
    var listTarget = null;
    if( typeof this.engineStartupList[GameEngine.engineMode] !== "undefined" ) {
      listTarget = this.engineStartupList[GameEngine.engineMode];
    }
    else {
      listTarget = this.engineStartupList["*"];
    }

    if( GameEngine.engineMode == 'electron' ) {
        for(var i in listTarget) {
            var newModule = require(this.basePath + listTarget[i]);
        }
        if(typeof call === "function")    call();
    }
    else if( /^(?:file|node)?\s*web\s*browser\s*$/.test(this.engineMode) ) {

        var sitepath = GameEngine.staticURLPath;
        console.log("Loaded: JQuery",sitepath+"/game_engine/jquery-3.3.1.min.js");

        var loadNext = function(array,lastcall) {
          var next = array.shift();
          console.log(next);
          this.asyncBrowserLoad(sitepath+"/game_engine/"+next, {"defer":true}, function(_opts, _e) {
            if(array.length > 0)       loadNext.call(this,array,lastcall);
            else if(typeof lastcall === "function")    lastcall();
          }.bind(this));
        }.bind(this);
        loadNext(listTarget,call);
    }

};
GameEngine.loadJS = function(dirPath, nameArray, loadOpts, fileArray) {
  var baseloadPath = GameEngine.basePath;

  var returnVars = {};

  var loadIndex = 0;
  var loadLength = 0;

  var needsArray = null;

  var fetchItem = null;
  if(typeof GameEngine.GameResources !== "undefined") {
      fetchItem = GameEngine.GameResources.fetchItemFromLoadList(nameArray,GameEngine.loadedClassList);
      if(fetchItem != null && typeof loadOpts !== "undefined" && typeof loadOpts['mode'] !== "undefined") {
          var varName = null;
          if(loadOpts['mode'] == "loadneeds")     varName = "needs";
          if(loadOpts['mode'] == "loaduses")      varName = "uses";
          if(varName != null) {
              if(typeof fetchItem[varName] === "undefined")     needsArray = fileArray;
              else                                              needsArray = fetchItem[varName];
          }
      }
  }
  if(fetchItem == null) {
    needsArray = fileArray;
  }
  if(needsArray == null)                      return;

  for(loadIndex = 0, loadLength = needsArray.length; loadIndex < loadLength; loadIndex++) {

      var loadName = needsArray[ loadIndex ];

      if(typeof loadIndex === "undefined")    continue;
      if(typeof loadName === "undefined")     continue;
      if(nameArray.indexOf(loadName) > -1)    continue;

      if(GameEngine.classes && GameEngine.classes[loadName]) {
          returnVars[loadName] = GameEngine.classes[loadName];
      }
  }
  return returnVars;
};



if( /^(?:file|node)?\s*web\s*browser\s*$/.test(GameEngine.getEngineType(window.location.href)) ) {
  var exports={};
  var module={};
  module.parent = {};
  module.parent.exports = {};
  module.parent.exports.loadJS = function() {return {};};
  __dirname = "";
}

var TESTMOTHERFUCKER = "TESTMOTHERFUCKER";
console.log("Xxx", typeof GameEngine);

module.exports = GameEngine;
