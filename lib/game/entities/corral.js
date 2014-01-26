ig.module(
    'game.entities.corral'
)
.requires(
    'impact.entity'
)

.defines(function(){

EntityCorral = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.B,
    size: {x:90, y:150},

    animSheet: new ig.AnimationSheet( 'media/corral.png', 90, 150 ),

    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.anims.idle = new ig.Animation( this.animSheet, 0.3, [0,1,2], false );
        this.currentAnim = this.anims.idle;
    },
    
    update: function() {
        this.parent();
    },

    check: function( other ) {
        if (other instanceof EntitySheep) {
            if (!other.trapped) {
                var conveyor = ig.game.getEntitiesByType(EntityConveyor)[0];
                conveyor.onConveyorArr.push(other);
                ig.game.sheepProcessed++;
                ig.game.player.addEnergy(ig.game.player.corralEnergyBonus);
                var meatcounter = ig.game.getEntitiesByType(EntityMeatcounter)[0];
                meatcounter.currentAnim = meatcounter.anims.process.rewind();
                meatcounter.grindSound.play();
                ig.game.controller.checkSheepStats();
            }
            other.trapped = true;
            other.speed = other.minSpeed;
        }
    },

    draw: function() {
        this.parent();
    },

});
});