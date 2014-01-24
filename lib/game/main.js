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

	'game.misc.controller'


)
.defines(function(){

ggj14 = ig.Game.extend({
	
	// Load a font
	font: new ig.Font( 'media/04b03.font.png' ),
	currentLevel: null,
	controller: new ig.Controller(),
	clearColor: 'green',

	
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
				this.spawnEntity(EntityPlayer, ig.system.width / 2, ig.system.height / 2);

				var sheepX = this.controller.randomFromTo(50, ig.system.width - 50);
				var sheepY = this.controller.randomFromTo(50, ig.system.height - 50);
				this.spawnEntity(EntitySheep, sheepX, sheepY);
				break;
		}
	},
	
	update: function() {
		// Update all entities and backgroundMaps
		this.parent();
		
		// Add your own, additional update code here
	},
	
	draw: function() {
		// Draw all entities and backgroundMaps
		this.parent();
	}
});


// Start the Game with 60fps, a resolution of 320x240, scaled
// up by a factor of 2
ig.main( '#canvas', ggj14, 60, 1200, 770, 1 );

});
