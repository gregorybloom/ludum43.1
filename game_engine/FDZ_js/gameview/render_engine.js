// CommonJS ClassLoader Hack
var classLoadList = [];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, ["RenderEngine"], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



function RenderEngine() {
}
RenderEngine.prototype.identity = function() {
	return ('RenderEngine (?)');
};

RenderEngine.prototype.init = function() {
	this.gl;

//	this.sizeW = 1000;
//	this.sizeH = 1000;

//        this.drawSize = true;
};

RenderEngine.prototype.clear = function() {

};
RenderEngine.prototype.start = function() {


    var canvas = document.getElementById("render");

    // Initialize the GL context
    this.gl = this.initWebGL(canvas);

    // Only continue if WebGL is available and working

    if (this.gl) {
        // Set clear color to black, fully opaque
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        // Enable depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        // Near things obscure far things
        this.gl.depthFunc(this.gl.LEQUAL);
        // Clear the color as well as the depth buffer.
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    }


};
RenderEngine.prototype.initWebGL = function(canvas) {
    this.gl = null;

    try {
        // Try to grab the standard context. If it fails, fallback to experimental.
        this.gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    }
    catch(e) {}

    // If we don't have a GL context, give up now
    if (!this.gl) {
        alert("Unable to initialize WebGL. Your browser may not support it.");
        this.gl = null;
    }

    return this.gl;
}



RenderEngine.alloc = function() {
	var vc = new RenderEngine();
	vc.init();
	return vc;
}

exports.RenderEngine = RenderEngine;
exports.RenderEngine._loadJSEngineClasses = _loadJSEngineClasses;
