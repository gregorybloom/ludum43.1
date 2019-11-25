// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports;     // Direct Load
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GameResources"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



var GameResources = GameResources || {};
GameResources.parseToPath = function(path) {
  return (path.match(/^(.*[\/\\]game_engine[\/\\])/mg) || ["./"]).pop();
};
GameResources.parseFromPath = function(path) {
  return (path.match(/([\/\\]game_engine[\/\\]).*$/mg) || ["./"]).pop();
};

GameResources.fetchItemFromLoadList = function(nameList,loadList){

  var nameSearch = nameList[0];
  if(nameList.length > 1)  nameSearch = JSON.stringify(nameList.sort());

  var fetchedArray = null;
  for(var index in loadList) {
    for(var loadItemIndex in loadList[index]) {
      var loadItem = loadList[index][loadItemIndex];

      if(typeof nameSearch === "string") {
        if(typeof loadItem['name'] !== "undefined" && nameSearch == loadItem['name']) {
          return loadItem;
        }
        if(typeof loadItem['label'] !== "undefined" && nameSearch == loadItem['label']) {
          return loadItem;
        }
      }
      if(typeof nameSearch === "object") {
        if(typeof loadItem['nameset'] !== "undefined" && nameSearch == JSON.stringify(loadItem['nameset'].sort())) {
          return loadItem;
        }
      }
    }
  }
  return null;
};

GameResources.classList =
[
      [
//        {'name':'BEHAVIOR_BUILDER',       'path':  'ex_js1/behavior_builder.js',       'needs':[],          'uses':[],          },
      ],

];
GameResources.codeList =
[
      [
//        {'label':'ranseedloader',       'path':  'core/seedrandom.davidbau.2.4.0.min.js',       'needs':[],          'uses':[],          },
      ],
];
GameResources.initCodeList =
[
      //    Start UpItems
      [
//				{'label':'InitCode',     'path':   'core/codeblocks/game_initialize.js',      'needs':[],          'uses':[],          },
      ],

];


GameEngine.GameResources = GameResources;

exports.GameResources = GameResources;
exports.GameResources._loadJSEngineClasses = _loadJSEngineClasses;
