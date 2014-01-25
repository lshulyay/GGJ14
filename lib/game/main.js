ig.module( 
	'game.main' 
)
.requires(
	'impact.game',
	'impact.font',

	'impact.debug.debug',

	'game.levels.main',

	'game.entities.player',
	'game.entities.sheep',
	'game.entities.wolf',
	'game.entities.corral',

//	'game.entities.overlay',

	'game.misc.controller'


)
.defines(function(){

ggj14 = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	currentLevel: null,
	controller: new ig.Controller(),
	clearColor: 'green',

	// Score and stuff
	sheepEaten: 0,

	wolfSpawnTimer: new ig.Timer(),
	wolfSpawnMin: 5,
	wolfSpawnMax: 10,

	state: 'startmenu',

	// Font definitions
	mainhudFont: '25px Verdana',
	
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
		ig.input.bind( ig.KEY.ESC, 'esc' );

		this.ctx = ig.system.context;

		this.loadLevel(LevelMain);
	},

	loadLevel: function(data) {
		this.currentLevel = data;
		this.parent(data);
		switch (this.currentLevel) {
			case LevelMain:
			//	this.setState('startmenu');
			//	this.spawnEntity(EntityOverlay, 0, 0);
				this.spawnEntity(EntityPlayer, ig.system.width / 2, ig.system.height / 2);
				for (var i = 0; i < 5; i++) {
					var sheepX = this.controller.randomFromTo(200, ig.system.width - 50);
					var sheepY = this.controller.randomFromTo(50, ig.system.height - 50);
					this.spawnEntity(EntitySheep, sheepX, sheepY);
				}
				this.setWolfSpawnTimer();
				break;
		}
	},

	setState: function(state) {
		switch (state) {
			case 'startmenu':
				break;
		}
	},
	
	setWolfSpawnTimer: function() {
		var rand = this.controller.randomFromTo(this.wolfSpawnMin, this.wolfSpawnMax);
		this.wolfSpawnTimer.set(rand);
		this.wolfSpawnTimer.reset();
	},

	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		if (this.currentLevel === LevelMain) {
			if (this.wolfSpawnTimer.delta() > 0) {
				this.setWolfSpawnTimer();
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
			//	var x = this.controller.randomFromTo(50, ig.system.width - 50);
			//	var y = this.controller.randomFromTo(50, ig.system.height - 50);
				this.spawnEntity(EntityWolf, x, y);
			}
		}
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		this.parent();
		this.drawHUD();
	},

	drawHUD: function() {
		var x = 5,
			y = 5;
		this.ctx.save();
		this.ctx.textBaseline = 'top';
		this.ctx.font = this.mainhudFont;
		this.ctx.fillStyle = '#fff';
		this.ctx.fillText('Sheep eaten: ' + this.sheepEaten, x, y);
		this.ctx.restore();
	}

});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', ggj14, 60, 1200, 770, 1 );

});
