// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["StepModule"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function StepModule() {
}

//StepModule.prototype = new ActionModule;
StepModule.prototype.identity = function() {
	return ('StepModule ()');
};
StepModule.prototype.init = function() {
	this.running = true;

	this.stepsTimer = TimerObj.alloc();
	this.stepsTimer.lifeTime = 0;
	this.stepsTimer.looping = false;

	this.stepStarted = false;
	this.steps = [];
	this.stepGroup = null;
	this.stepNum = -1;
	this.stepVals = {};

	this.stepStartFuncs = {};
	this.stepMidFuncs = {};
	this.stepEndFuncs = {};

};
StepModule.prototype.clear = function() {
	this.steps = null;
	this.stepVals = null;
};
StepModule.prototype.loadStep = function(name, data, dur) {
	this.steps.push({name:name,data:data,dur:dur});
};
StepModule.prototype.clearModuleStepList = function() {
	this.steps = [];
	this.stepVals = {};
};
StepModule.prototype.beginStepPath = function(name,num=0,resetSteps=true) {
	if(this.stepGroup == name)		return;
	this.stepGroup = name;
	this.stepNum = num;
	if(resetSteps) {
		this.steps = [];
		this.stepsTimer.stopTimer();
		this.stepsTimer.init();
		this.stepsTimer.startTimer();
		this.stepStarted = false;
	}
};
StepModule.prototype.saveStepFunctions = function(side, name, num, func) {
	if(side == "start") {
		if(typeof this.stepStartFuncs[name] === "undefined") 				this.stepStartFuncs[name] = {};
		this.stepStartFuncs[name][num] = func;
	}
	if(side == "mid") {
		if(typeof this.stepMidFuncs[name] === "undefined") 				this.stepMidFuncs[name] = {};
		this.stepMidFuncs[name][num] = func;
	}
	if(side == "end") {
		if(typeof this.stepEndFuncs[name] === "undefined") 				this.stepEndFuncs[name] = {};
		this.stepEndFuncs[name][num] = func;
	}
};
StepModule.prototype.fetchStepFunctions = function(side, name, num) {
	var stepgrouplist = null;
	if(side == "start")		stepgrouplist = this.stepStartFuncs;
	if(side == "mid")			stepgrouplist = this.stepMidFuncs;
	if(side == "end")			stepgrouplist = this.stepEndFuncs;
	if(stepgrouplist != null) {
		if(typeof stepgrouplist[name] === "undefined") {
			return null;
		}
		if(typeof stepgrouplist[name][num] === "undefined") {
			return null;
		}
		return stepgrouplist[name][num];
	}
	return null;
};
StepModule.prototype.saveStepVals = function(name, num, vals) {
	if(typeof this.stepVals[name] === "undefined") {
		this.stepVals[name] = {};
	}
	if(typeof this.stepVals[name][num] === "undefined") {
		this.stepVals[name][num] = {};
	}
	for(var i in vals) {
		this.stepVals[name][num][i] = vals[i];
	}
};
StepModule.prototype.fetchStepVals = function(name, num) {
	for(var i in this.stepVals) {
		if(i != this.stepGroup) {
			delete this.stepVals[i];
		}
	}
	if(typeof this.stepVals[name] === "undefined") {
		this.stepVals[name] = {};
	}
	if(typeof this.stepVals[name][num] === "undefined") {
		this.stepVals[name][num] = {};
	}
	return this.stepVals[name][num];
};
StepModule.prototype.startCurrentStep = function() {
//	console.log(this.stepNum, 'start');
	this.stepsTimer.startTimer();

	var stepvals = this.fetchStepVals(this.stepGroup,this.stepNum);
	this.beginStep(this.stepNum,this.stepGroup);

	var startfunction = this.fetchStepFunctions("start",this.stepGroup,this.stepNum);
//				console.log('s',this.stepGroup,this.stepNum,startfunction);
	if(startfunction != null)		startfunction.call(this,this.stepsTimer.cycledBy, this.stepNum,this.stepGroup,stepvals);
	this.stepStarted = true;
};
StepModule.prototype.endCurrentStep = function() {
//	console.log(this.stepNum, 'end');
	this.stepsTimer.stopTimer();

	var stepvals = this.fetchStepVals(this.stepGroup,this.stepNum);
	var endfunction = this.fetchStepFunctions("end",this.stepGroup,this.stepNum);
//				console.log('e',this.stepGroup,this.stepNum,endfunction);
	if(endfunction != null)		endfunction.call(this,this.stepsTimer.cycledBy, this.stepNum,this.stepGroup,stepvals);
	this.stepStarted = false;
};
StepModule.prototype.callCurrentStep = function() {
	var stepvals = this.fetchStepVals(this.stepGroup,this.stepNum);
	this.midStep( this.stepsTimer.cycledBy, this.stepNum,this.stepGroup, stepvals );

	var midfunction = this.fetchStepFunctions("mid",this.stepGroup,this.stepNum);
	if(midfunction != null)		midfunction.call(this,this.stepsTimer.cycledBy, this.stepNum,this.stepGroup,stepvals);
};
StepModule.prototype.checkStep = function() {
	var curtime = GAMEMODEL.getTime();

	var i=0;
	if(typeof this.steps === "undefined" || typeof this.steps[i] === "undefined")	return;

	var thisstep = this.steps[i];
		if(typeof thisstep.dur['time'] !== "undefined") {
			var c = this.stepsTimer.getCycle();
			var t = c.time;
			if(t	>= thisstep.dur.time) {

				this.endCurrentStep();
				this.stepNum+=1;

				this.startCurrentStep();
				this.steps.splice(i,1);
				return;
			}
			else if(!this.stepStarted) {
				this.startCurrentStep();
			}
		}
//	}
};

StepModule.prototype.midStep = function(timeplace,stepnum,stepname,stepvals) {
};
StepModule.prototype.beginStep = function(stepnum,stepname,stepdata) {

};
StepModule.prototype.update = function() {
	if(!this.running)			return;
	if(this.parent == null && this.target != null)		this.parent = this.target;

	if(!this.stepsTimer.running) {
		this.stepsTimer.startTimer();
	}
	this.stepsTimer.update();

	this.checkStep();
	this.callCurrentStep();
};

StepModule.alloc = function() {
	var vc = new StepModule();
	vc.init();
	return vc;
};


exports.StepModule = StepModule;
exports.StepModule._loadJSEngineClasses = _loadJSEngineClasses;
