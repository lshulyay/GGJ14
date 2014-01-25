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

    grindSound: new ig.Sound( 'media/audio/grindSound.*', false ),

    animSheet: new ig.AnimationSheet( 'media/meatcounter.png', 100, 100 ),
    hudFrame: new ig.Image( 'media/hudframe.png'),

    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.anims.idle = new ig.Animation( this.animSheet, 0.5, [0], false );
        this.anims.process = new ig.Animation( this.animSheet, 0.06, [0,1,2,3,4,5,6,7,6,5,4,3,2,1], false );

        this.currentAnim = this.anims.idle;
        ig.game.sortEntitiesDeferred();
    },
    
    update: function() {
        this.parent();
        if( this.currentAnim === this.anims.process && this.currentAnim.loopCount > 3 ) {
            console.log('idle!');
            this.currentAnim = this.anims.idle;
            this.grindSound.stop();
        }

    },

    draw: function(reallyDraw) {
        if (reallyDraw) {
           this.drawEnergyBar();


            this.parent();
            ig.game.ctx.save();
            ig.game.ctx.font = '30px Verdana';
            ig.game.ctx.fillStyle = '#ff0000';
            ig.game.ctx.textAlign = 'center';
            ig.game.ctx.textBaseline = 'middle';
            var x = 110;
            var y = 73;
            ig.game.ctx.fillText(ig.game.sheepProcessed, x, y);
            ig.game.ctx.restore();
        }       
    },

    drawEnergyBar: function() {
        ig.game.ctx.save();
        var x = 110;
        var y = 10;
        ig.game.ctx.fillStyle = '#540a0e';
        var width = 135 * ig.game.player.energy / 100

        ig.game.ctx.fillRect(x, y, width, 30);
        this.hudFrame.draw(this.pos.x, this.pos.y);

        ig.game.ctx.font = '17px verdana';
        ig.game.ctx.textAlign = 'left';
        ig.game.ctx.textBaseline = 'top';
        x += 135 / 2 + 20;
        y -= 12;

        ig.game.ctx.textAlign = 'center';
        ig.game.ctx.fillText(ig.game.player.energy, x, y);
        ig.game.ctx.restore();    
    }

});
});