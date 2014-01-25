ig.module(
    'game.entities.corral'
)
.requires(
    'impact.entity'
)

.defines(function(){

EntityCorral = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.B,
    size: {x:150, y:150},

    animSheet: new ig.AnimationSheet( 'media/corral.png', 150, 150 ),


    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.anims.idle = new ig.Animation( this.animSheet, 0, [0], true );
        this.currentAnim = this.anims.idle;
    },
    
    update: function() {
        
    },

    check: function( other ) {
        if (other instanceof EntitySheep) {
            other.trapped = true;
            other.speed = other.minSpeed;
        }
    },

    draw: function() {
        this.parent();
     
    },

});
});