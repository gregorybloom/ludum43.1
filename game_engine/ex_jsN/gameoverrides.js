// CommonJS ClassLoader Hack
var classLoadList = ["GAMEVIEW","GAMEMODEL","GameWorld","Actor"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports.FileLoader.fetchGameEngine();
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});



GameWorld.prototype.readInput = function(kInput) {
    var used = false;

    if(typeof kInput.buttonID !== "undefined") {
        return;
        for(var j in this.lists) {
            var actorList = this.lists[j];
            for(var i in actorList) {
                var actor = actorList[i];
//                if(actor instanceof LaserBoxActor)     actor.mouseClickAt(kInput);
            }
        }
    }
    return used;
};

GAMEVIEW.drawAll = function()
{
    for(var i in this.contextArr) {
        if( this.contextArr[i].drawnOn == true || i==0) {
            this.contextArr[i].context.clearRect(0,0,800,600);
            delete this.contextArr[i].drawnOn;
        }
    }

  GAMEMODEL.drawAll();

  var pauseContext = this.contextArr[2].context;
    if(GAMEMODEL.gameMode === "GAME_MUSICPAUSE")
    {
        pauseContext.fillStyle = "rgba(155,155,255,0.35)";
        pauseContext.fillRect( 0, 0, this.screen.w, this.screen.h );

        var ScreenPt = {x:10,y:555};
        var str = "MUSIC LOADING...";
        pauseContext.lineWidth = "3";
        pauseContext.strokeStyle = "#FFFFFF";
        pauseContext.font = "10pt Arial";
        pauseContext.strokeText(str,ScreenPt.x,ScreenPt.y);
        pauseContext.fillStyle = "#000000";
        pauseContext.fillText(str,ScreenPt.x,ScreenPt.y);
    }
    else if(GAMEMODEL.gameMode === "GAME_PAUSE")
    {
        pauseContext.fillStyle = "rgba(255,255,255,0.35)";
        pauseContext.fillRect( 0, 0, this.screen.w, this.screen.h );

        var ScreenPt = {x:10,y:555};
        var str = "GAME PAUSED";
        pauseContext.lineWidth = "3";
        pauseContext.strokeStyle = "#FFFFFF";
        pauseContext.font = "10pt Arial";
        pauseContext.strokeText(str,ScreenPt.x,ScreenPt.y);
        pauseContext.fillStyle = "#000000";
        pauseContext.fillText(str,ScreenPt.x,ScreenPt.y);
    }
    else if(GAMEMODEL.modelClock && GAMEMODEL.modelClock.timeRate != 1.0) {
      pauseContext.fillStyle = "rgba(0,0,255,0.05)";
      pauseContext.fillRect( 0, 0, this.screen.w, this.screen.h );
    }

/*
    var ScreenPt = {x:10,y:(GAMEVIEW.screen.h-20)};
    var str = "";
    if(GAMEMODEL.gameSession != null && GAMEMODEL.gameSession.gameWorld != null)
    {
      if(GAMEMODEL.gameSession.gameWorld.dropper instanceof DropperActor) {
//        str=Math.floor(GAMEMODEL.gameSession.gameWorld.dropper.progress/2)+" progress";
      }
    }
    this.context.lineWidth = "3";
    this.context.strokeStyle = "#FFFFFF";
    this.context.font = "10pt Arial";
    this.context.strokeText(str,ScreenPt.x,ScreenPt.y);
    this.context.fillStyle = "#000000";
    this.context.fillText(str,ScreenPt.x,ScreenPt.y);
/**/
};
GAMEMODEL.update = function() {
    if(GAMEMODEL.modelCamera != null && GAMEMODEL.modelCamera.target instanceof Actor) {
        GAMEMODEL.modelCamera.updatePosition( GAMEMODEL.modelCamera.target.position );
    }
};
GAMEMODEL.readInput = function(inputobj)
{
    if(GAMEMODEL.modelCamera != null)
    {
        var keyids = GAMECONTROL.keyIDs;

/*
        if(keyids['KEY_1'] == inputobj.keyID) {
          if(GAMEMODEL.gameSession.gameWorld.dropper instanceof Actor) {
            if(!inputobj.keypress)  LEVELLOADER.level0();
            if(!inputobj.keypress)  GAMEMODEL.gameSession.gameWorld.dropper.cutToProgress( 0, 1, 0 );
          }
        }
        if(keyids['KEY_3'] == inputobj.keyID) {
          if(GAMEMODEL.gameSession.gameWorld.dropper instanceof Actor) {
            if(!inputobj.keypress)  LEVELLOADER.level0();
            if(!inputobj.keypress)  GAMEMODEL.gameSession.gameWorld.dropper.cutToProgress( 100, 3, 0 );
          }
        }
/**/
        if(keyids['KEY_DASH'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMODEL.modelCamera.zoomOut();
        }
        if(keyids['KEY_EQUALS'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMODEL.modelCamera.zoomIn();
        }

        if(keyids['KEY_O'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMUSIC.toggleAudio();
        }
        if(keyids['KEY_N'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMUSIC.nextAudio();
        }
				if(keyids['KEY_5'] == inputobj.keyID)
        {
            keyused = true;
						if(!inputobj.keypress)      GAMEMODEL.goToLevel = "end";
        }
				if(keyids['KEY_7'] == inputobj.keyID)
        {
            keyused = true;
            if(!inputobj.keypress)      GAMEMODEL.goToLevel = "altsecretB";
        }
				if(keyids['KEY_8'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMODEL.goToLevel = "endpath1";
        }
				if(keyids['KEY_9'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMODEL.goToLevel = "endpath2";
        }
        if(keyids['KEY_R'] == inputobj.keyID)
        {
            keyused = true;
						// Restart key
            if(!inputobj.keypress)      GAMEMODEL.currentLevel = -1;
        }
				if(keyids['KEY_L'] == inputobj.keyID)
        {
            keyused = true;
//            if(!inputobj.keypress)      GAMEMODEL.gameSession.gameWorld.gamePlayer.health -= 1;
//						if(!inputobj.keypress)      GAMEMODEL.gameSession.gameWorld.gamePlayer.impact(1,1);
        }
        if(keyids['KEY_SQUAREBR_RIGHT'] == inputobj.keyID)
        {
            keyused = true;
            if(!inputobj.keypress)      GAMEMUSIC.volumeUp();
        }
        if(keyids['KEY_SQUAREBR_LEFT'] == inputobj.keyID)
        {
            keyused = true;
            if(!inputobj.keypress)      GAMEMUSIC.volumeDown();
        }
        if(keyids['KEY_M'] == inputobj.keyID)
        {
            keyused = true;
            if(!inputobj.keypress)
            {
                if(GAMEMUSIC.mute)    GAMEMUSIC.mute=false;
                else {
                    GAMEMUSIC.mute=true;
                }
            }
        }

        if(keyids['KEY_P'] == inputobj.keyID)
        {
            keyused = true;
            if(!inputobj.keypress)
            {
                GAMEMODEL.togglePause();

                if(GAMEMUSIC.musicOn)
                {
                    if(this.gameMode === "GAME_PAUSE" && GAMEMUSIC.playing)     GAMEMUSIC.pauseAudio();
                    else if(this.gameMode === "GAME_RUN" && !GAMEMUSIC.playing) GAMEMUSIC.pauseAudio();
                }

            }
        }
    }
};
GAMEMODEL.loadGame = function()
{

/*
      console.log(  GAMEGEOM.isPtBetweenAB({x:29,y:10}, {x:20,y:10}, {x:30,y:10})  );
      console.log(  GAMEGEOM.isPtBetweenAB({x:10,y:12}, {x:10,y:10}, {x:10,y:20})  );
      console.log(  GAMEGEOM.isPtBetweenAB({x:10,y:12}, {x:10,y:10}, {x:12,y:20})  );
      console.log(  GAMEGEOM.isPtBetweenAB({x:10,y:12}, {x:10,y:12}, {x:12,y:20})  );
      console.log(  GAMEGEOM.isPtBetweenAB({x:10,y:12}, {x:12,y:20}, {x:12,y:20})  );

      return;     /**/

    GAMEMODEL.activeObjs = 0;

    var GW = GameWorld.alloc();

    this.gameSession.gameWorldList[0]=GW;
    this.gameSession.gameWorld=GW;
    this.gameSession.gameWorld.clear();


    GW.load();
    GW.size = {w:800,h:600};
    GW.updatePosition({x:0,y:0});

    GAMEMODEL.modelCamera.updatePosition({x:0,y:0});



    console.log('loaded game');




    GAMEMUSIC.currSong=0;
    GAMEMUSIC.playAudio();
//	GAMEMUSIC.stopAudio();



//    var pt = GAMEGEOM.shortestDistanceToLineSegment(pt,s1,s2);



/*
  var audio_file = new Audio('sounds/music/Jeremy-20180323_01.mp3')
  audio_file.addEventListener('timeupdate', function(){
                  var buffer = .84
                  if(this.currentTime > this.duration - buffer){
                      this.currentTime = 0
                      this.play()
                  }}, false);
  audio_file.play();
/**/
};
