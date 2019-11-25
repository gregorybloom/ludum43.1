// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["GAMECONTROL"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


if (typeof require === "function") {
	console.log("FUCK");
	var $ = jQuery = require('jquery'); // as node_modules
}

GAMECONTROL={
	keyState: {},
	keyTime: {},
	keyUpTime: {},
	keyIDs: {},
	mousePos: {},
	mouseBState: {}
};

GAMECONTROL.init = function()
{
	this.keyIDs['KEY_DELETE'] = 8;
	this.keyIDs['KEY_RETURN'] = 13;

	this.keyIDs['KEY_SHIFT'] = 16;
	this.keyIDs['KEY_CONTROL'] = 17;
	this.keyIDs['KEY_OPTION'] = 18;

	this.keyIDs['KEY_ESCAPE'] = 27;
	this.keyIDs['KEY_SPACEBAR'] = 32;

	this.keyIDs['KEY_ARROW_LEFT'] = 37;
	this.keyIDs['KEY_ARROW_UP'] = 38;
	this.keyIDs['KEY_ARROW_RIGHT'] = 39;
	this.keyIDs['KEY_ARROW_DOWN'] = 40;

	this.keyIDs['KEY_0'] = 48;
	this.keyIDs['KEY_1'] = 49;
	this.keyIDs['KEY_2'] = 50;
	this.keyIDs['KEY_3'] = 51;
	this.keyIDs['KEY_4'] = 52;
	this.keyIDs['KEY_5'] = 53;
	this.keyIDs['KEY_6'] = 54;
	this.keyIDs['KEY_7'] = 55;
	this.keyIDs['KEY_8'] = 56;
	this.keyIDs['KEY_9'] = 57;

	this.keyIDs['KEY_TILDE'] = 192;
	this.keyIDs['KEY_DASH'] = 189;
	this.keyIDs['KEY_EQUALS'] = 187;


	this.keyIDs['KEY_W'] = 87;
	this.keyIDs['KEY_A'] = 65;
	this.keyIDs['KEY_S'] = 83;
	this.keyIDs['KEY_D'] = 68;


	this.keyIDs['KEY_Q'] = 81;
//	this.keyIDs['KEY_W'] = 87;
	this.keyIDs['KEY_E'] = 69;
	this.keyIDs['KEY_R'] = 82;
	this.keyIDs['KEY_T'] = 84;
	this.keyIDs['KEY_Y'] = 89;

	this.keyIDs['KEY_U'] = 85;
	this.keyIDs['KEY_I'] = 73;
	this.keyIDs['KEY_O'] = 79;
	this.keyIDs['KEY_P'] = 80;

	this.keyIDs['KEY_BACKSLASH'] = 220;

	this.keyIDs['KEY_SQUAREBR_LEFT'] = 219;
	this.keyIDs['KEY_SQUAREBR_RIGHT'] = 221;

	this.keyIDs['KEY_F'] = 70;
	this.keyIDs['KEY_G'] = 71;
	this.keyIDs['KEY_H'] = 72;
	this.keyIDs['KEY_J'] = 74;
	this.keyIDs['KEY_K'] = 75;
	this.keyIDs['KEY_L'] = 76;

	this.keyIDs['KEY_SEMICOLON'] = 186;
	this.keyIDs['KEY_APOSTROPHE'] = 222;

	this.keyIDs['KEY_Z'] = 90;
	this.keyIDs['KEY_X'] = 88;
	this.keyIDs['KEY_C'] = 67;
	this.keyIDs['KEY_V'] = 86;
	this.keyIDs['KEY_B'] = 66;

	this.keyIDs['KEY_N'] = 78;
	this.keyIDs['KEY_M'] = 77;

	this.keyIDs['KEY_COMMA'] = 188;
	this.keyIDs['KEY_PERIOD'] = 190;
	this.keyIDs['KEY_SLASH'] = 191;







	return true;
};

GAMECONTROL.getMousePos = function(canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    var pos = {
        x: evt.clientX - rect.left,
        y: evt.clientY - rect.top
    };
	pos.x = Math.floor(Math.max(pos.x,0));
	pos.y = Math.floor(Math.max(pos.y,0));
	pos.x = Math.min(pos.x,canvas.width);
	pos.y = Math.min(pos.y,canvas.height);
    return pos;
};

GAMECONTROL.onMouseMove = function(e)
{
	var topCanvasName = "div#renderarea canvas.top";
	var topCanvas = $(topCanvasName).get(0);
	var pos = GAMECONTROL.getMousePos(topCanvas, e);

	GAMECONTROL.mousePos.x = pos.x;
	GAMECONTROL.mousePos.y = pos.y;

	var inobj = {};
	inobj.buttonID = -1;
	inobj.move = true;

//	var used = GAMEMODEL.distributeInput(inobj);

};
GAMECONTROL.onMouseDown = function(e)
{
	var topCanvasName = "div#renderarea canvas.top";
	var topCanvas = $(topCanvasName).get(0);
	var pos = GAMECONTROL.getMousePos(topCanvas, e);

	GAMECONTROL.mousePos.x = pos.x;
	GAMECONTROL.mousePos.y = pos.y;

	var inobj = {};
	inobj.buttonID = 1;
	inobj.bpress = true;
	inobj.pos = {x:pos.x,y:pos.y};

	var used = GAMEMODEL.distributeInput(inobj);

};
GAMECONTROL.onMouseUp = function(e)
{
	var topCanvasName = "div#renderarea canvas.top";
	var topCanvas = $(topCanvasName).get(0);
	var pos = GAMECONTROL.getMousePos(topCanvas, e);

	GAMECONTROL.mousePos.x = pos.x;
	GAMECONTROL.mousePos.y = pos.y;

	var inobj = {};
	inobj.buttonID = 1;
	inobj.bpress = false;
	inobj.pos = {x:pos.x,y:pos.y};

	var used = GAMEMODEL.distributeInput(inobj);

};
GAMECONTROL.onMouseClick = function(e)
{

};
GAMECONTROL.onMouseDoubleClick = function(e)
{

};


GAMECONTROL.onKeyUp = function(e)
{
	var KeyID = (window.event) ? event.keyCode : e.keyCode;
	GAMECONTROL.setKeyState(KeyID, false);

	var inobj = {};
	inobj.keyID = KeyID;
	inobj.keypress = false;

	var used = GAMEMODEL.distributeInput(inobj);

	if(used) {
		e.preventDefault();
	}
	else {
		var found=false;
		for(var i in GAMECONTROL.keyIDs) {
			if(GAMECONTROL.keyIDs[i] == KeyID)	found=true;
		}
		if(!found)			console.log(KeyID);
	}
};
GAMECONTROL.onKeyDown = function(e)
{
	var KeyID = (window.event) ? event.keyCode : e.keyCode;
	GAMECONTROL.setKeyState(KeyID, true);

	var inobj = {};
	inobj.keyID = KeyID;
	inobj.keypress = true;


	var used = GAMEMODEL.distributeInput(inobj);


	if(used)	e.preventDefault();
};


GAMECONTROL.setKeyState = function(id, press)
{
	if(press)
	{
		this.keyTime[id] = GAMEMODEL.getTime();
		this.keyState[id] = true;
		delete this.keyUpTime[id];
	}
	else
	{
		delete this.keyTime[id];
		delete this.keyState[id];
		this.keyUpTime[id] = GAMEMODEL.getTime();
	}
//	console.log(id + "_"+this.keyState[id]);
};
GAMECONTROL.getKeyState = function(id)
{
	if(typeof this.keyState[id] === "undefined")	return false;
	else if(this.keyState[id] == null)				return false;
	else
	{
		return this.keyState[id];
	}
};
GAMECONTROL.getKeyTime = function(id)
{
	if(typeof this.keyState[id] === "undefined")	return false;
	else if(this.keyState[id] == null)				return false;
	else
	{
		var time = GAMEMODEL.getTime() - this.keyTime[id];
		return time;
	}
};
GAMECONTROL.getKeyUpTime = function(id)
{
	if(typeof this.keyUpTime[id] === "undefined")	return 10000;
	else if(this.keyUpTime[id] == null)				return 10000;
	else
	{
		var time = GAMEMODEL.getTime() - this.keyUpTime[id];
		return time;
	}
};


exports.GAMECONTROL = GAMECONTROL;
exports.GAMECONTROL._loadJSEngineClasses = _loadJSEngineClasses;
