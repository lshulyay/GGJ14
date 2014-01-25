ig.module(
	'game.entities.wolf'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityWolf = ig.Entity.extend({
  //  type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.ACTIVE,


    size: {x: 32, y: 32},
    offset: {x: 7, y: 1},

    gravityFactor: 0,
    zIndex: 2,

    // Main stats
    lives: 3,
    energy: 50,
    
    // Graze toggle and movement
   
    idling: true,

    // Attack 
    viewDistance: 250,
    targetSheep: null,
    fed: false,


    // Angles
    angle: 0,
    targetAngle: 0,

    // Speeds
    speed: 300,
    maxSpeed: 170,
    minSpeed: 50,
    accelTurnSpeed: 250,

    // Other movement
    maxVel: {x: 300, y: 300},
    friction: {x: 500, y: 500},
    accelGround: 700,
    accelAir: 700,
    footstepsPlaying: false,
    trapped: false,
    
    wolfAnimSheet: new ig.AnimationSheet( 'media/wolf2.png', 56, 30 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.wolf = this;
        this.setAnimations();
        this.currentAnim = this.anims.idle;

        this.lockOnTarget();
   
    },

    update: function() {
        this.checkAngles();
        this.checkAnimations();
        if (this.fed) {
            ig.game.controller.killOffScreen(this);
        }


        if (this.targetSheep) {
            this.targetAngle = (this.angleTo(this.targetSheep)).toDeg();
        
        }

        else if (!this.fed) {
            this.lockOnTarget();
        }

        this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
        this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;

        if (ig.game.player.isSheep && this.distanceTo(ig.game.player) <= this.viewDistance) {
            this.targetSheep = ig.game.player;
            this.targetAngle = (this.angleTo(ig.game.player)).toDeg();
        }
        else if (this.targetSheep === ig.game.player && !ig.game.player.isSheep) {
            this.lockOnTarget();
        }
      
        this.parent();
    },

    lockOnTarget: function() {
        var allSheepArr = ig.game.getEntitiesByType(EntitySheep);
        allSheepArr.push(ig.game.player);
        allSheepArr = ig.game.controller.shuffleArray(allSheepArr);
        var rand = allSheepArr[0];
        if (rand.trapped) {
            this.lockOnTarget();
        }
        else {
            this.targetAngle = (this.angleTo(rand)).toDeg();
            this.targetSheep = rand;
        }
    },

    /******* ANGLE FUNCTIONS *******/

    pickRandTargetAngle: function() {
        this.targetAngle = ig.game.controller.randomFromTo(0,360);
    },
    
    checkAngles: function() {
    
        if (this.targetAngle < this.angle + 5 || this.targetAngle > this.angle - 5) {
            if (this.angle !== this.targetAngle) {
                this.angle = this.targetAngle;
            }
        }
        else {
            var diff = this.targetAngle - this.angle;
            if (diff < 0) {
                diff += 360;
            }

            if (diff > 180) {
                // turn left
                this.angle -= this.accelTurnSpeed * ig.system.tick;

            }
            else {
                // right turn
                this.angle += this.accelTurnSpeed * ig.system.tick;
            }
        }

        if (this.angle > 360) {
            this.angle = 0;
        }
        else if (this.angle < 0) {
            this.angle = 360;
        }
        this.currentAnim.angle = this.angle.toRad();
    },

    /******* END ANGLE FUNCTIONS *******/

    /******* DEATH FUNCTIONS *******/

   

    /******* END DEATH FUNCTIONS *******/

  
    /******* ANIMATION FUNCTIONS *******/
    setAnimations: function() {
        this.anims.idle = new ig.Animation( this.wolfAnimSheet, 0, [0], true );
        this.anims.walking = new ig.Animation( this.wolfAnimSheet, 0.1, [8,9,10,9] );
    },

    checkAnimations: function() {
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            if (this.currentAnim !== this.anims.walking) {
                this.currentAnim = this.anims.walking;
            }
        }
        else {
            if (this.currentAnim !== this.anims.idle) {
                this.currentAnim = this.anims.idle;
            }
        }
    },

    /******* END ANIMATION FUNCTIONS *******/


    /******* COLLISION FUNCTIONS *******/

    handleMovementTrace: function ( res ) {
        // This completely ignores the trace result (res) and always
        // moves the entity according to its velocity
        this.pos.x += this.vel.x * ig.system.tick;
        this.pos.y += this.vel.y * ig.system.tick;
    },


    collideWith: function( other, axis ) {
        if (other instanceof EntitySheep || other instanceof EntityPlayer && ig.game.player.isSheep) {
            if (!other.trapped) {
                this.fed = true;
                this.targetSheep = null;
                other.kill();
            }
        }
        this.parent();
    },

    /******* END COLLISION FUNCTIONS *******/

    draw: function() {
        // Draw detection circle
        if (this.distanceTo(ig.game.player) < this.viewDistance + 50) {
            ig.game.ctx.beginPath();
            ig.game.ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.viewDistance, 0, 2 * Math.PI, false);
         //   ig.game.ctx.fillStyle = '#fff';
         //   ig.game.ctx.fill();
            ig.game.ctx.lineWidth = 1;
            ig.game.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
            ig.game.ctx.stroke();
        }

        
        this.parent();
    /*    var x = 5;
        var y = ig.system.height;
        ig.game.ctx.save();
        ig.game.ctx.font = '20px verdana';
        ig.game.ctx.fillStyle = '#fff';
        ig.game.ctx.fillText('target angle: ' + this.targetAngle, x, y);
        ig.game.ctx.restore(); */
    }

});
});