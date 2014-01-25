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
            if (!other.trapped) {
                ig.game.sheepProcessed++;
                ig.game.player.addEnergy(ig.game.player.corralEnergyBonus);
                var meatcounter = ig.game.getEntitiesByType(EntityMeatcounter)[0];
                meatcounter.currentAnim = meatcounter.anims.process.rewind();
                meatcounter.grindSound.play();
            }
            other.trapped = true;
            other.speed = other.minSpeed;
        }
    },

    draw: function() {
        this.parent();
        if (!ig.global.wm) {
            ig.game.ctx.save();
            ig.game.ctx.textBaseline = 'middle';
            ig.game.ctx.font = '15px Verdana';
            ig.game.ctx.fillStyle = '#fff';
            ig.game.ctx.textAlign = 'center';
            ig.game.ctx.fillText('HERD SHEEP HERE', this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2);
            ig.game.ctx.restore();
        }
    },

});
});