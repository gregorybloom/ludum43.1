function MovementGrid()
{
}

MovementGrid.prototype = new Actor;

MovementGrid.prototype.identity = function()
{
	return ('MovementGrid (' + this._dom.id + ')');
};

MovementGrid.prototype.init = function()
{
	Actor.prototype.init.call(this);

	this.points = {};

	this.changes = {};

	this.objectLists = {};
	this.nodeData = {};

};
MovementGrid.prototype.loadingData = function(data)
{
	Actor.prototype.loadingData.call(this,data);
};
MovementGrid.prototype.addObject = function(type,obj,n)
{
	var char = {obj:null,move:false,movep:0,start:null};

	if(type == 'char') {
		if(typeof this.objectLists['char'] === "undefined" ||
			this.objectLists['char'].length > 0) {
				this.objectLists['char']=[];
		}
	}
	else {
		if(typeof this.objectLists[type] === "undefined") {
			this.objectLists[type]=[];
		}
	}

	char.obj = obj;
	char.obj.ptN = n;
	char.start = GAMEMODEL.getTime();
	this.objectLists[type].push(char);

	obj.parentGrid = this;
	this.updateObjs();
};
MovementGrid.prototype.addPoint = function(name,pt,data,link)
{
	if(typeof pt !== "undefined" && pt != null) {
		this.points[name]={x:pt.x,y:pt.y,data:data};
	}
	if(typeof link !== "undefined" && link != null) {
		this.addLink(link);
	}
};
MovementGrid.prototype.deletePoint = function(name) {

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
			if(typeof this.points[l] === "undefined") return;
			this.addLink( [ inlinks[l],name ] ,'outDelete');
		}
		for(var l=1; l<outlinks.length; l++) {
			if(typeof this.points[l] === "undefined") return;
			this.addLink( [ name,inlinks[l] ] ,'outDelete');
		}
		delete this.nodeData[name];
	}

	if(typeof this.points[name] === "undefined") return;
	delete this.points[name];
};
MovementGrid.prototype.addItem = function(type,n,obj)
{
	if(typeof this.nodeData[n] === "undefined")								this.nodeData[n]={};
	if(typeof this.nodeData[n]['items'] === "undefined")			this.nodeData[n]['items']={};
	if(typeof obj === "undefined")			{delete this.nodeData[n]['items'][type]; return;}
	this.nodeData[n]['items'][type]=obj;
};
MovementGrid.prototype.addMod = function(mode,n,pts,mods) {
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
MovementGrid.prototype.addLink = function(link,mode='outWires')
{
	if(typeof link['pts'] === "undefined")	return;
	var from = link['pts'][0];

	var wiregroup = 'outWires';
	if(mode == 'inWires')		wiregroup = 'inWires';
	if(mode == 'inDelete')		wiregroup = 'inWires';

	if(typeof this.nodeData[from] === "undefined")							this.nodeData[from]={};
	if(typeof this.nodeData[from][wiregroup] === "undefined")	this.nodeData[from][wiregroup]=[];


	for(var j=1;j<link['pts'].length;j++) {
		var outwire = {'to':link['pts'][j]};

		// DELETE/OVERLAP PREVIOUS CONNECTION
		for(var a in this.nodeData[from][wiregroup]) {
			if(this.nodeData[from][wiregroup][a]['to']==outwire['to']) {
				this.nodeData[from][wiregroup].splice(a,1); a-=1;
			}
		}
		// DELETE IF A NEW CONNECTION COVERS AN INWIRE
		if(wiregroup == 'outWires' && typeof this.nodeData[from]['inWires'] !== "undefined") {
			for(var a in this.nodeData[from]['inWires']) {
				if(this.nodeData[from]['inWires'][a]['to']==outwire['to']) {
					this.nodeData[from]['inWires'].splice(a,1); a-=1;
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

		this.nodeData[from][wiregroup].push(outwire);


		if(mode == 'inWires')	continue;
		revlink['pts']=[];
		revlink['pts'].push(link['pts'][j]);
		revlink['pts'].push(link['pts'][0]);
		this.addLink(revlink,'inWires');
	}

	if(mode == 'inWires')	return;
};
MovementGrid.prototype.draw = function()
{
	//	DRAW CONNECTION LINES
	for(var n in this.nodeData)
	{
		if(typeof this.points[n] === "undefined")			console.log(n);
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

			if(typeof this.nodeData[n][side][i]['jump'] !== "undefined") {
				if(this.nodeData[n][side][i]['jump'] == 1) prop.color = "#EEEEEE";
			}

			GAMEVIEW.drawElement(this.position, shape, prop, {});

			if(typeof this.objectLists['char'] === "undefined")		continue;
			for(var item in this.objectLists['char']) {
				var objset = this.objectLists['char'][item];
				if(objset.obj.ptN != n)		continue;
				if(objset.obj.alive == false)		continue;
				if(objset.obj instanceof CharActor) {
					for(var fn in this.nodeData[n]['functions']) {
						if(this.nodeData[n]['functions'][fn]['to'] != m)	continue;
						var type = this.nodeData[n]['functions'][fn]['type'];
						if(type != 'outWires' && type != 'branch' && type != 'switch')		continue;
						prop.width = 8;
						prop.color = "rgba(0,200,255,0.2)";
						GAMEVIEW.drawElement(this.position, shape, prop, {});
					}
				}
			}
		}

	}
	for(var n in this.nodeData)
	{
		var pt1x = this.points[n].x;
		var pt1y = this.points[n].y;

		if(typeof this.nodeData[n][side] === "undefined")		continue;
		if(this.nodeData[n][side].length < 1)		continue;

		// DRAW DIRECTION INDICATORS
		for(var b=0; b<2; b++) {
			var side='outWires';
			if(b==0)	side='inWires';
			if(b==0)	continue;

			if(typeof this.nodeData[n][side] === "undefined")		continue;
			for(var i=0; i<this.nodeData[n][side].length; i++) {
				var m = this.nodeData[n][side][i]['to'];
				var pt2x = this.points[m].x;
				var pt2y = this.points[m].y;

				var pt2xa = pt2x-pt1x;
				var pt2ya = pt2y-pt1y;
				var D2 = Math.sqrt(pt2xa*pt2xa + pt2ya*pt2ya) * 0.045;
				if (D2 < 3.5)	D2=3.5;
				if(b==0)	D2/=0.8;
				pt2xa = pt2xa/D2 + pt1x;
				pt2ya = pt2ya/D2 + pt1y;

				var shape = {type:"shape",pts:[],pt:this.position};
				shape.pts.push({x:pt1x,y:pt1y,t:'m'});
				shape.pts.push({x:pt2xa,y:pt2ya,t:'l'});
				prop.width=4;
				var d = this.getDestinationAt( n );
//				prop.color="#0000FF";
				prop.color="#0000FF";

//				if(m != d)			prop.color="#CC00FF";
			if(m != d)				prop.color="#FF0000";
				if(b==0)				prop.color="#0000FF";
				if(typeof this.nodeData[n][side][i]['junct'] !== "undefined")
				{
					if(this.nodeData[n][side][i]['junct'] == "switch") {
						if(m != d)	prop.color="#FF0000";
						else 				prop.color="#00FF00";
					}
				}
				GAMEVIEW.drawElement(this.position, shape, prop, {});

				if(typeof this.nodeData[n][side][i]['jump'] !== "undefined") {
					if(this.nodeData[n][side][i]['jump'] == 1) continue;
				}
			}
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

		// DRAW NODE BODY
		if(typeof this.nodeData[i] === "undefined" || typeof this.nodeData[i]['opts'] === "undefined") {
			GAMEVIEW.fillCircle({x:ptx,y:pty},5,"#777777",1);
		}
		else if(typeof this.nodeData[i]['opts']['switch'] !== "undefined") {
			GAMEVIEW.fillCircle({x:ptx,y:pty},5,"#00FF00",1);
		}
		else if(typeof this.nodeData[i]['opts']['branch'] !== "undefined") {
			GAMEVIEW.fillCircle({x:ptx,y:pty},5,"#CC00FF",1);
		}
		else {
			GAMEVIEW.fillCircle({x:ptx,y:pty},5,"#777777",1);
		}

		//	DRAW NODE ITEMS
		if(typeof this.nodeData[i] !== "undefined") {
			if(typeof this.nodeData[i]['items'] !== "undefined") {
				for(var iname in this.nodeData[i]['items']) {
					var item = this.nodeData[i]['items'][iname];
					if(typeof item['mod'] !== "undefined") {

					}
					if(item['type'] == 'exit') {
						GAMEVIEW.fillCircle({x:ptx,y:pty},7,"#AAFF00",3);
						GAMEVIEW.drawCircle({x:ptx,y:pty},7,"#FF9900",3);
					}
					if(item['type'] == 'pit') {
						GAMEVIEW.fillCircle({x:ptx,y:pty},10,"#000033",3);
						GAMEVIEW.drawCircle({x:ptx,y:pty},10,"#FF0033",3);
					}
					if(item['type'] == 'plate' && typeof item['ontouch'] !== "undefined") {
						if(typeof item['used'] === "undefined" || !item['used']) {
							GAMEVIEW.fillCircle({x:ptx,y:pty},7,"#FFFF33",1);
						}
						else {
							GAMEVIEW.fillCircle({x:ptx,y:pty},7,"#CC6600",1);
						}
					}
				}
			}
		}


		var prop = {fill:false, color:"#0000FF", width:2};
		prop.source = "default";
		prop.writeTo = 0;
		var shape = {type:"circle",pt:this.position,radius:5};
		//	WHITE RING (outline separator for nodes)
		prop.color = "#FFFFFF";
		GAMEVIEW.drawElement({x:ptx,y:pty}, shape, prop, {});


		//	DRAW NODE BOX (for any effects requiring key input; branches,switchboards,etc)
		var prop = {fill:false, color:"#000000", width:1};
		prop.source = "default";
		prop.writeTo = 0;
		var shape = {type:"box",pt:this.position,width:12,height:12};
		if(typeof this.nodeData[i] !== "undefined" && typeof this.nodeData[i]['opts'] !== "undefined") {
			if(typeof this.nodeData[i]['opts']['switch'] !== "undefined") {
				GAMEVIEW.drawElement({x:ptx,y:pty}, shape, prop, {});
			}
			else if(typeof this.nodeData[i]['opts']['branch'] !== "undefined") {
				GAMEVIEW.drawElement({x:ptx,y:pty}, shape, prop, {});
			}
		}

	}
	/**/
};

MovementGrid.prototype.update = function()
{
	Actor.prototype.update.call(this);


	var t = GAMEMUSIC.audioElement.currentTime;
	t = Math.ceil( t*1000 );
//	var startAhead = t - this.audioLeadStart;


	this.updateNodes();
	this.updateEvents();
	this.updateHits();
	this.updateObjs();		/**/
};
MovementGrid.prototype.updateNodes = function() {
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
};
MovementGrid.prototype.updateEvents = function()
{
	for(var type in this.objectLists) {
		for(var item in this.objectLists[type]) {
			var objset = this.objectLists[type][item];
			if(typeof objset.obj === "undefined")		this.objectLists[type].splice(item,1)
			if(objset.obj.alive == false)						this.objectLists[type].splice(item,1)
		}
	}

	for(var type in this.objectLists) {

		for(var item in this.objectLists[type]) {
			var objset = this.objectLists[type][item];
			if(objset.obj.alive == false)		continue;

			for(var i in this.nodeData) {
				if(i != objset.obj.ptN)	continue;
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
					}
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
//									console.log("X");
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




MovementGrid.prototype.getDestinationAt = function(ptn) {
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

MovementGrid.prototype.updateObjs = function()
{
	var objStepping = function(grid,objset) {
		if(objNotFirst(grid,objset)==false)		return false;
		var d = grid.getDestinationAt(objset.obj.ptN);
		if(typeof d === "undefined")		return true;
		if(d != null)		return true;
		if(objset.obj instanceof CircleActor) {
			if(objset.obj.walkList.length > 0)	return true;
		}
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

			var n = objset['obj']['ptN'];


			if(typeof this.points[n] !== "undefined") {
				var ptAx = this.absPosition.x + this.points[n].x;
				var ptAy = this.absPosition.y + this.points[n].y;


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
						else {
							for(var i in this.nodeData) {
								if(objset.obj instanceof CircleActor) {
									objset.obj.updateMode();
									if(objset.obj.walkList.length > 0)	break;
								}	/**/
								if(i == objset.obj.ptN) {
									var pname = this.getDestinationAt( i );
									objset.obj['movingTo'] = pname;
									break;
								}
							}
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


MovementGrid.prototype.collide = function(act) {
	Actor.prototype.collide.call(this,act);
};
MovementGrid.prototype.collideType = function(act) {
	return false;
};
MovementGrid.prototype.collideVs = function(act) {
};


MovementGrid.alloc = function()
{
	var vc = new MovementGrid();
	vc.init();
	return vc;
};
