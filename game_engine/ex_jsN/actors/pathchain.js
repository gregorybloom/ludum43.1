// CommonJS ClassLoader Hack
var classLoadList = ["Actor","TelPathActor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["PathChainActor"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


function PathChainActor() {
}
PathChainActor.prototype = new Actor;
PathChainActor.prototype.identity = function() {
	return ('PathChainActor (' +this._dom.id+ ')');
};
PathChainActor.prototype.init = function() {
	Actor.prototype.init.call(this);

  this.lastPath = null;
	this.firstPath = null;

  this.pathLists = {};
  this.pathLinks = {};
  this.pathSummary = {};
};
PathChainActor.prototype.clear = function() {
  this.lastPath = null;
	this.firstPath = null;
  for(var j in this.pathLists) {
    this.pathLists[j].clear();
  }
  this.pathLists = {};
  this.pathLinks = {};
  this.pathSummary = {};
};
PathChainActor.prototype.draw = function() {
};
PathChainActor.prototype.update = function() {
  Actor.prototype.update.call(this);
  this.examineLinks();
  this.checkTelePaths();
};
PathChainActor.prototype.fillPathDefaults = function(telepath) {
  this.pathLinks[telepath.id] = {};
  this.pathLinks[telepath.id]['_chain'] = {};
  this.pathLinks[telepath.id]['_intersections'] = {};
  this.pathLinks[telepath.id]['_edges'] = {};
  this.pathLinks[telepath.id]['_touches'] = {};
  this.pathLinks[telepath.id]['_overlaps'] = {};
};
PathChainActor.prototype.addTelePath = function(telepath) {
	this.checkTelePaths();
	if(!this.firstPath) {
		this.firstPath = telepath;
		this.lastPath = telepath;
		telepath.prevTelePath = null;
		telepath.nextTelePath = null;
	}
	else {
		var tmp = this.firstPath;
		this.firstPath = telepath;
		telepath.nextTelePath = tmp;
		telepath.prevTelePath = null;
		tmp.prevTelePath = telepath;
	}
  telepath.chainParent = this;
	this.checkTelePaths();
  this.fillPathDefaults(telepath);
	this.walkBuildTies(telepath,telepath.nextTelePath);
};
PathChainActor.prototype.checkTelePaths = function() {
	if(!this.lastPath)		return;
	var last = this.lastPath;
	while(last instanceof TelPathActor && !last.alive) {
		if(this.firstPath.id == last.id) {
			this.lastPath = null;
			this.firstPath = null;
			last.prevTelePath = null;
			last.nextTelePath = null;
			return;
		}
		else if(!last.alive) {
			var cur = last.prevTelePath;
			if(cur)		cur.nextTelePath = null;
			last.prevTelePath = null;
			last = cur;
		}
	}
	var n = 0;
	var first = this.firstPath;
	while(first instanceof TelPathActor && first.alive) {
		first.chainNum = n;
		if(first.nextTelePath && first.id == first.nextTelePath.id)	first.nextTelePath = null;
		first = first.nextTelePath;
		n+=1;
	}
};




PathChainActor.prototype.checkEdges = function(act1, act2, distest=5) {
	var A1s = GAMEGEOM.addPoints(act1.startPt,act1.position);
	var A1e = GAMEGEOM.addPoints(act1.endPt,act1.position);
	var A2s = GAMEGEOM.addPoints(act2.startPt,act2.position);
	var A2e = GAMEGEOM.addPoints(act2.endPt,act2.position);

	var D1 = GAMEGEOM.getDistance(A1s, A2e);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawStartPt,act1.position);
	var D1 = GAMEGEOM.getDistance(A1e, A2s);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawEndPt,act1.position);
	var D1 = GAMEGEOM.getDistance(A1s, A2s);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawStartPt,act1.position);
	var D1 = GAMEGEOM.getDistance(A1e, A2e);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawEndPt,act1.position);
	return false;
};
PathChainActor.prototype.removeLink = function(id) {
  delete this.pathLists[id];
  delete this.pathLinks[id];
  for(var j in this.pathLinks) {
    for(var name in this.pathLinks[j]) {
  		for(var i in this.pathLinks[j][name]) {
        if(i == id) delete this.pathLinks[j][name][i];
  		}
  	}
  }
};
PathChainActor.prototype.addLink = function(type,curPath,nextPath,info={}) {
	var name = "_"+type;
	if(type == "chain") {
		this.pathLinks[curPath.id][name][nextPath.id] = nextPath;
		this.pathLinks[nextPath.id][name][curPath.id] = curPath;
		return true;
	}
	if(type == "intersections" || type == "edges" || type == "touches") {
		this.pathLinks[curPath.id][name][nextPath.id] = {'act':nextPath,'pt':info.pt};
		this.pathLinks[nextPath.id][name][curPath.id] = {'act':curPath,'pt':info.pt};
		return true;
	}
	if(type == "overlaps") {
		var pt1 = {x:info.pts.x,y:info.pts.y};		var pt2 = {x:info.pts.x2,y:info.pts.y2};
		this.pathLinks[curPath.id][name][nextPath.id] = {'act':nextPath,'pt1':pt1,'pt2':pt2};
		this.pathLinks[nextPath.id][name][curPath.id] = {'act':curPath,'pt1':pt1,'pt2':pt2};
		return true;
	}
};

PathChainActor.prototype.buildLinks = function(curPath,nextPath) {
	if(!curPath.alive)		return;
	if(!nextPath.alive)		return;

	var P1 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(curPath.position,curPath.startPt));
	var P2 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(curPath.position,curPath.endPt));
	var Q1 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(nextPath.position,nextPath.startPt));
	var Q2 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(nextPath.position,nextPath.endPt));

	var added = false;
	if(curPath.nextTelePath.id == nextPath.id) {
		if(curPath.chainNum == (nextPath.chainNum-1) )			added = added | this.addLink('chain',curPath,nextPath);
	}

	resultO = GAMEGEOM.doSegmentsOverlap(P1,P2, Q1, Q2);
	if(resultO) {
		if(GAMEGEOM.segmentsOverlapLength(P1,P2, Q1, Q2) > 5) {
      resultO2 = GAMEGEOM.segmentsOverlapPoints(P1,P2, Q1,Q2);
			resultO3 = resultO2[0];
			resultO3.x2 = resultO2[1].x;
			resultO3.y2 = resultO2[1].y;
			added = added | this.addLink('overlaps',curPath,nextPath,{"pts":resultO3});
		}
	}

	var hasChainLink = (this.pathLinks[curPath.id]['_chain'][nextPath.id] || this.pathLinks[nextPath.id]['_chain'][curPath.id]);
	if( !hasChainLink ) {
		resultI = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
		if(!resultO && resultI) {
			added = added | this.addLink('intersections',curPath,nextPath,{"pt":resultI});
		}

		var resultE = false;
		if(!resultO && !resultI) {
			resultE = this.checkEdges(curPath,nextPath);
			if( resultE )			added = added | this.addLink('edges',curPath,nextPath,{'pt':resultE});
		}
		if(!resultO && !resultI && !resultE) {
				var D1 = GAMEGEOM.shortestDistanceToLineSegment(P1 ,Q1,Q2);
				var D2 = GAMEGEOM.shortestDistanceToLineSegment(P2 ,Q1,Q2);
				var D = Math.min(D1,D2);
				if(D < 4 && D == D1)				added = added | this.addLink('touches',curPath,nextPath,{"pt":P1});
				else if(D < 4 && D == D2)		added = added | this.addLink('touches',curPath,nextPath,{"pt":P2});
		}
	}

	if(added) {
    this.pathLists[curPath.id] = curPath;
		this.pathLists[nextPath.id] = nextPath;
	}
};
PathChainActor.prototype.walkBuildTies = function(curPath,nextPath) {
	if(!nextPath)		return;
	this.buildLinks(curPath,nextPath);
	this.walkBuildTies(curPath,nextPath.nextTelePath);
};
PathChainActor.prototype.examineLinks = function() {
	for(var i in this.pathLists) {
		var item = this.pathLists[i];
		if(!item.alive) {
			this.removeLink(i);
		}
	}
};


PathChainActor.prototype.checkEdges = function(act1, act2, distest=5) {
	var A1s = GAMEGEOM.addPoints(act1.startPt,act1.position);
	var A1e = GAMEGEOM.addPoints(act1.endPt,act1.position);
	var A2s = GAMEGEOM.addPoints(act2.startPt,act2.position);
	var A2e = GAMEGEOM.addPoints(act2.endPt,act2.position);

	var D1 = GAMEGEOM.getDistance(A1s, A2e);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawStartPt,act1.position);
	var D1 = GAMEGEOM.getDistance(A1e, A2s);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawEndPt,act1.position);
	var D1 = GAMEGEOM.getDistance(A1s, A2s);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawStartPt,act1.position);
	var D1 = GAMEGEOM.getDistance(A1e, A2e);
	if(D1 <= distest)		return GAMEGEOM.addPoints(act1.drawEndPt,act1.position);
	return false;
};
PathChainActor.prototype.summarizeLinks = function(id) {
	var links = {};
	links['_summary']={};
	links['_list']={};

	var GW = GAMEMODEL.gameSession.gameWorld;
  var GP = GW.gamePlayer;
  if(typeof this.pathLinks[id] !== "undefined") {
 		for(var name in this.pathLinks[id]) {
      links['_summary'][name] = 0;
      for(var j in this.pathLinks[id][name]) {
        links['_summary'][name] += 1;

        if(typeof links['_list'][j] === "undefined")						links['_list'][j] = {};
  			if(typeof links['_list'][j]['hits'] === "undefined")		links['_list'][j]['hits'] = [];

        var item = this.pathLinks[id][name][j];
        links['_list'][j]['actor'] = this.pathLists[j];
        links['_list'][j]['hits'].push({'act':this.pathLists[j],'type':name,'pt':item['pt1'],'pt2':item['pt2']});
    }
      /*
      var item = links['_list'][id]['hits'][i];
      if(item['type'] && item['type'] == "overlap") {
***************8

			if( typeof GP.teleCircle.teleItemList[id] === "undefined" )		continue;
			if( !GP.teleCircle.teleItemList[id].alive )			continue;

			if(typeof links['_list'][id] === "undefined")						links['_list'][id] = {};
			if(typeof links['_list'][id]['hits'] === "undefined")		links['_list'][id]['hits'] = [];
			links['_list'][id]['actor'] = GP.teleCircle.teleItemList[id];

			for(var j in crosslist[this.id][id]) {
				if(typeof crosslist[this.id][id][j]["type"] !== "undefined") {
					var type = crosslist[this.id][id][j]["type"];
					if(typeof links['_summary'][type] === "undefined")		links['_summary'][type] = 0;
					links['_summary'][type] += 1;
					var crossobj = crosslist[this.id][id][j];
					links['_list'][id]['hits'].push(crossobj);
				}
			}/**/
		}
  }
	return links;
};


PathChainActor.alloc = function() {
	var vc = new PathChainActor();
	vc.init();
	return vc;
};

/*
TelPathActor.prototype.summarizeLinks = function() {
	var links = {};
	links['_summary']={};
	links['_list']={};

	var GW = GAMEMODEL.gameSession.gameWorld;
  var GP = GW.gamePlayer;
  var crosslist = GP.teleCircle.teleCrossList;
  if(typeof crosslist[this.id] !== "undefined") {
 		for(var id in crosslist[this.id]) {

			if( typeof GP.teleCircle.teleItemList[id] === "undefined" )		continue;
			if( !GP.teleCircle.teleItemList[id].alive )			continue;

			if(typeof links['_list'][id] === "undefined")						links['_list'][id] = {};
			if(typeof links['_list'][id]['hits'] === "undefined")		links['_list'][id]['hits'] = [];
			links['_list'][id]['actor'] = GP.teleCircle.teleItemList[id];

			for(var j in crosslist[this.id][id]) {
				if(typeof crosslist[this.id][id][j]["type"] !== "undefined") {
					var type = crosslist[this.id][id][j]["type"];
					if(typeof links['_summary'][type] === "undefined")		links['_summary'][type] = 0;
					links['_summary'][type] += 1;
					var crossobj = crosslist[this.id][id][j];
					links['_list'][id]['hits'].push(crossobj);
				}
			}
		}
  }
	return links;
};
TelPathActor.prototype.examineLinks = function() {
	this.pathProperties = {};
	this.pathProperties['_summary'] = {};
	this.pathProperties['_overlaps'] = [];

	var links = this.summarizeLinks();
  this.pathProperties['_summary']['overlaps'] = (links['_summary']['overlap']) ? links['_summary']['overlap'] : 0;
	if(this.pathProperties['_summary']['overlaps'] > 0 && links['_list']) {
		for(var id in links['_list']) {
			if(links['_list'][id]['hits']) {
				for(var i in links['_list'][id]['hits']) {
					var item = links['_list'][id]['hits'][i];
					if(item['type'] && item['type'] == "overlap") {
						var pts=[];
						pts.push({x:GAMEGEOM.subtractPoints(item['pt'],this.position).x,y:GAMEGEOM.subtractPoints(item['pt'],this.position).y,t:'m'});
						pts.push({x:GAMEGEOM.subtractPoints(item['pt2'],this.position).x,y:GAMEGEOM.subtractPoints(item['pt2'],this.position).y,t:'l'});
						var obj = {'pts':pts,'level':this.pathProperties['_summary']['overlaps']};
						this.pathProperties['_overlaps'].push(obj);
					}
				}
			}
		}
	}
};
/**/

/*
TelPathActor.prototype.addLink = function(type,nextPath,info={}) {
	var name = "_"+type;
	if(type == "chain") {
		this.pathProperties['_links'][name][nextPath.id] = nextPath;
		nextPath.pathProperties['_links'][name][this.id] = this;
		return true;
	}
	if(type == "intersections" || type == "edges" || type == "touches") {
		this.pathProperties['_links'][name][nextPath.id] = {'act':nextPath,'pt':info.pt};
		nextPath.pathProperties['_links'][name][this.id] = {'act':this,'pt':info.pt};
		return true;
	}
	if(type == "overlaps") {
		var pt1 = {x:info.pts.x,y:info.pts.y};		var pt2 = {x:info.pts.x2,y:info.pts.y2};
		this.pathProperties['_links'][name][nextPath.id] = {'act':nextPath,'pt1':pt1,'pt2':pt2};
		nextPath.pathProperties['_links'][name][this.id] = {'act':this,'pt1':pt1,'pt2':pt2};
		return true;
	}
};
TeleportCircleActor.prototype.cleanTelePathLists = function() {
	for(var i in this.teleLineList) {
		var item = this.teleLineList[i];
		if(!item.alive) {
			for(var j in this.teleCrossList) {
				var item2 = this.teleCrossList[j];
				if(typeof this.teleCrossList[item2.id] !== "undefined") {
					if(typeof this.teleCrossList[item2.id][item.id] !== "undefined")	delete this.teleCrossList[item2.id][item.id];
				}
			}
			for(var type in this.teleInventoryList) {
				if(this.teleInventoryList[type]) {
					if(this.teleInventoryList[type][item.id])		delete this.teleInventoryList[type][item.id];
					for(var id in this.teleInventoryList[type]) {
						if(this.teleInventoryList[type][id].includes(item.id)) {
							for(var j in this.teleInventoryList[type][id]) {
								if(j == item.id) {
									this.teleInventoryList[type][id].splice(j,1);
									break;
								}
							}
						}
					}
				}
			}


			if(typeof this.teleItemList[item.id] !== "undefined")	delete this.teleItemList[item.id];
			if(typeof this.teleCrossList[item.id] !== "undefined")	delete this.teleCrossList[item.id];
			this.teleLineList.splice(i,1);
			break;
		}
	}
};

/**/




/**/
/*
TeleportCircleActor.prototype.checkLastSegment = function(act1) {
	var l = this.teleLineList.length;
	if(l == 0)		return;
	var last = this.teleLineList[(l-1)];

	if( typeof this.teleCrossList[act1.id] !== "undefined" ) {
		if(typeof this.teleCrossList[act1.id][last] !== "undefined")		return;
//		if(this.teleCrossList[act1.id].includes(last))		return;
	}
	if(act1.id == last.id)		return [];

	var addedList = [];
	var edgehit = this.checkEdges(act1,last);
	if(edgehit) {
		var added = this.addIntersection(act1,last,"segment",{'hit':edgehit});
		if(added)		addedList.push(edgehit);
	}
	return addedList;
};
/**/
/*
TeleportCircleActor.prototype.checkOverlapSegments = function(act1) {

};
/*
TeleportCircleActor.prototype.addIntersection = function(act1, act2, type,opts={}) {
	var getCrossPt = function(ctx,actA,actB,t) {
		var P1 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(actA.position,actA.startPt));
		var P2 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(actA.position,actA.endPt));
		var Q1 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(actB.position,actB.startPt));
		var Q2 = GAMEGEOM.roundOffValues(GAMEGEOM.addPoints(actB.position,actB.endPt));

		var result = null;
		if(t == "intersection")		result = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
		if(t == "overlap") {
				result = GAMEGEOM.doSegmentsOverlap(P1,P2, Q1, Q2);
				if(result) {
					if(GAMEGEOM.segmentsOverlapLength(P1,P2, Q1, Q2) > 5) {
						if(opts['ptlist']) {
							result = opts['ptlist'][0];
							result.x2 = opts['ptlist'][1].x;
							result.y2 = opts['ptlist'][1].y;

						}
					}
				}
		}
		if(t == "touch")					result = ctx.checkEdges(P1,P2, Q1, Q2);
		if(t == "segment" && opts['hit']) {
					result = opts['hit'];
		}
		return result;
	};
	var arraysHoldsType = function(varr,label,type) {
		for(var i in varr) {
			if(typeof varr[i][label] !== "undefined") {
				if(varr[i][label] == type)		return true;
			}
		}
		return false;
	};

	if( typeof this.teleItemList[act1.id] === "undefined" )		return false;
	if( typeof this.teleItemList[act2.id] === "undefined" )		return false;
	if( !this.teleItemList[act1.id].alive )			return false;
	if( !this.teleItemList[act2.id].alive )			return false;
	if( typeof this.teleCrossList[act1.id] === "undefined" )	this.teleCrossList[act1.id] = {};
	if( typeof this.teleCrossList[act2.id] === "undefined" )	this.teleCrossList[act2.id] = {};


	var added = false;
	if( typeof this.teleCrossList[act1.id][act2.id] === "undefined" )		this.teleCrossList[act1.id][act2.id] = [];

	if(!arraysHoldsType(this.teleCrossList[act1.id][act2.id],"type",type)) {
		if(type == "overlap" || this.teleCrossList[act1.id][act2.id].length == 0) {
			var pt = getCrossPt(this,act1,act2,type);
			if(type == "overlap") 	this.teleCrossList[act1.id][act2.id].push({"type":type,"pt":{'x':pt.x,'y':pt.y},"pt2":{'x':pt.x2,'y':pt.y2} });
			else 										this.teleCrossList[act1.id][act2.id].push({"type":type,"pt":pt});
			added = true;
		}
	}
	if( typeof this.teleCrossList[act2.id][act1.id] === "undefined" )		this.teleCrossList[act2.id][act1.id] = [];
	if(!arraysHoldsType(this.teleCrossList[act2.id][act1.id],"type",type)) {
		if(type == "overlap" || this.teleCrossList[act2.id][act1.id].length == 0) {
			var pt = getCrossPt(this,act2,act1,type);
			if(type == "overlap") 	this.teleCrossList[act2.id][act1.id].push({"type":type,"pt":{'x':pt.x,'y':pt.y},"pt2":{'x':pt.x2,'y':pt.y2} });
			else 										this.teleCrossList[act2.id][act1.id].push({"type":type,"pt":pt});
			added = true;
		}
	}

	return added;
};
/**/
/*
TeleportCircleActor.prototype.findIntersects = function(line,ptlist,type) {
	for(var i in this.teleLineList) {
		var actor = this.teleLineList[i];
		if(actor.id == line.id)		continue;
		if(typeof this.teleItemList[actor.id] === "undefined")		return;
		if(!this.teleItemList[actor.id].alive)		return;

		var P1 = {x:(line.startPt.x+line.position.x), y:(line.startPt.y+line.position.y)};
		var P2 = {x:(line.endPt.x+line.position.x), y:(line.endPt.y+line.position.y)};

		var Q1 = {x:(actor.startPt.x+actor.position.x), y:(actor.startPt.y+actor.position.y)};
		var Q2 = {x:(actor.endPt.x+actor.position.x), y:(actor.endPt.y+actor.position.y)};

		P1.x = Math.round(P1.x *10)/10;		P1.y = Math.round(P1.y *10)/10;
		P2.x = Math.round(P2.x *10)/10;		P2.y = Math.round(P2.y *10)/10;
		Q1.x = Math.round(Q1.x *10)/10;		Q1.y = Math.round(Q1.y *10)/10;
		Q2.x = Math.round(Q2.x *10)/10;		Q2.y = Math.round(Q2.y *10)/10;

		var result = false;
		if(type == "intersectiontest")		result = GAMEGEOM.doLineSegmentsIntersect(P1,P2, Q1, Q2, true);
		if(type == "overlaptest") {
				result = GAMEGEOM.doSegmentsOverlap(P1,P2, Q1, Q2);
				if(result) {
					result = false;
					if(GAMEGEOM.segmentsOverlapLength(P1,P2, Q1, Q2) > 5) {
						result = GAMEGEOM.segmentsOverlapPoints(P1,P2, Q1,Q2)
						var ptlist = [ result[0], result[1] ];
						result = result[0];
					}
				}
		}
		if(type == "edgestest")					result = this.checkEdges(P1,P2, Q1, Q2);

		if(!result)		continue;

		var added = false;
		if(type == "intersectiontest")				added = this.addIntersection(line,actor,"intersection");
		if(type == "overlaptest" && ptlist)		added = this.addIntersection(line,actor,"overlap",{'ptlist':ptlist});
		if(type == "edgestest")								added = this.addIntersection(line,actor,"touch");

		if(added) {
			items={'pts':result};
			items.actors = {'act1':line,'act2':actor};
			ptlist.push(items);
		}
	}
};
/**/


exports.PathChainActor = PathChainActor;
exports.PathChainActor._loadJSEngineClasses = _loadJSEngineClasses;
