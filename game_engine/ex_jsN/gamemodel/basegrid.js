// CommonJS ClassLoader Hack
var classLoadList = ["Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["BaseGrid"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function BaseGrid()
{
}

BaseGrid.prototype = new Actor;

BaseGrid.prototype.identity = function()
{
	return ('BaseGrid (' + this.id + ')');
//	return ('BaseGrid (' + this._dom.id + ')');
};

BaseGrid.prototype.init = function()
{
	Actor.prototype.init.call(this);

	this.tileSize = 24;
	this.startPos = {};
	this.startColorNum = 0;

	this.points = {};

	this.changes = {};

	this.objectsPerNode = {};
	this.objectLists = {};
	this.nodeData = {};

	this.gridWinSet = {};

	this.strobeD = 1;
	this.strobeClock = 50;
	this.strobeStart = GAMEMODEL.getTime();

};
BaseGrid.prototype.loadingData = function(data)
{
	Actor.prototype.loadingData.call(this,data);
};
BaseGrid.prototype.setStartPos = function(pt) {
	this.startPos={i:pt.i,j:pt.j};
	this.setGridData(pt.i,pt.j,pt.i,pt.j,'tile','startpt',{active:false});
};
BaseGrid.prototype.setGrid = function(x,y)
{
	this.size.w = this.tileSize*x;
	this.size.h = this.tileSize*y;

	this.points={};
	for(var j=0; j<y; j++) {
			for(var i=0; i<x; i++) {
					var ptx = (i*this.tileSize);
					var pty = (j*this.tileSize);

					var numname = i+','+j;
					this.addPoint(numname, {x:ptx,y:pty}, {}, {});
					if(i == 0 && j == 0)		continue;

					var linkobj={};
					if(i > 0)		this.addLink({pts:[ numname,((i-1)+','+j) ]});
					if(j > 0)		this.addLink({pts:[ numname,(i+','+(j-1)) ]});
			}
	}
};
BaseGrid.prototype.setGridData = function(x1,y1,x2,y2,type,names,data)
{
		for(var i=x1; i<=x2; i++) {
				for(var j=y1; j<=y2; j++) {
						var ptname = i+','+j;
						if(typeof this.nodeData[ptname] === "undefined")					this.nodeData[ptname] = {};
						if(typeof this.nodeData[ptname][type] === "undefined")		this.nodeData[ptname][type] = {};
						this.nodeData[ptname][type][names] = JSON.parse(JSON.stringify( data ));
				}
		}
};
BaseGrid.prototype.playerIgnite = function(actor) {
	if(typeof this.objectLists['char'] === "undefined")		return;
	if(typeof this.objectLists['char'][actor.id] === "undefined")		return;

	var objinfo = this.objectLists['char'][actor.id];
	var ptO = JSON.parse(JSON.stringify(objinfo.ptN));

	var name = ptO.i+','+ptO.j;
	if(typeof this.nodeData[name] === "undefined")		return;

	if(typeof this.nodeData[name]['tile'] !== "undefined") {
			for(var i in this.nodeData[name]['tile']) {
					var tiledata = this.nodeData[name]['tile'][i];

					if(i == 'filler' && tiledata.filled == false) {
							if(typeof actor.colorNum !== "undefined") {
									if(actor.colorNum == tiledata.color)					this.nodeData[name]['tile'][i].filled = true;
							}
					}
					if(i == 'igniter' && tiledata.filled == false) {
							if(typeof actor.colorNum !== "undefined") {
									if(actor.colorNum == tiledata.color)					this.nodeData[name]['tile'][i].filled = true;
									if(actor.colorNum == tiledata.color)					this.igniteLine(name,i,tiledata);
							}
					}
					else if(i == 'igniter' && tiledata.filled == true) {
							if(typeof actor.colorNum !== "undefined") {
									if(actor.colorNum == tiledata.color)					this.nodeData[name]['tile'][i].filled = false;
									if(actor.colorNum == tiledata.color)					this.igniteLine(name,i,tiledata);
							}
					}
			}
	}


};
BaseGrid.prototype.playerInput = function(actor,dirstates,heading) {
	if(typeof this.objectLists['char'] === "undefined")		return;
	if(typeof this.objectLists['char'][actor.id] === "undefined")		return;

	var objinfo = this.objectLists['char'][actor.id];
	var ptO = JSON.parse(JSON.stringify(objinfo.ptN));

	var ptP = {i:ptO.i,j:ptO.j};
	if(dirstates.l && heading.x == 0)		ptP.i = ptO.i - 1;
	if(dirstates.r && heading.x == 0)		ptP.i = ptO.i + 1;
	if(ptP.i != ptO.i) {
			var name = ptP.i+','+ptP.j;
			if(typeof this.points[name] !== "undefined") {
					if( this.canMoveObjectTo(actor,ptO,ptP,'char') ) {
						console.log('->',name);
						actor.spaceHeld = false;
						this.moveObjectTo(actor,ptP,'char');

						this.stepActorFrom(actor,ptO,'char');
						this.stepActorOnto(actor,ptO,ptP,'char');
					}
					else {
						ptP.i = ptO.i;
					}
			}
			else {
				ptP.i = ptO.i;
			}
	}
	var ptOP = {i:ptP.i,j:ptP.j};
	if(dirstates.u && heading.y == 0)		ptP.j = ptO.j - 1;
	if(dirstates.d && heading.y == 0)		ptP.j = ptO.j + 1;
	if(ptP.j != ptO.j) {
			var name = ptP.i+','+ptP.j;
			if(typeof this.points[name] !== "undefined") {
					if( this.canMoveObjectTo(actor,ptOP,ptP,'char') ) {
						console.log('->',name);
						actor.spaceHeld = false;
						this.moveObjectTo(actor,ptP,'char');

						this.stepActorFrom(actor,ptOP,'char');
						this.stepActorOnto(actor,ptOP,ptP,'char');
					}
			}
	}
};
BaseGrid.prototype.processGridStep = function(actor,pt,heading) {


};


BaseGrid.prototype.canMoveObjectTo = function(act,ptA,ptB,type)
{
	var ptBname = ptB.i+','+ptB.j;
	if(typeof this.points[ptBname] === "undefined") return false;

	if(typeof this.objectsPerNode[ptBname] !== "undefined") {
		for(var i in this.objectsPerNode[ptBname]) {
			var actor = this.objectsPerNode[ptBname][i];

			if(actor instanceof BlockActor) {
				if(actor.solid)				return false;
			}
			if(actor instanceof BoxShiftActor) {
				if(!actor.moveable)					return false;
				var ptDiff = {i:0,j:0};
				ptDiff.i = ptB.i - ptA.i;
				ptDiff.j = ptB.j - ptA.j;
				if(ptDiff.i < 0 && actor.shiftType.l == 0)		return false;
				if(ptDiff.i > 0 && actor.shiftType.r == 0)		return false;
				if(ptDiff.j > 0 && actor.shiftType.d == 0)		return false;
				if(ptDiff.j < 0 && actor.shiftType.u == 0)		return false;

				var ptNew = {i:(ptDiff.i+ptB.i),j:(ptDiff.j+ptB.j)};
				if( !this.canMoveObjectTo(actor,ptB,ptNew,type) )		return false;
			}
		}
	}
	if(typeof this.nodeData[ptBname] !== "undefined") {
		if(typeof this.nodeData[ptBname]['tile'] !== "undefined") {
			for(var i in this.nodeData[ptBname]['tile']) {
				var tiledata = this.nodeData[ptBname]['tile'][i];
				if(i == 'pit' && act instanceof BoxShiftActor)		continue;
				if(i == 'pit' && act instanceof CharActor)				continue;
				if(i == 'pit' && !tiledata.filled)		return false;
			}
		}
	}


	return true;
};
BaseGrid.prototype.moveObjectTo = function(obj,pt,type)
{
	var name = pt.i+','+pt.j;
	if(typeof this.points[name] === "undefined")		return;

	var ptx = this.absPosition.x + this.points[name].x - this.size.w/2;
	var pty = this.absPosition.y + this.points[name].y - this.size.h/2;

	obj.updatePosition({x:ptx,y:pty});

	this.objectLists[type][obj.id].ptname = pt.i+','+pt.j;
	this.objectLists[type][obj.id].ptN = JSON.parse(JSON.stringify(pt));
//	console.log('=',this.objectLists[type][obj.id].ptname);
};
BaseGrid.prototype.stepActorFrom = function(obj,pt,type)
{
	var name = pt.i+','+pt.j;
	if(typeof this.nodeData[name] === "undefined")		return;

	if(typeof this.nodeData[name]['tile'] !== "undefined") {
			for(var i in this.nodeData[name]['tile']) {
					var tiledata = this.nodeData[name]['tile'][i];

					if(i == 'riser' && tiledata.filled == false) {
							if(obj instanceof CharActor) {
								var B1 = BlockActor.alloc();
								B1.updatePosition({x:0,y:0});
								GAMEMODEL.gameSession.gameWorld.addActor(B1,'act');
								this.addObject('act',B1,name);
								this.nodeData[name]['tile'][i].filled = true;
							}
					}
					if(i == 'filler' && tiledata.filled == false) {
							if(typeof obj.colorNum !== "undefined") {
									if(obj.colorNum == tiledata.color)					this.nodeData[name]['tile'][i].filled = true;
							}
					}
					if(i == 'igniter' && obj instanceof CharActor) {
							if(tiledata.filled == false) {
									if(typeof obj.colorNum !== "undefined") {
											if(obj.colorNum == tiledata.color)					this.nodeData[name]['tile'][i].filled = true;
											if(obj.colorNum == tiledata.color)					this.igniteLine(name,i,tiledata);
									}
							}
							else {
									if(typeof obj.colorNum !== "undefined") {
											if(obj.colorNum == tiledata.color)					this.nodeData[name]['tile'][i].filled = false;
											if(obj.colorNum == tiledata.color)					this.igniteLine(name,i,tiledata);
									}
							}
					}

/*
					if(i == 'exit' && obj instanceof CharActor) {
							obj.beginExit(this.nodeData[name]['tile'][i].level);
					}		/**/

//					grid.setGridData(5,5,6,6,'tile','exit',{path:0});

			}
	}

	if(obj instanceof CharActor)	this.tryStepPulse(obj,pt,type);

};
BaseGrid.prototype.stepActorOnto = function(obj,ptA,ptB,type)
{
	var name = ptB.i+','+ptB.j;
	if(typeof this.nodeData[name] === "undefined")		return;
	if(ptA == null || ptB == null)					return;

	if(typeof this.objectsPerNode[name] !== "undefined") {

		for(var i in this.objectsPerNode[name]) {
			var actor = this.objectsPerNode[name][i];

			if(actor instanceof BoxShiftActor) {
				if(!actor.moveable)					continue;
				var ptDiff = {i:0,j:0};
				ptDiff.i = ptB.i - ptA.i;
				ptDiff.j = ptB.j - ptA.j;
				if(ptDiff.i < 0 && actor.shiftType.l == 0)		continue;
				if(ptDiff.i > 0 && actor.shiftType.r == 0)		continue;
				if(ptDiff.j > 0 && actor.shiftType.d == 0)		continue;
				if(ptDiff.j < 0 && actor.shiftType.u == 0)		continue;

				var ptNew = {i:(ptDiff.i+ptB.i),j:(ptDiff.j+ptB.j)};
				if( !this.canMoveObjectTo(actor,ptB,ptNew,type) )		continue;

				console.log('=>','box shift',ptNew);
				this.moveObjectTo(actor,ptNew,'act');
				this.stepActorFrom(actor,ptB,'act');
				this.stepActorOnto(actor,ptB,ptNew,'act');
			}
		}

	}

	if(typeof this.nodeData[name]['tile'] !== "undefined") {
			for(var i in this.nodeData[name]['tile']) {
					var tiledata = this.nodeData[name]['tile'][i];

					if(i == 'pit' && obj instanceof BoxShiftActor) {
						if(i == 'pit' && !tiledata.filled) {
							obj.alive = false;
							this.nodeData[name]['tile'][i].filled = true;
						}
					}
					if(i == 'pit' && obj instanceof CharActor) {
						if(i == 'pit' && !tiledata.filled) {
							obj.beginDeath();
						}
					}
					if(i == 'laserfield' && obj instanceof CharActor) {
						if(tiledata.color != obj.colorNum && tiledata.filled) {
							obj.health -= tiledata.damage;
							var impact = tiledata.damage*tiledata.damage*tiledata.damage;
							if(tiledata.damage > 3)		impact = 4;
							obj.impact(2,impact);
						}
					}
			}
	}
};
BaseGrid.prototype.igniteLine = function(name,index,tiledata)
{
	var targetlist = [];
	if(typeof tiledata.target !== "undefined")		targetlist.push(tiledata.target);
	if(typeof tiledata.targets !== "undefined") {
		for(var i in tiledata.targets)		targetlist.push(tiledata.targets[i]);
	}

	for(var i in targetlist) {
			var target = targetlist[i];
			var targetname = target.i+','+target.j;
			//				grid.setGridData(0,9,0,9,'lines','line0-9',{color:0,master:{i:0,j:9},target:{i:2,j:7},lines:[{i:0,j:9},{i:0,j:8},{i:0,j:7},{i:1,j:7},{i:2,j:7}]});
			if(typeof this.objectsPerNode[targetname] !== "undefined") {
					for(var a in this.objectsPerNode[targetname]) {
							var actor = this.objectsPerNode[targetname][a];
							if(actor instanceof BlockActor) {
									actor.solid = !actor.solid;
									continue;
							}
					}
			}
	}

};
BaseGrid.prototype.tryStepPulse = function(obj,pt,type)
{
	var name = pt.i+','+pt.j;
	if(typeof obj.colorNum === "undefined")		return;

	if(typeof this.objectsPerNode[name] === "undefined") {
		for(var i in this.objectsPerNode[name]) {
			return;
		}
	}

	if(typeof this.nodeData[name] === "undefined") {
		this.nodeData[name]={};
	}
	if(typeof this.nodeData[name]['tile'] !== "undefined") {
		for(var i in this.nodeData[name]['tile']) {
				if(i == 'riser' && this.nodeData[name]['tile'][i].filled == true)		return;
		}
	}

	var PLSE = ColorPulseActor.alloc();
	PLSE.colorNum = obj.colorNum;
	PLSE.colorStr = PLSE.getNumericColor(PLSE.smokeAlpha, PLSE.colorNum, 'halo');
	this.addObject('pulse',PLSE,name);

	var GW = GAMEMODEL.gameSession.gameWorld;
	GAMEMODEL.gameSession.gameWorld.addActor(PLSE,'act');
};
BaseGrid.prototype.getObjectLocation = function(obj) {
	for(var type in this.objectLists) {
		if(typeof this.objectLists[type][obj.id] !== "undefined") {
			return this.objectLists[type][obj.id].ptname;
		}
	}
};
BaseGrid.prototype.addObject = function(type,obj,n)
{
	var char = {obj:null,move:false,movep:0,start:null};
	if(typeof this.objectLists[type] === "undefined") {
		this.objectLists[type]={};
	}

	var p = n.split(',');
	var ptN = {i:parseInt(p[0]),j:parseInt(p[1])};

	char.obj = obj;
	char.ptN = JSON.parse(JSON.stringify(ptN));
	char.ptname = n;
	char.start = GAMEMODEL.getTime();

	this.objectLists[type][obj.id]=char;
	this.moveObjectTo(obj,ptN,type);

	if(type == 'char')		this.stepActorOnto(char.obj,null,ptN,'char');


	obj.parentGrid = this;
	this.updateObjs();
};
BaseGrid.prototype.addPoint = function(name,pt,data,link)
{
	if(typeof pt !== "undefined" && pt != null) {
		this.points[name]={x:pt.x,y:pt.y,data:data};
	}
	if(typeof link !== "undefined" && link != null) {
		this.addLink(link);
	}
};
BaseGrid.prototype.deletePoint = function(name) {

	if(typeof this.nodeData[name] !== "undefined") {
		var inlinks=[];
		var outlinks=[];
		inlinks.push(name);
		outlinks.push(name);
		for(var i in this.nodeData[name]['inWires']) {
			if(typeof this.nodeData[name]['inWires'][i]['to'] === "undefined")	continue;
			inlinks.push( this.nodeData[name]['inWires'][i]['to'] );
		}
		for(var i in this.nodeData[name]['outWires']) {
			if(typeof this.nodeData[name]['outWires'][i]['to'] === "undefined")	continue;
			outlinks.push( this.nodeData[name]['outWires'][i]['to'] );
		}

		for(var l=1; l<inlinks.length; l++) {
			if(typeof this.points[l] === "undefined") continue;
			this.addLink( [ inlinks[l],name ] ,'outDelete');
		}
		for(var l=1; l<outlinks.length; l++) {
			if(typeof this.points[l] === "undefined") continue;
			this.addLink( [ name,inlinks[l] ] ,'outDelete');
		}
		delete this.nodeData[name];
	}

	if(typeof this.points[name] === "undefined") return;
	delete this.points[name];
};
BaseGrid.prototype.addTileType = function(name,n,data)
{
	if(typeof this.nodeData[n] === "undefined")								this.nodeData[n]={};
	if(typeof this.nodeData[n]['tile'] === "undefined")			this.nodeData[n]['tile']={};
	if(typeof obj === "undefined")			{delete this.nodeData[n]['tile'][name]; return;}
	this.nodeData[n]['tile'][name]=data;
};

/*
BaseGrid.prototype.addItem = function(type,n,obj)
{
	if(typeof this.nodeData[n] === "undefined")								this.nodeData[n]={};
	if(typeof this.nodeData[n]['items'] === "undefined")			this.nodeData[n]['items']={};
	if(typeof obj === "undefined")			{delete this.nodeData[n]['items'][type]; return;}
	this.nodeData[n]['items'][type]=obj;
};
/*
BaseGrid.prototype.addMod = function(mode,n,pts,mods) {
	if(typeof this.nodeData[n] === "undefined")		return;
	if(typeof this.nodeData[n][mode] === "undefined")		return;

	for(var l in pts) {
		for(var i in this.nodeData[n][mode]) {
			if(typeof this.nodeData[n][mode][i]['to'] === "undefined")	continue;
			if(l === this.nodeData[n][mode][i]['to']) {

				for(var item in mods) {
					this.nodeData[n][mode][i][item] = JSON.parse(JSON.stringify( mods[item] ));
				}
			}
		}
	}
};
/**/
BaseGrid.prototype.addLink = function(link,mode='outWires')
{
	if(typeof link['pts'] === "undefined")	return;
	var fromName = link['pts'][0];

	var wiregroup = 'outWires';
	if(mode == 'inWires')		wiregroup = 'inWires';
	if(mode == 'inDelete')		wiregroup = 'inWires';

	if(typeof this.nodeData[fromName] === "undefined")							this.nodeData[fromName]={};
	if(typeof this.nodeData[fromName][wiregroup] === "undefined")	this.nodeData[fromName][wiregroup]=[];


	for(var j=1;j<link['pts'].length;j++) {
		var outwire = {'to':link['pts'][j]};

		// DELETE/OVERLAP PREVIOUS CONNECTION
		for(var a in this.nodeData[fromName][wiregroup]) {
			if(this.nodeData[fromName][wiregroup][a]['to']==outwire['to']) {
				this.nodeData[fromName][wiregroup].splice(a,1); a-=1;
			}
		}
		// DELETE IF A NEW CONNECTION COVERS AN INWIRE
		if(wiregroup == 'outWires' && typeof this.nodeData[fromName]['inWires'] !== "undefined") {
			for(var a in this.nodeData[fromName]['inWires']) {
				if(this.nodeData[fromName]['inWires'][a]['to']==outwire['to']) {
					this.nodeData[fromName]['inWires'].splice(a,1); a-=1;
				}
			}
		}


		// OVERWRITE / ADD MODS
		var revlink = {};
		for(var item in link) {
			if(item == 'pts')	continue;
				outwire[item] = JSON.parse(JSON.stringify( link[item] ));
		}


		if(mode == 'inDelete')	continue;
		if(mode == 'outDelete') {
			revlink['pts']=[];
			revlink['pts'].push(link['pts'][j]);
			revlink['pts'].push(link['pts'][0]);
			this.addLink(revlink,'inDelete');
			continue;
		}

		this.nodeData[fromName][wiregroup].push(outwire);


		if(mode == 'inWires')	continue;
		revlink['pts']=[];
		revlink['pts'].push(link['pts'][j]);
		revlink['pts'].push(link['pts'][0]);
		this.addLink(revlink,'inWires');
	}

	if(mode == 'inWires')	return;
};

BaseGrid.prototype.drawLine = function(ptname,tilename,linedata) {

//	grid.setGridData(0,11,0,11,'lines','line0-11',{color:0,master:{i:0,j:11},target:{i:2,j:9},lines:[{i:0,j:11},{i:0,j:10},{i:0,j:9},{i:1,j:9},{i:2,j:9}]});
	var color = linedata.color;
	var active = false;
	if(typeof linedata.active !== "undefined")		active = linedata.active;
	else if(typeof this.nodeData[ptname] !== "undefined") {
		if(typeof this.nodeData[ptname]['tile'] !== "undefined") {
			if(typeof this.nodeData[ptname]['tile']['igniter'] !== "undefined") {
				var tiledata = this.nodeData[ptname]['tile']['igniter'];
				active = tiledata.filled;
			}
		}
	}

	for(var i=1; i<linedata.lines.length; i++) {
		var prop = {fill:false, color:"#FFFFFF",width:1};
		if(!active)		prop.color = this.getNumericColor(0.2, color, 'halo');
		else 					prop.color = this.getNumericColor(0.8, color, 'halo');
//		if(active)		prop.width = 1.5;

		prop.source = "default";
		prop.writeTo = 1;
		var shape = {type:"shape",pts:[]};
		var transf = {};

		var linestep1 = linedata.lines[i-1];
		var linestep2 = linedata.lines[i];
		var ptname1 = linestep1.i+','+linestep1.j;
		var ptname2 = linestep2.i+','+linestep2.j;
		var pos1 = {x:this.points[ptname1].x,y:this.points[ptname1].y};
		pos1.x += this.position.x - this.size.w/2;
		pos1.y += this.position.y - this.size.h/2;
		var pos2 = {x:this.points[ptname2].x,y:this.points[ptname2].y};
		pos2.x += this.position.x - this.size.w/2;
		pos2.y += this.position.y - this.size.h/2;

		shape.pts.push({x:pos1.x,y:pos1.y,t:'m'});
		shape.pts.push({x:pos2.x,y:pos2.y,t:'l'});
		GAMEVIEW.drawElement(this.position, shape, prop, transf);
	}


};
BaseGrid.prototype.drawTile = function(pos,ptname,tilename) {
		var tiledata = this.nodeData[ptname]['tile'][tilename];
		if(tilename == 'startpt') {
				var shape = {type:"circle",pt:this.position,radius:8};
				var prop = {fill:false, color:"#CCCCCC", width:4};
				prop.color = this.getNumericColor(0.2, this.startColorNum, 'halo');;
				GAMEVIEW.drawElement(pos, shape, prop, {});
				prop.color = 'rgba(0,0,0,0.05)';
				GAMEVIEW.drawElement(pos, shape, prop, {});
		}
		if(tilename == 'igniter') {
			var shape = {type:"circle",pt:this.position,radius:8};
			var prop = {fill:false, color:"#CCCCCC", width:2};
			prop.color = this.getNumericColor(0.6, tiledata.color, 'halo');;
			GAMEVIEW.drawElement(pos, shape, prop, {});
			if(tiledata.filled) {
				prop.fill = true;
				prop.color = this.getNumericColor(0.2, tiledata.color, 'halo');;
				GAMEVIEW.drawElement(pos, shape, prop, {});
			}
		}
		if(tilename == 'laserfield') {
			var shape = {type:"shape",pts:[]};
			var transf = {};
			var pos1 = {x:0,y:0};
			var pos2 = {x:0,y:0};
			if(tiledata.heading == 'H' || tiledata.heading == 'h') pos1.x-=this.tileSize/2;
			if(tiledata.heading == 'H' || tiledata.heading == 'h') pos2.x+=this.tileSize/2;
			if(tiledata.heading == 'V' || tiledata.heading == 'v') pos1.y-=this.tileSize/2;
			if(tiledata.heading == 'V' || tiledata.heading == 'v') pos2.y+=this.tileSize/2;
			shape.pts.push({x:pos1.x,y:pos1.y,t:'m'});
			shape.pts.push({x:pos2.x,y:pos2.y,t:'l'});


			var haloRange = [0.5,1.5];
			var alphaRange = [0.3,0.4];
			var haloAlpha = this.strobeD*(alphaRange[1]-alphaRange[0]) + alphaRange[0];
			var haloWidth = this.strobeD*(haloRange[1]-haloRange[0]) + haloRange[0];

			var prop = {fill:false, color:"#FFFFFF",width:1};
			if(tiledata.filled)					prop.color = this.getNumericColor(1, tiledata.color, 'halo');
			else 												prop.color = this.getNumericColor(0.25, tiledata.color, 'halo');
			if(tiledata.filled)					prop.width = tiledata.damage+haloWidth/2;
			else												prop.width = tiledata.damage/2+0.5;
			GAMEVIEW.drawElement(pos, shape, prop, {});

			if(tiledata.filled) {
				var prop = {fill:false, color:"#FFFFFF",width:1};
				prop.color = this.getNumericColor(haloAlpha, tiledata.color, 'halo');
				prop.width = tiledata.damage*2+haloWidth;
				GAMEVIEW.drawElement(pos, shape, prop, {});
				if(tiledata.damage > 2) {
					var prop = {fill:false, color:"#FFFFFF",width:1};
					prop.width = Math.max(0,tiledata.damage-2.5)+haloWidth/2;
					GAMEVIEW.drawElement(pos, shape, prop, {});
				}
			}
			if(typeof tiledata.ends !== "undefined" && tiledata.ends.length > 0) {
				for(var e in tiledata.ends) {
					var prop = {fill:false, color:"#FFFFFF",width:1};
					if(tiledata.filled)					prop.color = this.getNumericColor(1, tiledata.color, 'halo');
					else 												prop.color = this.getNumericColor(0.25, tiledata.color, 'halo');
					if(tiledata.filled)					prop.width = tiledata.damage/2+haloWidth/2;
					var end = tiledata.ends[e];
					var shape = {type:"circle",radius:(tiledata.damage/2+haloWidth/4)};
					if(!tiledata.filled)		shape.radius=tiledata.damage/2+0.5;
					var ptT = JSON.parse(JSON.stringify(pos1));
					if(end == 1)	 ptT = JSON.parse(JSON.stringify(pos2));
					ptT.x += pos.x;
					ptT.y += pos.y;
					GAMEVIEW.drawElement(ptT, shape, prop, {});

					if(tiledata.filled) {
						var prop = {fill:true, color:"#FFFFFF",width:1};
						prop.color = this.getNumericColor(haloAlpha, tiledata.color, 'halo');
						shape.radius=tiledata.damage;
						GAMEVIEW.drawElement(ptT, shape, prop, {});
					}
				}
			}



/*			var shape = {type:"circle",pt:this.position,radius:8};
			var prop = {fill:false, color:"#CCCCCC", width:2};
			prop.color = this.getNumericColor(0.6, tiledata.color, 'halo');;
			GAMEVIEW.drawElement(pos, shape, prop, {});
			if(tiledata.filled) {
				prop.fill = true;
				prop.color = this.getNumericColor(0.2, tiledata.color, 'halo');;
				GAMEVIEW.drawElement(pos, shape, prop, {});
			}	/**/
		}
		if(tilename == 'riser' && !tiledata.filled) {
			var shape = {type:"box",pt:this.position,width:17,height:17};
			var prop = {fill:false, color:"#999999", width:2};
			prop.writeTo = 1;
			GAMEVIEW.drawElement(pos, shape, prop, {});
		}
		if(tilename == 'pit') {
			var shape = {type:"box",pt:this.position,width:22,height:22};
			var prop = {fill:false, color:"#CCCCCC", width:3};
			GAMEVIEW.drawElement(pos, shape, prop, {});
			var shape = {type:"box",pt:this.position,width:19,height:19};
			var prop = {fill:false, color:"#999999", width:3};
			GAMEVIEW.drawElement(pos, shape, prop, {});
			if(tiledata.filled) {
					var shape = {type:"box",pt:this.position,width:13,height:13};
					var prop = {fill:true, color:"#CCCCCC", width:3};
					GAMEVIEW.drawElement(pos, shape, prop, {});
			}
			else {
				var shape = {type:"box",pt:this.position,width:16,height:16};
				var prop = {fill:false, color:"#666666", width:3};
				GAMEVIEW.drawElement(pos, shape, prop, {});
				var shape = {type:"box",pt:this.position,width:13,height:13};
				var prop = {fill:true, color:"#333333", width:3};
				GAMEVIEW.drawElement(pos, shape, prop, {});
			}
		}

		if(tilename == 'filler') {
				var shape = {type:"box",pt:this.position,width:22,height:22};
				var prop = {fill:false, color:"#999999", width:2};
				if(!tiledata.filled && tiledata.color == 3)			{prop.width=2;shape.height-=1;shape.width-=1;}
				prop.writeTo = 1;
				if(tiledata.color >= 0)			prop.color=this.getNumericColor(1, tiledata.color, 'halo');
				GAMEVIEW.drawElement(pos, shape, prop, {});

				if(tiledata.color >= 0)			prop.color=this.getNumericColor(0.35, tiledata.color, 'halo');
				if(tiledata.filled) {
						prop.writeTo = 2;
						prop.fill = true;
						GAMEVIEW.drawElement(pos, shape, prop, {});
				}
				else {
						var boxed = false;
						if(typeof this.objectsPerNode[ptname] !== "undefined") {
								for(var a in this.objectsPerNode[ptname]) {
										var actor = this.objectsPerNode[ptname][a];
										if(actor instanceof BlockActor) {
												boxed = true;	break;
										}
								}
						}
						if(boxed) {
								prop.writeTo = 2;
								prop.fill = false;
								GAMEVIEW.drawElement(pos, shape, prop, {});
						}
				}
		}


};
BaseGrid.prototype.draw = function()
{
	for(var n in this.points)
	{
			var pos = {x:this.points[n].x,y:this.points[n].y};
			pos.x += this.position.x - this.size.w/2;
			pos.y += this.position.y - this.size.h/2;

			var prop = {fill:false, color:"#CCCCCC", width:1};
			prop.source = "default";
			prop.writeTo = 0;
			var shape = {type:"box",pt:this.position,width:this.tileSize,height:this.tileSize};
			GAMEVIEW.drawElement(pos, shape, prop, {});
	}
	for(var ptname in this.nodeData) {
			if(typeof this.points[ptname] === "undefined")		continue;
			if(typeof this.nodeData[ptname]['lines'] !== "undefined") {
					for(var i in this.nodeData[ptname]['lines']) {
							var linedata = this.nodeData[ptname]['lines'][i];
							this.drawLine(ptname,i,linedata);
					}
			}
			if(typeof this.nodeData[ptname]['tile'] !== "undefined") {
					for(var i in this.nodeData[ptname]['tile']) {
							var tiledata = this.nodeData[ptname]['tile'][i];

							var pos = {x:this.points[ptname].x,y:this.points[ptname].y};
							pos.x += this.position.x - this.size.w/2;
							pos.y += this.position.y - this.size.h/2;

							this.drawTile(pos,ptname,i);
					}
			}
	}



/*	var prop = {fill:false, color:"#000000", width:1};
	prop.source = "default";
	prop.writeTo = 0;
	var shape = {type:"box",pt:this.position,width:24,height:24};
	GAMEVIEW.drawElement({x:0,y:0}, shape, prop, {});


	//	DRAW CONNECTION LINES
	for(var n in this.nodeData)
	{
		if(typeof this.points[n] === "undefined")			console.log(n);
		if(typeof this.points[n] === "undefined")			return;
		var pt1x = this.points[n].x;
		var pt1y = this.points[n].y;
		var side='outWires';

		if(typeof this.nodeData[n][side] === "undefined")		continue;
		if(this.nodeData[n][side].length < 1)		continue;

		for(var i=0; i<this.nodeData[n][side].length; i++) {


			var m = this.nodeData[n][side][i]['to'];
			var pt2x = this.points[m].x;
			var pt2y = this.points[m].y;

			var prop = {fill:false, color:"#999999", width:2};
			prop.source = "default";
			prop.writeTo = 0;

			var shape = {type:"shape",pts:[],pt:this.position};
			shape.pts.push({x:pt1x,y:pt1y,t:'m'});
			shape.pts.push({x:pt2x,y:pt2y,t:'l'});

			GAMEVIEW.drawElement(this.position, shape, prop, {});
		}
	}


	// DRAW DIRECTION CIRCLES (for Debug)
	for(var n in this.nodeData)
	{
		for(var m in this.nodeData[n]['functions']) {
			var pt1x = this.points[n].x + this.absPosition.x;
			var pt1y = this.points[n].y + this.absPosition.y;
			var dirfn = this.nodeData[n]['functions'][m];
			if(dirfn.type == 'outWires' || dirfn.type == 'branch' || dirfn.type == 'switch') {
					pt1x += dirfn['h'].x * 10;
					pt1y += dirfn['h'].y * 10;
//					GAMEVIEW.drawCircle({x:pt1x,y:pt1y},3,"#000000",1);
			}
		}
	}


	//	DRAW NODES (and pulses/lights)
	for(var i in this.points) {
		var ptx = this.absPosition.x + this.points[i].x;
		var pty = this.absPosition.y + this.points[i].y;


		GAMEVIEW.fillCircle({x:ptx,y:pty},5,"#333333",1);


		//	WHITE RING (outline separator for nodes)
		var prop = {fill:false, color:"#FFFFFF", width:2};
		prop.source = "default";
		prop.writeTo = 0;
		var shape = {type:"circle",pt:this.position,radius:5};
		GAMEVIEW.drawElement({x:ptx,y:pty}, shape, prop, {});
	}
	/**/

};

BaseGrid.prototype.update = function()
{
	Actor.prototype.update.call(this);

	if(typeof this.objectLists['char'] !== "undefined") {
		if(Object.keys(this.objectLists['char']).length == 0) {

			var GW = GAMEMODEL.gameSession.gameWorld;
			GW.gamePlayer = CharActor.alloc();
			GAMEMODEL.gameSession.gameWorld.addActor(GW.gamePlayer,'player');
			GW.gamePlayer.updatePosition({x:0,y:50});
			GW.gamePlayer.colorNum = this.startColorNum;

			var name = this.startPos.i+','+this.startPos.j;
			this.addObject('char',GW.gamePlayer,name);
		}
	}

	var curStrobe = GAMEMODEL.getTime();
	var fullStrobeClock = 2*this.strobeClock;
	while(curStrobe > (this.strobeStart+fullStrobeClock))	this.strobeStart += fullStrobeClock;

	var diffStrobe = curStrobe - this.strobeStart;
	var D = (diffStrobe/this.strobeClock);
	if(D >= 1)	D = 1-(D-1);
	this.strobeD = D;



	this.updateNodes();
	this.updateEvents();
	this.updateObjs();
};
BaseGrid.prototype.updateNodes = function() {
	this.objectsPerNode={};
	for(var i in this.points) {
		this.objectsPerNode[i] = [];
	}
	for(var type in this.objectLists) {
		for(var item in this.objectLists[type]) {
			var objset = this.objectLists[type][item];

			var ptname = objset.ptname;
			if(typeof this.objectsPerNode[ptname] !== "undefined") {
					this.objectsPerNode[ptname].push(objset.obj);
			}
		}
	}


	var victory = true;
	var c = 0;
	for(var name in this.nodeData) {
		if(typeof this.nodeData[name]['tile'] !== "undefined") {
			for(var i in this.nodeData[name]['tile']) {
				var tiledata = this.nodeData[name]['tile'][i];

				if(i == 'filler') {
					c=c+1;
					if(!tiledata.filled)			victory = false;
				}
			}
		}
	}
	if(c > 0 && victory == true) {
		if(typeof this.objectLists['char']) {
			for(var id in this.objectLists['char']) {
				var charset = this.objectLists['char'][id];
				charset.obj.beginExit(GAMEMODEL.nextLevelUp);
			}
		}
	}





	return;
	/*
	for(var i in this.nodeData) {

		this.nodeData[i]['opts']={};
		if(typeof this.nodeData[i]['outWires'] !== "undefined") {
			if(this.nodeData[i]['outWires'].length > 1) {
				var type = null;
				for(var a in this.nodeData[i]['outWires']) {
					if(typeof this.nodeData[i]['outWires'][a]['junct'] !== "undefined")	type = this.nodeData[i]['outWires'][a]['junct'];
				}

				if(type == null)	this.nodeData[i]['opts']['branch'] = this.nodeData[i]['outWires'];
				if(type == "switch")	this.nodeData[i]['opts']['switch'] = this.nodeData[i]['outWires'];
			}
		}




		return;
		var wirelist=['outWires','inWires'];
		this.nodeData[i]['dirs']=[];
		for(var a in wirelist) {
			var wireset = wirelist[a];
			if(typeof this.nodeData[i][ wireset ] !== "undefined") {
				for(var b in this.nodeData[i][ wireset ]) {
					var n = this.nodeData[i][ wireset ][b]['to'];
					var dx = this.points[n].x - this.points[i].x;
					var dy = this.points[n].y - this.points[i].y;
					var h = {x:0,y:0};
					if(dx < -1.0)		h.x=-1;
					if(dx > 1.0)		h.x=1;
					if(dy < -1.0)		h.y=-1;
					if(dy > 1.0)		h.y=1;
					var w = {'h':h,'n':n,'w':wireset};
					var skipover = false;
					if(wireset == 'inWires') {
						// Skipover double-directional issues
						for(var c in this.nodeData[i][ 'outWires' ]) {
							var n2 = this.nodeData[i][ 'outWires' ][c]['to'];
							if(n == n2)		skipover = true;
						}
						if(skipover == true)	continue;
					}
					this.nodeData[i]['dirs'].push(w);
				}
			}
		}

		this.nodeData[i]['functions']={};
		for(var a in wirelist) {
			var wireset = wirelist[a];
			for(var b in this.nodeData[i]['dirs']) {
				var dirw = this.nodeData[i]['dirs'][b];
				if(dirw['w'] == wireset) {
					var dirfn = {'to':dirw['n'],'type':wireset,'h':dirw.h};
					if(wireset == 'inWires')	{}
					else if(typeof this.nodeData[i]['opts']['branch'] !== "undefined") {
						var d = this.getDestinationAt(i);
						if(dirw['n'] != d)		dirfn['type'] = 'branch';
					}
					else if(typeof this.nodeData[i]['opts']['switch'] !== "undefined") {
						var d = this.getDestinationAt(i);
						if(dirw['n'] != d)		dirfn['type'] = 'switch';
					}

//					if(this.buttonWindow.windowCount==1)	console.log( i+':'+b+', '+ dirfn['to']+','+dirfn['type']+','+JSON.stringify(dirfn['h']));
					if(dirw.h.x == 0 && dirw.h.y > 0)		this.nodeData[i]['functions']['DA']=dirfn;
					if(dirw.h.x == 0 && dirw.h.y < 0)		this.nodeData[i]['functions']['UA']=dirfn;
					if(dirw.h.x > 0 && dirw.h.y == 0)		this.nodeData[i]['functions']['RA']=dirfn;
					if(dirw.h.x < 0 && dirw.h.y == 0)		this.nodeData[i]['functions']['LA']=dirfn;
					if(dirw.h.x > 0 && dirw.h.y > 0)		this.nodeData[i]['functions']['DARA']=dirfn;
					if(dirw.h.x > 0 && dirw.h.y < 0)		this.nodeData[i]['functions']['UARA']=dirfn;
					if(dirw.h.x < 0 && dirw.h.y > 0)		this.nodeData[i]['functions']['DALA']=dirfn;
					if(dirw.h.x < 0 && dirw.h.y < 0)		this.nodeData[i]['functions']['UALA']=dirfn;
				}
			}
		}
	}
		/**/
};
BaseGrid.prototype.updateEvents = function()
{

	for(var type in this.objectLists) {
		for(var item in this.objectLists[type]) {
			var objset = this.objectLists[type][item];
			if(typeof objset.obj === "undefined")		delete this.objectLists[type][item];
			if(objset.obj.alive == false)						delete this.objectLists[type][item];
		}
	}
	return;

	for(var type in this.objectLists) {

		for(var item in this.objectLists[type]) {
			var objset = this.objectLists[type][item];
			if(objset.obj.alive == false)		continue;

			for(var i in this.nodeData) {
				if(i != objset.ptname)	continue;
				if(typeof this.nodeData[i]['functions'] === "undefined")	continue;
				if(typeof this.nodeData[i]['items'] === "undefined")	continue;
				for(var iname in this.nodeData[i]['items']) {
					var item = this.nodeData[i]['items'][iname];
					if(item['type'] == 'pit' && typeof item['ontouch'] !== "undefined") {
						if(typeof item['ontouch']['damage'] !== "undefined") {
							objset.obj.damage(2.0,1.0,'hurt');
						}
					}
					if(item['type'] == 'teleporter' && typeof item['ontouch'] !== "undefined") {
						if(typeof item['ontouch']['goToLevel'] !== "undefined") {
							if(objset.obj instanceof CharActor) {
								if(objset.obj.exitTimer.running && objset.obj.exit) {
								}
								else if(!objset.obj.exitTimer.running) {
									objset.obj.exitTimer.startTimer();
								}
							}
						}
					}
					/*
					if(item['type'] == 'exit' && typeof item['ontouch'] !== "undefined") {
						if(typeof item['ontouch']['goToLevel'] !== "undefined") {
							if(objset.obj instanceof CharActor) {
								if(objset.obj.exitTimer.running && objset.obj.exit) {
									LEVELLOADER.loadLevel( item['ontouch']['goToLevel'] );
								}
								else if(!objset.obj.exitTimer.running) {
									objset.obj.exitTimer.startTimer();
								}
							}
						}
					}		/**/
					if(item['type'] == 'plate' && typeof item['ontouch'] !== "undefined") {
						if(typeof item['used'] === "undefined" || !item['used']) {
							if(typeof item['ontouch']['addLink'] !== "undefined") {
								var linkobj = item['ontouch']['addLink'];
								this.addLink(linkobj);
							}
							if(typeof item['ontouch']['addObject'] !== "undefined") {
								var linkobj = item['ontouch']['addObject']['obj'];
								this.addObject('obj',linkobj,item['ontouch']['addObject']['to']);
								GAMEMODEL.gameSession.gameWorldList[0].addActor(linkobj,'act');
//								this.addObject(linkobj);
							}
							if(objset.obj instanceof CharActor || objset.obj instanceof CircleActor) {
								if(typeof this.points[i] !== "undefined") {
									var posX = this.points[i].x + this.position.x;
									var posY = this.points[i].y + this.position.y;
									objset.obj.hitSwitch('plate',posX,posY,10.9);
								}
							}

							var r = 0.65 + 0.2 * Math.random();
							var v = 0.95 + 0.3 * Math.random();
							objset.obj.playSound(0, v, r);
							item['used']=true;
						}
					}
				}
			}
		}
	}
};




BaseGrid.prototype.getDestinationAt = function(ptn) {
	if(typeof this.nodeData[ptn] === "undefined")		return null;
	if(typeof this.nodeData[ptn]['outWires'] === "undefined")		return null;
	if(typeof this.changes[ptn] !== "undefined") {
		return this.changes[ptn]['dest'];
	}

	for(var i in this.nodeData[ptn]['outWires']) {
		if(typeof this.nodeData[ptn]['outWires'][i]['default'] !== "undefined") {
			if(this.nodeData[ptn]['outWires'][i]['default'] == 1) {
				return this.nodeData[ptn]['outWires'][i]['to'];
			}
		}
	}
	for(var i in this.nodeData[ptn]['outWires']) {
		if(typeof this.nodeData[ptn]['outWires'][i]['nodefault'] !== "undefined") {
			if(this.nodeData[ptn]['outWires'][i]['nodefault'] == 1) continue;
		}
		if(typeof this.nodeData[ptn]['outWires'][i]['jump'] !== "undefined") {
			if(this.nodeData[ptn]['outWires'][i]['jump'] == 1) continue;
		}

		return this.nodeData[ptn]['outWires'][i]['to'];

	}
};

BaseGrid.prototype.updateObjs = function()
{
	var objStepping = function(grid,objset) {
		if(objNotFirst(grid,objset)==false)		return false;
		var d = grid.getDestinationAt(objset.ptname);
		if(typeof d === "undefined")		return true;
		if(d != null)		return true;
		return false;
	};
	var objNotFirst = function(grid,objset) {
		var delay = 2;
		if(typeof objset.obj.startDelay !== "undefined")		delay = objset.obj.startDelay;
		return true;
	};


	for(var name in this.objectLists) {
		for(var item in this.objectLists[name]) {
			var objset = this.objectLists[name][item];

			var n = objset['ptname'];


			if(typeof this.points[n] !== "undefined") {
				var ptAx = this.absPosition.x + this.points[n].x - this.size.w/2;
				var ptAy = this.absPosition.y + this.points[n].y - this.size.h/2;


				if(objStepping(this,objset) == false) {
					objset['obj'].updatePosition({x:ptAx,y:ptAy});
				}
				else {
//					if(typeof objset.obj.walkList!=="undefined")		console.log(objset.obj['curBehavior']+','+objset.obj['movingTo']+','+objset.obj.walkList.length);
					if(objset.obj['movingTo'] == null) {
						if(objset.obj['nextTo'] != null) {
							objset.obj['movingTo'] = objset.obj['nextTo'];
							objset.obj['nextTo'] = null;
						}
					}

					if(objset.obj['movingTo'] != null) {
						var pname = objset.obj['movingTo'];
						var pt1x = this.points[pname].x;
						var pt1y = this.points[pname].y;

						var ptx = wratio*(pt1x-this.points[n].x)+ptAx;
						var pty = wratio*(pt1y-this.points[n].y)+ptAy;

						objset['obj'].updatePosition({x:ptx,y:pty});
					}
				}
			}

		}
	}

};


BaseGrid.prototype.collide = function(act) {
	Actor.prototype.collide.call(this,act);
};
BaseGrid.prototype.collideType = function(act) {
	return false;
};
BaseGrid.prototype.collideVs = function(act) {
};


BaseGrid.alloc = function()
{
	var vc = new BaseGrid();
	vc.init();
	return vc;
};



exports.BaseGrid = BaseGrid;
exports.BaseGrid._loadJSEngineClasses = _loadJSEngineClasses;
