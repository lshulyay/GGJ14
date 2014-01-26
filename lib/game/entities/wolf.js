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
    zIndex: 100,
    
   
    // Attack 
    viewDistance: 250,
    targetSheep: null,
    fed: false,

    // Angles
    angle: 0,
    targetAngle: 0,

    lifeTimer: new ig.Timer(10),

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
    trapped: false,

    // Sounds
    wolfHowlSound: new ig.Sound( 'media/audio/wildwolfentrance.*', false ),

    wolfAnimSheet: new ig.AnimationSheet( 'media/wolf-enemy.png', 56, 30 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.wolf = this;
        this.setAnimations();
        this.currentAnim = this.anims.idle;

        this.lockOnTarget();
        this.wolfHowlSound.play();

    },

    update: function() {
        this.checkAngles();
        this.checkAnimations();
        if (this.fed || this.lifeTimer.delta() > 0) {
            ig.game.controller.killOffScreen(this);
        }

        if (this.targetSheep) {
            if (this.targetSheep === ig.game.player && !ig.game.player.isSheep) {
                this.lockOnTarget();
            }
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
      
        this.parent();
    },

    lockOnTarget: function() {
        var allSheepArr = ig.game.getEntitiesByType(EntitySheep);
        if (ig.game.player.isSheep) {
            allSheepArr.push(ig.game.player);
        }
        if (allSheepArr.length > 1) {
            allSheepArr = ig.game.controller.shuffleArray(allSheepArr);
            var rand = allSheepArr[0];
            if (rand.trapped) {
                this.lockOnTarget();
            }
            else {
                this.targetAngle = (this.angleTo(rand)).toDeg();
                this.targetSheep = rand;
            }
        }
        else {
            this.fed = true;
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

     /*   if (this.angle > 360) {
            this.angle = 0;
        }
        else if (this.angle < 0) {
            this.angle = 360;
        } */
        this.currentAnim.angle = this.angle.toRad();
    },

    /******* END ANGLE FUNCTIONS *******/

    /******* DEATH FUNCTIONS *******/

   

    /******* END DEATH FUNCTIONS *******/

  
    /******* ANIMATION FUNCTIONS *******/
    setAnimations: function() {
        this.anims.idle = new ig.Animation( this.wolfAnimSheet, 0, [0], true );
        this.anims.walking = new ig.Animation( this.wolfAnimSheet, 0.1, [8,9,10,9] );
        this.anims.biting = new ig.Animation(this.wolfAnimSheet, 0.1, [10,11]);
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
        if (other instanceof EntitySheep || other instanceof EntityPlayer && other.isSheep) {
            this.targetSheep = null;
            if (!other.trapped) {
                this.fed = true;
                other.kill();
            }
            else {
                this.lockOnTarget();
            }
        }
        this.parent();
    },

    /******* END COLLISION FUNCTIONS *******/

    draw: function() {
        this.parent();
    }

});
});