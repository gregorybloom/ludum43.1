// CommonJS ClassLoader Hack
var classLoadList = ["GameResources"];
if(typeof GameEngine === "undefined")     var GameEngine = module.parent.exports;     // Direct Load
function _loadJSEngineClasses(opts) {
	var classes = GameEngine.loadJS( __dirname, [], opts, classLoadList );
	for(var i in classes) {if(eval("typeof "+i+" === 'undefined'")) {eval(""+i+" = classes[i];");}};
} _loadJSEngineClasses({"mode":"loadneeds"});


GameResources.classList =
[
      //    Start UpItems
      [
				{'name':'BufferLoad',     'path':   'core/loaders/buffer_load.js',      'needs':[],          'uses':[],          },
				{'name':'ContentLoader',     'path':   'core/content_loader.js',      'needs':[],          'uses':[],          },
				{'name':'AssetLoader',     'path':   'core/loaders/asset_loader.js',      'needs':["ContentLoader"],          'uses':[],          },
				{'name':'FileLoader',     'path':   'core/loaders/file_loader.js',      'needs':["ContentLoader"],          'uses':[],          },
      ],

      //    Core Game Engine Components
      [
        {'name':'GAMEGEOM',       'path':   'FDZ_js/game_geometrics.js',     'needs':[],          'uses':[],          },
        {'name':'GAMECONTROL',    'path':   'FDZ_js/game_control.js',        'needs':[],          'uses':[],          },
        {'name':'GAMESOUNDS',     'path':   'FDZ_js/game_sounds.js',         'needs':[],          'uses':["BufferLoad"],          },
        {'name':'GAMEMUSIC',      'path':   'FDZ_js/game_music.js',          'needs':[],          'uses':[],          },
        {'name':'GAMEVIEW',       'path':   'FDZ_js/game_view.js',           'needs':[],          'uses':["GameCamera"],          },
        {'name':'GAMEANIMATIONS', 'path':   'FDZ_js/game_animations.js',     'needs':[],          'uses':[],          },
        {'name':'GAMEMODEL',      'path':   'FDZ_js/game_model.js',          'needs':[],          'uses':["Actor","SessionActor","GameCamera","GameClock","ScreenManager"],          },
      ],

      //    Secondary Game Engine Components
      [
        {'name':'GAMELOADER',       'path':   'FDZ_js/game_loader.js',         'needs':[],          'uses':[],          },
        {'name':'RenderEngine',     'path':   'FDZ_js/gameview/render_engine.js',       'needs':[],          'uses':[],          },
      ],

      //    Base Engine Components
      [
        {'name':'TimerObj',       'path':   'FDZ_js/actors/timer.js',       'needs':[],          'uses':[],          },
        {'name':'Actor',          'path':   'FDZ_js/actors/actor.js',       'needs':[],          'uses':[],          },
      ],

      [
        {'name':'GameCamera',       'path':  'FDZ_js/gamedisplay/gamecamera.js',     'needs':["Actor"],          'uses':[],          },
        {'name':'ScreenManager',    'path':  'FDZ_js/gamedisplay/screen_manager.js',     'needs':["Actor"],          'uses':["GameCamera"],          },
        {'name':'ViewScreen',       'path':  'FDZ_js/gamedisplay/view_screen.js',     'needs':["Actor"],          'uses':[],          },
      ],

			[
        {'name':'MenuActor',       'path':  'FDZ_js/gamedisplay/screens/menuactor.js',     'needs':["Actor"],          'uses':[],          },
				{'name':'MenuItemActor',       'path':  'FDZ_js/gamedisplay/screens/menuitemactor.js',     'needs':["Actor"],          'uses':[],          },
      ],

      [
        {'name':'GameClock',       'path':  'FDZ_js/gamemodel/gameclock.js',       'needs':[],          'uses':[],          },
        {'name':'AreaActor',       'path':  'FDZ_js/gamemodel/areaactor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'SessionActor',    'path':  'FDZ_js/gamemodel/session_actor.js',     'needs':["Actor"],          'uses':["WorldActor","GameCamera","GameClock"],          },
        {'name':'WorldActor',      'path':  'FDZ_js/gamemodel/world_actor.js',     'needs':["Actor"],          'uses':[],          },
      ],

      [
        {'nameset':['ImageFrame','ImageFrameSet'],
                                  'path':  'FDZ_js/graphics/imgframe.js',     'needs':[],          'uses':[],          },
        {'nameset':['AnimationFrame,AnimationSequence,AnimationCollection'],
                                  'path':  'FDZ_js/graphics/animframe.js',     'needs':[],          'uses':[],          },
      ],

      [
        {'name':'ShapeObject',       'path':  'FDZ_js/module/shapes/shapeobj.js',       'needs':[],          'uses':[],          },
        {'name':'CircleShape',       'path':  'FDZ_js/module/shapes/circleshape.js',       'needs':["ShapeObject"],      'uses':[],          },
				{'name':'BoxShape',     		  'path':  'FDZ_js/module/shapes/boxshape.js',       'needs':["ShapeObject"],      'uses':[],          },
				{'name':'SegmentShape',       'path':  'FDZ_js/module/shapes/segmentshape.js',       'needs':["ShapeObject"],      'uses':[],          },
      ],

      [
        {'name':'ActionObject',       'path':  'FDZ_js/module/actions/actionobj.js',       'needs':[],          'uses':[],          },
        {'name':'ActionList',       'path':  'FDZ_js/module/actions/actionlist.js',       'needs':[],      'uses':[],          },
      ],

      [
        {'name':'ActionModule',       'path':  'FDZ_js/module/actionmodule.js',       'needs':[],          'uses':[],          },
        {'name':'StepModule',       'path':  'FDZ_js/module/stepmodule.js',       'needs':[],          'uses':[],          },
        {'name':'AnimationModule',       'path':  'FDZ_js/module/animationmodule.js',       'needs':[],          'uses':[],          },
        {'name':'CollisionModule',       'path':  'FDZ_js/module/collisionmodule.js',       'needs':[],          'uses':[],          },
        {'name':'MotionModule',       'path':  'FDZ_js/module/motionmodule.js',       'needs':["ActionModule"],          'uses':[],          },
      ],

      [
        {'name':'MoveActorComponent',       'path':  'FDZ_js/module/movescripts/movecomponent.js',       'needs':[],          'uses':[],          },
        {'name':'MoveActorBasicPath',       'path':  'FDZ_js/module/movescripts/basicpath.js',       'needs':["MoveActorComponent"],          'uses':[],          },
        {'name':'MoveActorBasicProgress',       'path':  'FDZ_js/module/movescripts/basicprogress.js',       'needs':["MoveActorComponent"],          'uses':[],          },
      ],

      [
        {'name':'MoveActor',       'path':  'FDZ_js/module/movescripts/moveactor.js',       'needs':["ActionObject"],          'uses':[],          },
        {'nameset':['MoveActorDuration','DurationByTime','DurationByDistance'],
                                  'path':  'FDZ_js/module/movescripts/durations.js',     'needs':["MoveActorComponent"],          'uses':[],          },
        {'nameset':['MoveActorHeading','HeadingByVector'],
                                'path':  'FDZ_js/module/movescripts/headings.js',     'needs':["MoveActorComponent"],          'uses':[],          },
        {'nameset':['MoveActorIncrement','IncrementBySpeed'],
                                'path':  'FDZ_js/module/movescripts/increments.js',     'needs':["MoveActorComponent"],          'uses':[],          },
        {'nameset':['CubicBezierPath','QuadBezierPath','LinearPath'],
                                'path':  'FDZ_js/module/movescripts/paths.js',     'needs':["MoveActorBasicPath"],          'uses':[],          },
        {'name':'LinearProgress',       'path':  'FDZ_js/module/movescripts/progress.js',       'needs':["MoveActorBasicProgress"],          'uses':[],          },

      ],


      [
				{'name':'ExitActor',       'path':  'ex_jsN/actors/exitactor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'TextActor',       'path':  'ex_jsN/actors/textactor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'BlockActor',       'path':  'ex_jsN/actors/blockactor.js',       'needs':["Actor"],          'uses':[],          },
				{'name':'BoxShiftActor',       'path':  'ex_jsN/actors/boxshiftactor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'CharActor',       'path':  'ex_jsN/actors/charactor.js',       'needs':["Actor"],          'uses':["TimerObj","TeleportCircleActor","PlayerTeleportCircle","BlockActor","LaserBoxActor","SmokeActor","CollisionModule","CircleShape","BoxShape"],          },
        {'name':'CheckpointActor',       'path':  'ex_jsN/actors/checkpoint.js',       'needs':["Actor"],          'uses':["TimerObj"],          },
        {'name':'LaserBoxActor',       'path':  'ex_jsN/actors/laserbox.js',       'needs':["Actor"],          'uses':["LaserBeamActor"],          },
        {'name':'MirrorActor',       'path':  'ex_jsN/actors/mirroractor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'OrbActor',       'path':  'ex_jsN/actors/orbactor.js',       'needs':["Actor"],          'uses':["TimerObj","CharActor","CollisionModule","CircleShape"],          },
        {'name':'PathChainActor',       'path':  'ex_jsN/actors/pathchain.js',       'needs':["Actor"],          'uses':["TelPathActor"],          },
        {'name':'SwitchActor',       'path':  'ex_jsN/actors/switchactor.js',       'needs':["Actor"],          'uses':[],          },

//////////////////////////
				{'name':'BaseGrid',       'path':  'ex_jsN/gamemodel/basegrid.js',       'needs':["Actor"],          'uses':[],          },

      ],

      [
        {'name':'TeleportCircleActor',       'path':  'ex_jsN/actors/teleportcircle.js',       'needs':["Actor"],          'uses':["TimerObj","PathChainActor"],          },
        {'name':'PlayerTeleportCircle',       'path':  'ex_jsN/actors/playerteleportcircle.js',       'needs':["TeleportCircleActor"],          'uses':["Actor","TimerObj","TeleportRayActor","TeleMoveShadowActor","CharActor"],          },
        {'name':'EnemyTeleportCircle',       'path':  'ex_jsN/actors/enemyteleportcircle.js',       'needs':["TeleportCircleActor"],          'uses':["Actor","TeleportRayActor","TeleMoveShadowActor"],          },
      ],

      [
        {'name':'EffectActor',       'path':  'ex_jsN/effects/effectactor.js',       'needs':["Actor"],          'uses':["TimerObj"],          },
				{'name':'ColorPulseActor',       'path':  'ex_jsN/effects/colorpulseactor.js',       'needs':["Actor"],          'uses':["ColorPulseActor"],          },
        {'name':'SmokeActor',       'path':  'ex_jsN/effects/smokeactor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'StarFieldArea',       'path':  'ex_jsN/effects/starfield.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'TeleMoveLineActor',       'path':  'ex_jsN/effects/telemoveline.js',       'needs':["EffectActor"],          'uses':["TeleMoveShadowActor"],          },
        {'name':'TeleMoveShadowActor',       'path':  'ex_jsN/effects/telemoveshadow.js',       'needs':["EffectActor"],          'uses':[],          },
      ],

      [
        {'name':'EnemyActor',       'path':  'ex_jsN/enemies/enemyactor.js',       'needs':["Actor"],          'uses':["TimerObj","MotionModule"],          },
        {'name':'EnemyBlasterActor',       'path':  'ex_jsN/enemies/enemyblasteractor.js',       'needs':["EnemyActor"],          'uses':["TimerObj","Actor","LaserBeamActor","EnemyShotActor"],          },
        {'name':'EnemyCircleBlaster',       'path':  'ex_jsN/enemies/enemycircleblaster.js',       'needs':["EnemyBlasterActor"],          'uses':["CharActor","EnemyJumperActor",,"CollisionModule","CircleShape"],          },
        {'name':'EnemyDropActor',       'path':  'ex_jsN/enemies/enemydropactor.js',       'needs':["Actor"],          'uses':["TimerObj"],          },
        {'name':'EnemyJumperActor',       'path':  'ex_jsN/enemies/enemyjumperactor.js',       'needs':["EnemyBlasterActor"],          'uses':["TimerObj","Actor","CharActor","StepModule","BlockActor","LaserBoxActor","TeleportCircleActor","EnemyTeleportCircle",,"CollisionModule","CircleShape"],          },
        {'name':'EnemySquareBlaster',       'path':  'ex_jsN/enemies/enemysquareblaster.js',       'needs':["EnemyBlasterActor"],          'uses':["TimerObj","CharActor","EnemyJumperActor","CollisionModule","BoxShape"],          },
      ],


      [
				{'name':'RayActor',       'path':  'ex_jsN/rayactors/rayactor.js',       'needs':["Actor"],          'uses':["CollisionModule","SegmentShape","EnemyActor","LaserBeamActor"],          },
        {'name':'StepRayActor',       'path':  'ex_jsN/rayactors/stepray.js',       'needs':["Actor"],          'uses':["OrbActor","LaserBoxActor","SwitchActor","BlockActor","TelPathActor","EnemySquareBlaster","EnemyCircleBlaster","EnemyJumperActor"],          },
        {'name':'LaserBeamActor',       'path':  'ex_jsN/rayactors/laserbeam.js',       'needs':["RayActor"],          'uses':["EnemyActor","LaserBeamActor"],          },
        {'name':'TelPathActor',       'path':  'ex_jsN/rayactors/telepath.js',       'needs':["EffectActor"],          'uses':[],          },
        {'name':'TeleportRayActor',       'path':  'ex_jsN/rayactors/teleportray.js',       'needs':["Actor"],          'uses':["CharActor","TelPathActor","TeleMoveLineActor","EnemyCircleBlaster","EnemySquareBlaster","EnemyJumperActor","LaserBoxActor","MirrorActor","OrbActor","BlockActor","SwitchActor"],          },
      ],

      [
        {'name':'BasicShotActor',       'path':  'ex_jsN/shotactors/basicshotactor.js',       'needs':["Actor"],          'uses':[],          },
        {'name':'EnemyShotActor',       'path':  'ex_jsN/shotactors/enemyshotactor.js',       'needs':["BasicShotActor"],          'uses':["StepRayActor"],          },
      ],

      [
        {'name':'ACTOR_FACTORY',       'path':  'ex_jsN/gamemodel/actor_factory.js',       'needs':[],          'uses':["Actor"],          },
        {'name':'LEVELLOADER',       'path':  'ex_jsN/gamemodel/level_loader.js',       'needs':[],          'uses':["TextActor","OrbActor","EnemyDropActor","CheckpointActor","EnemyCircleBlaster","EnemySquareBlaster","EnemyJumperActor"],          },
        {'name':'CamField',       'path':  'ex_jsN/gamemodel/camfield.js',       'needs':["Actor"],          'uses':["CharActor","BasicShotActor","EnemyActor","CheckpointActor"],          },
        {'name':'DropperActor',       'path':  'ex_jsN/gamemodel/dropper.js',       'needs':["Actor"],          'uses':["TimerObj","EnemyActor"],          },
        {'name':'GameWorld',       'path':  'ex_jsN/gamemodel/gameworld.js',       'needs':["WorldActor"],          'uses':["Actor","LEVELLOADER","CharActor","DropperActor"],          },
      ],

      [
        {'name':'BEHAVIOR_BUILDER',       'path':  'ex_jsN/behavior_builder.js',       'needs':[],          'uses':[],          },
      ],

];
GameResources.codeList =
[
      [
        {'label':'ranseedloader',       'path':  'core/seedrandom.davidbau.2.4.0.min.js',       'needs':[],          'uses':[],          },
        {'label':'xxxxL0',               'path':  'ex_jsN/levels/level0.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxL1',               'path':  'ex_jsN/levels/level1.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxL2',               'path':  'ex_jsN/levels/level2.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxL3',               'path':  'ex_jsN/levels/level3.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxL4',               'path':  'ex_jsN/levels/level4.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxL5',               'path':  'ex_jsN/levels/level5.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },

				{'label':'xxxxALT1',               'path':  'ex_jsN/levels/level_alt1.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxALT2',               'path':  'ex_jsN/levels/level_alt2.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxALT3',               'path':  'ex_jsN/levels/level_alt3.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
//				{'label':'xxxxALT4',               'path':  'ex_jsN/levels/level_alt4.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },

				{'label':'xxxxALTSECRET_A',               'path':  'ex_jsN/levels/level_altsecretA.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxALTSECRET_B',               'path':  'ex_jsN/levels/level_altsecretB.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },

				{'label':'xxxxEndPath1',               'path':  'ex_jsN/levels/level_endpath1.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxEndPath2',               'path':  'ex_jsN/levels/level_endpath2.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxEndPath3',               'path':  'ex_jsN/levels/level_endpath3.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },

				{'label':'xxxxLT1',               'path':  'ex_jsN/levels/levelTest1.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },
				{'label':'xxxxLN',               'path':  'ex_jsN/levels/levelN.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },

				{'label':'xxxxEND',               'path':  'ex_jsN/levels/levelEnd.js',       'needs':[],                     'uses':["GameWorld","StarFieldArea","CharActor","CamField","DropperActor"],          },

        {'label':'xxxx2',               'path':  'ex_jsN/loadoverrides.js',       'needs':[],          'uses':["Actor","AnimationCollection"],          },
        {'label':'xxxx3',               'path':  'ex_jsN/gameoverrides.js',       'needs':['xxxx2'],          'uses':["GAMEVIEW","GAMEMODEL","GameWorld","Actor"],          },
      ],
];
GameResources.initCodeList =
[
      //    Start UpItems
      [
				{'label':'InitCode',     'path':   'core/codeblocks/game_initialize.js',      'needs':[],          'uses':[],          },
				{'label':'LoadUpCode',     'path':   'core/codeblocks/game_loadup.js',      'needs':['InitCode'],          'uses':[],          },
      ],

];
