ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

//	'impact.debug.debug',

	'game.levels.main',
	'game.levels.title',
	'game.levels.gameover',

	'game.entities.player',
	'game.entities.sheep',
	'game.entities.wolf',
	'game.entities.corral',
	'game.entities.conveyor',
	'game.entities.meatcounter',

	'game.misc.controller'


)
.defines(function(){

ggj14 = ig.Game.extend({
	
	// Load a font
	currentLevel: null,
	controller: new ig.Controller(),
	clearColor: 'green',

	// Score and stuff
	sheepEaten: 0,
	sheepProcessed: 0,

	wolfSpawnTimer: new ig.Timer(),
	wolfSpawnMin: 15,
	wolfSpawnMax: 35,

	sheepSpawnTimer: new ig.Timer(),
	sheepSpawnMin: 10,
	sheepSpawnMax: 25,

	// Font definitions
	mainhudFont: '25px Verdana',

	// Notifications
	notificationTimer: null,
	notification: {text: null, color: '#fff'},
	tipsArr: [
		"TIP: New sheep will be afraid to come if they see a wolf in their midst!",
		"TIP: You get points for getting sheep onto the meat processing line.",
		"TIP: Press C to toggle between sheep and wolf mode!",
		"TIP: Press SPACE to attack a sheep and eat it while in wolf mode!",
		"TIP: Careful! You need to eat sheep to keep your energy up.",
		"TIP: Watch out - wild wolves may eat you while you're in sheep mode"
	],

	// Some audio
	introThemeMusic: new ig.Sound( 'media/audio/introthememusic.*', false ),
	mainThemeMusic: new ig.Sound( 'media/audio/thememusic.*', false ),

	// Sheep audio
	sheepSoundsArr: [
		new ig.Sound( 'media/audio/sheepsounds/sheep-call-1.*', false ),
		new ig.Sound( 'media/audio/sheepsounds/sheep-call-2.*', false ),
		new ig.Sound( 'media/audio/sheepsounds/sheep-call-3.*', false )
	],

	sheepSplatSoundsArr: [
	    new ig.Sound( 'media/audio/sheepsounds/splat1.*', false ),
	    new ig.Sound( 'media/audio/sheepsounds/splat2.*', false ),
	],


	init: function() {
		// Key bindings
		ig.input.bind( ig.KEY.MOUSE1, 'click' );
		ig.input.bind( ig.KEY.RIGHT_ARROW, 'right' );
		ig.input.bind( ig.KEY.LEFT_ARROW, 'left' );
		ig.input.bind( ig.KEY.UP_ARROW, 'up');
		ig.input.bind( ig.KEY.DOWN_ARROW, 'down');
		ig.input.bind( ig.KEY.D, 'right' );
		ig.input.bind( ig.KEY.A, 'left' );
		ig.input.bind( ig.KEY.W, 'up');
		ig.input.bind( ig.KEY.S, 'down');
		ig.input.bind( ig.KEY.SPACE, 'space' );
		ig.input.bind( ig.KEY.C, 'c' );
		ig.input.bind( ig.KEY.ENTER, 'enter' );

		// Add music
		ig.music.add( this.introThemeMusic, 'introThemeMusic' );
		ig.music.add( this.mainThemeMusic, 'mainThemeMusic' );
		ig.music.loop = true;
		ig.music.volume = 0.4;

		this.ctx = ig.system.context;
		this.loadLevel(LevelTitle);
	},

	loadLevel: function(data) {
		this.currentLevel = data;
		this.parent(data);

		switch (this.currentLevel) {
			case LevelTitle:
				ig.music.play('introThemeMusic');
				this.sheepEaten = 0;
				this.sheepProcessed = 0;
				break;

			case LevelMain:
				ig.music.play('mainThemeMusic');
				this.showRandomTip();
				this.spawnEntity(EntityMeatcounter, 0, 0);
				this.spawnEntity(EntityPlayer, ig.system.width / 2, ig.system.height / 2);
				this.spawnEntity(EntityConveyor, 0, 0);
				for (var i = 0; i < 10; i++) {
					this.spawnSheep();
				}
				this.setSheepSpawnTimer();
				this.setWolfSpawnTimer();
				break;
		}
	},

	showRandomTip: function() {
		var array = this.controller.shuffleArray(this.tipsArr);
		var tip = array[0];
		this.setNotification(tip, 'tip');
	},

	spawnSheep: function() {
		var sheepX = this.controller.randomFromTo(200, ig.system.width - 50);
		var sheepY = this.controller.randomFromTo(50, ig.system.height - 50);
		this.spawnEntity(EntitySheep, sheepX, sheepY);	
	},

	spawnWolf: function() {
		var wolfCount = this.getEntitiesByType(EntityWolf).length;
		this.setWolfSpawnTimer();
		if (wolfCount === 0) {
			var direction = this.controller.randomFromTo(1,4);
			var x;
			var y;
			switch (direction) {
				// Left
				case 1:
					x = 0;
					y = this.controller.randomFromTo(0, ig.system.height);
					break;
				// Right
				case 2:
					x = ig.system.width;
					y = this.controller.randomFromTo(0, ig.system.height);
					break;
				// Top
				case 3:
					x = this.controller.randomFromTo(0, ig.system.width);
					y = 0;
					break;
				case 4:
					x = this.controller.randomFromTo(0, ig.system.widht);
					y = ig.system.height;
			}
			this.spawnEntity(EntityWolf, x, y);	
		}
	},

	setNotification: function(text, kind) {
		var color = '#fff';
		switch (kind) {
			case 'warning':
				color = '#ff0000';
				break;
			case 'tip':
				color = '#7fcada';
				break;
		}
		this.notificationTimer = new ig.Timer(5);
		this.notification.text = text;
		this.notification.color = color;
	},
	
	setWolfSpawnTimer: function() {
		var allSheepCount = this.getEntitiesByType(EntitySheep).length;
		if (allSheepCount > 0) {
			var rand = this.controller.randomFromTo(90 / allSheepCount, 140 / allSheepCount);
		}
		else {
			var rand = 45;
		}
		this.wolfSpawnTimer.set(rand);
		this.wolfSpawnTimer.reset();
	},

	setSheepSpawnTimer: function() {
		var allSheepCount = this.getEntitiesByType(EntitySheep).length;
		var rand = this.controller.randomFromTo(allSheepCount, allSheepCount + 10);
		if (!this.player.isSheep) {
			rand *= 2;
		}
		this.sheepSpawnTimer.set(rand);
		this.sheepSpawnTimer.reset();
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		if (this.currentLevel === LevelMain) {
			if (this.wolfSpawnTimer.delta() > 0) {
				this.spawnWolf();
			}
			if (this.sheepSpawnTimer.delta() > 0) {
				this.setSheepSpawnTimer();
				this.spawnSheep();
			}
		}
		else if (this.currentLevel === LevelTitle) {
			if (ig.input.pressed('enter')) {
				this.loadLevel(LevelMain);
			}
		}

		else if (this.currentLevel === LevelGameover) {
			if (ig.input.pressed('enter')) {
				this.loadLevel(LevelTitle);
			}
		}
	},
	
	draw: function() {
		this.parent();
		switch (this.currentLevel) {
			case LevelMain:
				this.drawNotification();
				this.getEntitiesByType(EntityMeatcounter)[0].draw(true);
				break;
			case LevelGameover:
				this.ctx.save();
				this.drawEndStats();
				this.ctx.restore();
				break;
		}
	},

	drawEndStats: function() {
		this.ctx.textBaseline = 'middle';
		this.ctx.font = 'bold 50px Verdana';
		this.ctx.textAlign = 'center';
		this.ctx.fillStyle = '#000';
		var x = ig.system.width / 2;
		var y = ig.system.height / 2 + 50;
		this.ctx.fillText('SHEEP PROCESSED: ' + this.sheepProcessed, x, y);	
	},

	drawNotification: function() {
		if (this.notificationTimer && this.notificationTimer.delta() < 0) {
			this.ctx.save();
			this.ctx.font = '30px Verdana';
			this.ctx.fillStyle = this.notification.color;
			this.ctx.textAlign = 'center';
			var x = ig.system.width / 2;
			var y = ig.system.height - 30;
			this.ctx.fillText(this.notification.text, x, y);
			this.ctx.restore();
		}
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', ggj14, 60, 1200, 770, 1 );

});
