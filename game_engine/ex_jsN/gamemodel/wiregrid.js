function WireGrid()
{
}

WireGrid.prototype = new Actor;

WireGrid.prototype.identity = function()
{
	return ('WireGrid (' + this._dom.id + ')');
};

WireGrid.prototype.init = function()
{
	Actor.prototype.init.call(this);

	this.points = {};

	this.changes = {};

	this.objectLists = {};
	this.nodeData = {};

	this.audioLead = 0;
	this.audioLeadStart = GAMEMODEL.getTime();

	var fullDelay = 1300;

	this.pulseWindow = WindowObj.alloc();
	this.pulseWindow.name = "pulseWindow";
	this.pulseWindow.pulseTimer.lifeTime = 1000;
	this.pulseWindow.windowTimer.lifeTime = 1000;
	this.pulseWindow.delay = fullDelay;
  this.pulseWindow.windowLagRatio = 0.75;
	this.pulseWindow.windowLife = 110;
	this.pulseWindow.updateLeads();

	this.pulseWalk = 280;

	this.buttonWindow = WindowObj.alloc();
	this.buttonWindow.name = "buttonWindow";
	this.buttonWindow.pulseTimer.lifeTime = 1000;
	this.buttonWindow.windowTimer.lifeTime = 1000;
	this.buttonWindow.delay = fullDelay;
  this.buttonWindow.windowLagRatio = 0.25;
	this.buttonWindow.windowLife = 400;
	this.buttonWindow.updateLeads();

	this.buttonWindow.blankLead = 80;
	this.buttonWindow.blankTail = 80;

	this.pressFrames={};

	this.gridStartTime = GAMEMODEL.getTime();

};
WireGrid.prototype.loadingData = function(data)
{
	Actor.prototype.loadingData.call(this,data);
};
WireGrid.prototype.addObject = function(type,obj,n)
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
WireGrid.prototype.addPoint = function(name,pt,data,link)
{
	if(typeof pt !== "undefined" && pt != null) {
		this.points[name]={x:pt.x,y:pt.y,data:data};
	}
	if(typeof link !== "undefined" && link != null) {
		this.addLink(link);
	}
};
WireGrid.prototype.deletePoint = function(name) {

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
WireGrid.prototype.addItem = function(type,n,obj)
{
	if(typeof this.nodeData[n] === "undefined")								this.nodeData[n]={};
	if(typeof this.nodeData[n]['items'] === "undefined")			this.nodeData[n]['items']={};
	if(typeof obj === "undefined")			{delete this.nodeData[n]['items'][type]; return;}
	this.nodeData[n]['items'][type]=obj;
};
WireGrid.prototype.addMod = function(mode,n,pts,mods) {
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
WireGrid.prototype.addLink = function(link,mode='outWires')
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
WireGrid.prototype.draw = function()
{


	var lightUp = function(grid,i,prop,shape) {
		var ptx = grid.absPosition.x + grid.points[i].x;
		var pty = grid.absPosition.y + grid.points[i].y;
		if( grid.buttonWindow.windowPhase >= 0) {
			prop.color = "#0066FF";
			GAMEVIEW.drawElement({x:ptx,y:pty}, shape, prop, {});
		}
	};
	var drawPulse = function(grid,n1,m1,prop,shape) {
		var phead = grid.pulseWindow.windowAt;
		var ptail = grid.pulseWindow.windowAt - (grid.pulseWindow.windowLife/2);
		phead /= grid.pulseWindow.windowLife;
		ptail /= grid.pulseWindow.windowLife;


		if (phead < 0)	phead=0;
		if (ptail < 0)	ptail=0;
		if (phead > 1)	phead=1;
		if (ptail > 1)	ptail=1;


		var pt1x = grid.points[n1].x;
		var pt1y = grid.points[n1].y;
		var pt2x = grid.points[m1].x;
		var pt2y = grid.points[m1].y;


		var pdiffx = (pt2x - pt1x);
		var pdiffy = (pt2y - pt1y);
		var ptHx = phead * pdiffx + pt1x;
		var ptHy = phead * pdiffy + pt1y;
		var ptTx = ptail * pdiffx + pt1x;
		var ptTy = ptail * pdiffy + pt1y;

		prop.color = "#000099";
		shape.pts = [];
		shape.pts.push({x:ptHx,y:ptHy,t:'m'});
		shape.pts.push({x:ptTx,y:ptTy,t:'l'});

		GAMEVIEW.drawElement(grid.position, shape, prop, {});
	};

	this.pulseWindow.update();
	this.buttonWindow.update();


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

//			if(this.pulseWindow.windowPhase >= 0)		continue;
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
				if(b==1)		drawPulse(this,n,m,prop,shape);
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

		//	NODE POWER PULSE (body, then outer ring)
		lightUp(this,i,prop,shape);
		if(this.buttonWindow.windowPhase >= 0) {
			var blankt = this.buttonWindow.blankLead*(1-this.buttonWindow.windowLagRatio);
			var blankt2 = this.buttonWindow.windowLife - this.buttonWindow.blankTail*this.buttonWindow.windowLagRatio;

			if(this.buttonWindow.windowAt >= blankt && this.buttonWindow.windowAt <= blankt2) {
				GAMEVIEW.drawCircle({x:ptx,y:pty},9,"#0099FF",1);
			}
		}

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

WireGrid.prototype.update = function()
{
	Actor.prototype.update.call(this);


	if(!this.pulseWindow.started)		this.pulseWindow.startTimer();
	if(!this.buttonWindow.started)		this.buttonWindow.startTimer();
	this.pulseWindow.update();
	this.buttonWindow.update();

	var t = GAMEMUSIC.audioElement.currentTime;
	t = Math.ceil( t*1000 );
//	var startAhead = t - this.audioLeadStart;

	if(!this.pulseWindow.delayed) {
		var TO = GAMEMODEL.getTime();										// - 60to80 - 1300
		var dt = TO - this.pulseWindow.originTime - this.pulseWindow.delay;
		var pulseAdjust = t - dt;
		this.pulseWindow.initialPulseAdjust = pulseAdjust%this.pulseWindow.pulseTimer.lifeTime;
	}
	if(!this.buttonWindow.delayed) {
		var TO = GAMEMODEL.getTime();										// - 60to80 - 1300
		var dt = TO - this.buttonWindow.originTime - this.buttonWindow.delay;
		var pulseAdjust = t - dt;
		this.buttonWindow.initialPulseAdjust = pulseAdjust%this.buttonWindow.pulseTimer.lifeTime;
	}

	this.updateNodes();
	this.updateEvents();
	this.updateHits();
	this.updateObjs();		/**/
};
WireGrid.prototype.addPressFrame = function(key,char,time) {
	var windowNum = this.buttonWindow.windowCount;
	if(windowNum == 0)		return;
	if(typeof char.keyPressList[key] === "undefined")		return;
	if(typeof this.pressFrames[windowNum] === "undefined")
	{
		this.pressFrames[windowNum]=[];
	}
	for(var i in this.pressFrames[windowNum]) {
		var frame = this.pressFrames[windowNum][i];
//		if(frame.key == key && frame.time == time)		return;
		if(frame.key == key && frame.time == char.keyPressList[key])		return;
	}
	var newframe = {};
	newframe['key'] = key;
	newframe['time'] = char.keyPressList[key];
	newframe['frame'] = windowNum;
	newframe['phase'] = this.buttonWindow.windowPhase;
	newframe['new'] = true;
	newframe['miss'] = false;
	if(this.buttonWindow.windowPhase < 0)	newframe['miss'] = true;

	this.pressFrames[windowNum].push(newframe);
//					if(newframe['miss'] == false) 	console.log(newframe);
};
WireGrid.prototype.updateNodes = function() {
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
WireGrid.prototype.updateEvents = function()
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
									if(this.pulseWindow.windowPhase >= 0) {
										objset.obj.ptN = item['ontouch']['goToPoint'];
										objset.obj.exit = false;
										objset.obj.exitTimer.init();
									}
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
WireGrid.prototype.updateHits = function() {
	this.updateFrames();

	if(typeof this.objectLists['char'] === "undefined" ||
		this.objectLists['char'].length > 0) {
			var charset = this.objectLists['char'][0];
			var char = charset.obj;
	}
	else {
		return;
	}

	for(var a in this.pressFrames) {


		//	a == frame's window number
		if(a != this.buttonWindow.windowCount)				continue;
		var framegroup = this.pressFrames[a];
		for(var b in framegroup) {
			var frame = framegroup[b];

			if(frame['new'] == false)																	continue;
			if(frame['frame'] < (this.buttonWindow.windowCount-1))		continue;

//			console.log(this.buttonWindow.windowCount+":"+this.buttonWindow.windowPhase+'='+ a + ","+frame['key'] + ' '+console.log(frame));
			if(frame['miss'] == true || frame['phase'] < 0) {

				var resolved = false;
				for(var i in this.nodeData) {
					if(i != charset.obj.ptN)	continue;
					if(typeof this.nodeData[i]['functions'] === "undefined")	break;
					if(typeof this.nodeData[i]['outWires'] === "undefined")		break;
					if(typeof this.nodeData[i]['functions'][frame['key']] === "undefined")		break;
					if(this.nodeData[i]['outWires'].length > 1) {
						if(this.getDestinationAt(i) != this.nodeData[i]['functions'][frame['key']]['to']) {
							if(this.nodeData[i]['functions'][frame['key']]['type'] != 'inWires')		break;
						}
					}
					if(this.getDestinationAt(i) != this.nodeData[i]['functions'][frame['key']]['to']) {
						char.damage(1,1.0,'hurt');
					}
					else {
						console.log('stun source a');
						char.damage(0,0.5,'stun');
					}
					resolved=true;
				}
				frame['new']=false;
				if(resolved)	continue;

				char.damage(1,1.0,'hurt');
			}
			else {

				for(var i in this.nodeData) {
					if(typeof this.nodeData[i]['functions'] === "undefined")	continue;
					if(i != charset.obj.ptN)	continue;


					var tarray = [];
					for(var j in this.nodeData[i]['functions']) {
						if(j.indexOf(frame['key']) === -1)		continue;
						if(j.match("^[UD]A[LR]A$")!=null)	tarray.unshift(j);
						else 															tarray.push(j);
					}

					if(tarray.length == 0) {
						//	Off-rail directionals on-beat still cause stun
						if(frame['key'].match("^[UDLR]A$")!=null && frame['new'] == true) {
							if(frame['frame'] >= (this.buttonWindow.windowCount-1)) {
//								console.log('stun source b');
//								char.damage(0,0.5,'stun');
									char.damage(1,1.0,'hurt');
							}
						}
						frame['new']=false;
					}
					for(var ind in tarray) {
						var j = tarray[ind];
						var hit = false;


						var startOrEnd = (j.startsWith(frame['key']) || (j.indexOf(frame['key']) === 2));
						if(frame['new'] == false)		break;
						if(j.match("^[RLUD]A$")!=null && j == frame['key'])		hit=true;
						else if(j.match("^[UD]A[LR]A$")!=null && startOrEnd) {
							for(var k in this.pressFrames) {
								for(var l in this.pressFrames[k]) {
									var frame2 = this.pressFrames[k][l];
									if(frame2['new'] == false)														continue;
									if(frame2['key'] == frame['key'])											continue;
									if(frame2['frame'] != this.buttonWindow.windowCount)	continue;
									var startOrEnd2 = (j.startsWith(frame2['key']) || (j.indexOf(frame2['key']) === 2));
									if(startOrEnd2)	{hit=true;frame2['new']=false;}
									if(startOrEnd2)	{console.log('diag hit');}
								}
							}
						}

						if(hit == false) {
							frame['new']=false;
						}
						if(j.indexOf(frame['key']) === -1)		continue;


						if(j.length < 4 && j.match("^[UDLR]A$")!=null && j !== frame['key'])		continue;
						if(j.length < 4 && j.match("^[UDLR]A$")==null && j !== frame['key'])		continue;
						if(hit == true && frame['key'].match("^[RLUD]A$")!=null) {
							if(typeof this.nodeData[i]['outWires'] === "undefined")		return;

							var fnobj = this.nodeData[i]['functions'][j];

							var anyout = false;
							for(var fn in this.nodeData[i]['functions']) {
								if(fn.indexOf(frame['key']) === -1)													continue;
//								if(this.nodeData[i]['functions'][fn]['to'] != charset.obj.ptN)	continue;
								if(fnobj['type'] == 'outWires')			anyout=true;
								if(fnobj['type'] == 'branch' || fnobj['type'] == 'switch')		anyout=true;
							}

							if(!anyout && fnobj['type'] == 'inWires') {
//								console.log('stun source c');
//								char.damage(0,0.5,'stun');
									char.damage(1,1.0,'hurt');
								frame['new']=false;
							}
							if(fnobj['type'] == 'outWires') {
								char.heal(0.1,1,'heal');
								frame['new']=false;

								for(var a in this.nodeData[i]['outWires']) {
									if( this.nodeData[i]['functions'][j]['to'] != this.nodeData[i]['outWires'][a]['to'] )		continue;
									if(typeof this.nodeData[i]['outWires'][a]['jump'] !== "undefined") {
										if(this.nodeData[i]['outWires'][a]['jump'] == 1) {
											charset.obj['nextTo'] = this.nodeData[i]['functions'][j]['to'];
										}
									}
								}

							}
							if(fnobj['type'] == 'branch' || fnobj['type'] == 'switch') {

								var pname = this.nodeData[i]['functions'][j]['to'];
								if(fnobj['type'] == 'branch')		charset.obj['nextTo'] = pname;
								if(fnobj['type'] == 'switch') {
									if(typeof this.changes[i] === "undefined")	this.changes[i] = {};
									this.changes[i]['dest'] = pname;
									var r = 1.4 + 0.3 * Math.random();
									var v = 0.45 + 0.1 * Math.random();
									char.playSound(0, v, r);
								}

								char.heal(0.1,1,'heal',1.5);
								if(this.pulseWindow.windowPhase >= 0) {
									charset.obj['movingTo'] = pname;
								}
								frame['new']=false;
							}
						}

					}
				}

			}

		}
	}

};
WireGrid.prototype.updateFrames = function() {
	if(typeof this.objectLists['char'] === "undefined" ||
		this.objectLists['char'].length > 0) {
			var charset = this.objectLists['char'][0];
			var char = charset.obj;
			if(char.deathTimer.started || !char.alive)			return;

			for(var i in char.keyList) {
				var keyname = char.keyList[i];
				if(typeof char.keyPressList[keyname] !== "undefined")
				{
					var time = char.keyPressList[keyname];
					if(time < 0)	continue;
					var f = JSON.stringify(time >= this.buttonWindow.windowTimer.startTime);

//					console.log(keyname+','+time+'>='+this.buttonWindow.windowTimer.startTime+':'+f+' = '+char.keyPressList[keyname]+','+char.newPressList[keyname]);
					if(char.newPressList[keyname] == false)		continue;

					char.newPressList[keyname] = false;
//					if(time >= this.buttonWindow.windowTimer.startTime) {
						this.addPressFrame(keyname,char,time);
						char.keyPressList[keyname] = -1;
//					}
				}
			}
		}
		for(var i in this.pressFrames) {
			var framegroup = this.pressFrames[i];

			if(i < (this.buttonWindow.windowCount-10)) {
				delete this.pressFrames[i];
			}
		}
};

WireGrid.prototype.getDestinationAt = function(ptn) {
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

WireGrid.prototype.updateObjs = function()
{
	var objStepping = function(grid,objset) {
		if(grid.pulseWindow.windowPhase < 0)	return false;
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
		var t = objset.start;
		if(t <= grid.pulseWindow.originTime+grid.pulseWindow.delay)		t = grid.pulseWindow.originTime+grid.pulseWindow.delay;
		t += grid.pulseWindow.windowTimer.lifeTime*delay;


		if(t > grid.pulseWindow.windowTimer.startTime)		return false;
		return true;
	};

	for(var name in this.objectLists) {
		for(var item in this.objectLists[name]) {
			var objset = this.objectLists[name][item];

			if(this.pulseWindow.windowPhase < 0 && objset.obj['movingTo'] != null) {
				objset['obj']['ptN']=objset.obj['movingTo'];
				objset.obj['movingTo']=null;
				//	Drop past moving commands, old next's
				if(objset['obj']['ptN'] == objset.obj['nextTo']) {
					objset.obj['nextTo']=null;
				}
			}

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

						var wratio = this.pulseWindow.windowAt - (this.pulseWindow.windowLife/4);
						wratio /= this.pulseWalk;


						var ptx = wratio*(pt1x-this.points[n].x)+ptAx;
						var pty = wratio*(pt1y-this.points[n].y)+ptAy;

						objset['obj'].updatePosition({x:ptx,y:pty});
					}
				}
			}

		}
	}

};


WireGrid.prototype.collide = function(act) {
	Actor.prototype.collide.call(this,act);
};
WireGrid.prototype.collideType = function(act) {
	return false;
};
WireGrid.prototype.collideVs = function(act) {
};


WireGrid.alloc = function()
{
	var vc = new WireGrid();
	vc.init();
	return vc;
};
