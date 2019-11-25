// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports;     // Direct Load
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["ContentLoader"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});

function ContentLoader() {
}
/*	Actor.prototype = new Module;
/**/
ContentLoader.prototype.identity = function() {
	return ('ContentLoader (?)');
};

ContentLoader.prototype.init = function() {
		this.loadingList = [];
		this.checkList = {};

		this.loadedList = {};
		this.loadingProcess = false;
		this.loadingPhase = "NONE";
};

ContentLoader.prototype.fetchGameEngine = function() {
  return module.parent.exports;
};
ContentLoader.prototype.checkNextStage = function(_completedList) {
    for(var nameString in _completedList) {
      var loadCheckItem = _completedList[nameString];
      if(typeof loadCheckItem === "undefined")		continue;
      if(loadCheckItem == 0)				return false;
//      if(loadCheckItem == 1)				delete subCheckList[nameString];
    }
		return true;
};
ContentLoader.prototype.loadFileList = function(loadState,GameEngine,loadList,loadopts,callback) {
	var beginLoadTask = function(nameString, loadItem, optsfn) {
		console.log("Loading: ", (GameEngine.staticURLPath+"/game_engine/"+loadItem['path']) );
		GameEngine.asyncBrowserLoad(GameEngine.staticURLPath+"/game_engine/"+loadItem['path'], optsfn, function( _opts, _e) {
				console.log("- Loaded: ", nameString, (GameEngine.staticURLPath+"/game_engine/"+loadItem['path']) );
				var loadedName = _opts['args']['name'];
				var loadedMode = _opts['args']['mode'];

				this.checkList[nameString]=1;

				// Is next Index the same file, or new?
				var check = this.checkNextStage(this.checkList);
				if(check == false)		return;

			// If there are no more pending items in checkList...
				this.checkList = {};
				if(typeof callback === "function")      callback();

		}.bind(this));
	}.bind(this);

	console.log("load file list: ", loadState, loadList.length,typeof loadList,loadList);
	for(var j in loadList) {
		for(var k=0; k<loadList[j].length; k++) {
	    var loadItem = loadList[j][k];
	    var nameString = this.grabItemLabel(loadItem);

			var optsList = {"args":{"name":nameString}};
	    if(typeof loadopts['mode'] !== "undefined")		optsList["args"]["mode"] = loadopts['mode'];
			beginLoadTask(nameString, loadItem, optsList);
		}

	}
};
ContentLoader.prototype.grabItemLabel = function(_loadItem) {
};
ContentLoader.prototype.buildOrderedLoadList = function(classList,moderun){
	  if(typeof moderun === "undefined" || moderun == null)     moderun={};

		this.loadingPhase = "SORTING";

	  var loadList = {};
	  var entryList = {};
	  var tempEntryList = {};

		// pull all classes into entry list
	  for(var i=0; i<classList.length; i++) {
		    var stepLoadList = [];

		    var itemGroup = classList[i];

		    for(var j=0; j<itemGroup.length; j++) {

		        var item = itemGroup[j];
		        if(typeof item['name'] !== "undefined") {
		          	entryList[ item['name'] ] = JSON.parse(JSON.stringify(item));
		        }
		        else if(typeof item['nameset'] !== "undefined") {
			          for(var k=0; k<item['nameset'].length; k++) {
			            	entryList[ item['nameset'][k] ] = JSON.parse(JSON.stringify(item));
			          }
		        }
		        else if(typeof item['label'] !== "undefined") {
		          	entryList[ item['label'] ] = JSON.parse(JSON.stringify(item));
		        }
      	}
    }

    tempEntryList = JSON.parse(JSON.stringify(entryList));
    var levelCount = 0;


//		console.log( Object.keys(loadList) );
//		console.log( Object.keys(tempEntryList) );
    while(true) {
//      console.log('* ~~~~~~~~~~~~~~~~~~~~~~~~~~',i,',',levelCount,'~~~~~~~~~~~~~~~~~~~~~~~~~~');
      if(Object.keys(tempEntryList).length == 0)        break;

      var baseStep = (Object.keys(loadList)).length;
      var totalCount = baseStep;
      for(var itemName in tempEntryList) {
//        console.log('* -------------',itemName,'-------------');


        baseStep = (Object.keys(loadList)).length;
        totalCount = baseStep;

//				console.log(baseStep, totalCount, Object.keys(entryList).length );
//				console.log(baseStep, totalCount, Object.keys(tempEntryList).length, Object.keys(tempEntryList) );
        if(totalCount > Object.keys(entryList).length)    break;
//				console.log(itemName, typeof entryList[itemName] );
        if(typeof entryList[itemName] === "undefined")    continue;

//				console.log(itemName, Object.keys(tempEntryList[itemName]) );
        if(typeof tempEntryList[itemName]['count'] === "undefined") {
//					console.log(itemName, tempEntryList[itemName].needs.length );
          if(tempEntryList[itemName].needs.length == 0) {
            entryList[itemName]['count'] = 0;
            tempEntryList[itemName]['count'] = 0;
          }
          else {
            var levelFound = -1;
//						console.log(itemName, tempEntryList[itemName].needs.length );
            for(var neededIndex in tempEntryList[itemName].needs) {
              var neededItemName = tempEntryList[itemName].needs[neededIndex];
//							console.log(itemName, neededIndex,  neededItemName, typeof entryList[neededItemName]);

							var itemCount = null;
							if(neededItemName == itemName)  {
								itemCount = null;
							}
              else if(typeof entryList[neededItemName] !== "undefined")    {
								itemCount = entryList[neededItemName]['count'];
							}
							else {
								for(var listname in this.loadedList) {
									if(typeof this.loadedList[listname][neededItemName] !== "undefined") {
										if(this.loadedList[listname][neededItemName] != null) {
											itemCount = 0;
											break;
										}
									}
								}
								if(itemCount == null) {
									if(typeof GameEngine.classes[neededItemName] !== "undefined") {
										itemCount = 0;
									}
								}
							}

							if(itemCount == null) {
								levelFound = -1;
								console.log(itemName, neededIndex,  neededItemName, typeof entryList[neededItemName]);
								return;
							}

//							console.log(itemName, neededIndex,  neededItemName);
//							console.log(itemName, neededIndex,  neededItemName, typeof entryList[neededItemName]['count'], entryList[neededItemName]);
//              if(typeof entryList[neededItemName]['count'] === "undefined")    {levelFound = -1; break;}
//							console.log(itemName, neededIndex,  neededItemName, levelFound, entryList[neededItemName]['count']);

              if(itemCount > levelFound)   levelFound = itemCount;
            }
//						console.log(itemName, levelFound, entryList[itemName]['count'], tempEntryList[itemName]['count']);
            if(levelFound == -1)    continue;

            entryList[itemName]['count'] = levelFound+1;
            tempEntryList[itemName]['count'] = levelFound+1;
//						console.log(entryList[itemName], levelFound);
          }
        }

//				console.log(itemName, tempEntryList[itemName], tempEntryList[itemName]['count'], levelCount);
        if(tempEntryList[itemName]['count'] >= levelCount) {
          var loadLevel = tempEntryList[itemName]['count'];

//					console.log(itemName, loadLevel, typeof loadList[loadLevel]);
          if(typeof loadList[loadLevel] === "undefined")   loadList[loadLevel] = [];
          loadList[loadLevel].push(  tempEntryList[itemName]  );
//					console.log(itemName, loadLevel, tempEntryList[itemName]  );

          delete tempEntryList[itemName];
          continue;
        }

      }
//			console.log(itemName, levelCount  );

      levelCount += 1;
  }

  return loadList;
};

ContentLoader.prototype.createChecklist = function(_loadList) {

  completedList = {};
  for(var j in _loadList) {
			for(var k=0; k<_loadList[j].length; k++) {
				var loadItem = _loadList[j][k];

		    var nameString = this.grabItemLabel(loadItem);
		    if(nameString != null) {
		      	completedList[ nameString ]=0;
		    }
			}
  }
  return completedList;
};

ContentLoader.prototype.loadEngineFiles = function(loadPhase,listName, fileList,GameEngine,opts,callback) {
	var buildmode = null;

	this.loadingProcess = true;
	this.loadingPhase = "BEGIN";
	this.loadingName = loadPhase;

	if(loadPhase == "CLASSLOAD")			buildmode = {"mode":"classload"};
	if(loadPhase == "CODELOAD")				buildmode = {"mode":"codeload"};


	this.loadedList[listName] = this.buildOrderedLoadList(fileList,buildmode);
	this.checkList = this.createChecklist( this.loadedList[listName] );

	this.loadingPhase = "LOADING";


	this.loadFileList(loadPhase,GameEngine,this.loadedList[listName],{"mode":buildmode.mode,"opts":opts},function() {
			this.loadingProcess = false;
			this.loadingPhase = "DONE";

			if(typeof callback === "function")			callback.call(this,loadPhase,opts);
	}.bind(this));
/*
	return;
  if( GameEngine.getEngineType() == 'electron' ) {

    for(var i in loadingList) {
        for(var loadIndex in loadingList[i]) {
            var loadItem = loadingList[i][loadIndex];

            var loadName = this.grabItemLabel(loadItem);

            var newModule = require("./" + loadItem['path']);
            for(var j in newModule) {
                if(j == "classSet") {
                    for(var k in newModule[j]) {
                        if(k == "_loadJSEngineClasses")    continue;

                        GameEngine.classes[k] = newModule[j][k];
                    }
                }
                else if(j == loadName) {
                    GameEngine.classes[j] = newModule[j];
                    if(loadPhase == "codeFiles") {
                      if(typeof newModule[j]._loadJSEngineClasses === "function")   newModule[j]._loadJSEngineClasses({"mode":"loadneeds"});
                    }
                }
            }
        }
    }
	}
/**/

};


ContentLoader.alloc = function() {
	var vc = new ContentLoader();
	vc.init();
	return vc;
};

GameEngine.ContentLoader = ContentLoader.alloc();

exports.ContentLoader = ContentLoader;
exports.ContentLoader._loadJSEngineClasses = _loadJSEngineClasses;
