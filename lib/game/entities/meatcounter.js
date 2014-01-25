ig.module(
    'game.entities.meatcounter'
)
.requires(
    'impact.entity'
)

.defines(function(){

EntityMeatcounter = ig.Entity.extend({
    collides: ig.Entity.COLLIDES.NEVER,
    size: {x:100, y:100},
    zIndex: 500,

    animSheet: new ig.AnimationSheet( 'media/meatcounter.png', 100, 100 ),


    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.anims.idle = new ig.Animation( this.animSheet, 0.5, [0], false );
        this.anims.process = new ig.Animation( this.animSheet, 0.06, [0,1,2,1], false );

        this.currentAnim = this.anims.idle;
        ig.game.sortEntitiesDeferred();
    },
    
    update: function() {
        this.parent();
        if( this.currentAnim === this.anims.process && this.currentAnim.loopCount > 3 ) {
            console.log('idle!');
            this.currentAnim = this.anims.idle;
        }
    },


    draw: function(reallyDraw) {
        if (reallyDraw) {
            this.parent();
            ig.game.ctx.save();
            ig.game.ctx.font = '30px Verdana';
            ig.game.ctx.fillStyle = '#ff0000';
            ig.game.ctx.textAlign = 'center';
            ig.game.ctx.textBaseline = 'middle';
            ig.game.ctx.fillText(ig.game.sheepProcessed, this.pos.x + this.size.x / 2 + 25, this.pos.y + this.size.y / 2 - 25);
            ig.game.ctx.restore();
        }       
    }

});
});