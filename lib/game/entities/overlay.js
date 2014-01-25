ig.module(
    'game.entities.overlay'
)
.requires(
    'impact.entity'
)

.defines(function(){

EntityOverlay = ig.Entity.extend({
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 150, y: 150},

    bgColor: 'rgba(0,0,0,0.5)',

    init: function(x, y, settings) {
        this.parent(x, y, settings);
        this.size.x = ig.system.width - 200;
        this.size.y = ig.system.height - 200;
        this.pos.x = ig.system.width / 2 - this.size.x / 2;
        this.pos.y = ig.system.height / 2 - this.size.y / 2;
        this.ctx = ig.game.ctx;
    },
    
    update: function() {
        
    },

    

    draw: function() {
        this.ctx.save();
        this.ctx.fillStyle = this.bgColor;
        this.ctx.fillRect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        this.ctx.restore();
    }

});
});