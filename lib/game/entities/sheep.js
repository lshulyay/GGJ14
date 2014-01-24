ig.module(
	'game.entities.sheep'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntitySheep = ig.Entity.extend({
    type: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.PASSIVE,
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 32, y: 32},
    gravityFactor: 0,
    zIndex: 2,

    // Main stats
    lives: 3,
    energy: 50,
    
    // Graze toggle and movement
    isGrazing: true, // If not grazing, the sheep is spooked and is RUNNING
    grazeTimer: new ig.Timer(1),
    grazeTimerMin: 1,
    grazeTimerMax: 7,

    idling: true,

    // Spook 
    viewDistance: 100,


    // Angles
    angle: 0,
    targetAngle: 0,

    // Speeds
    speed: 0,
    maxSpeed: 200,
    minSpeed: 50,
    accelTurnSpeed: 250,

    // Other movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    accelGround: 700,
    accelAir: 700,
    footstepsPlaying: false,
    
    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep1.png', 32, 32 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);

        this.setAnimations();
        this.currentAnim = this.anims.idle;

        ig.game.sheep = this;
        this.pickRandTargetAngle();
        this.startGrazing();
    },

    setAnimations: function() {
            this.anims.idle = new ig.Animation( this.sheepAnimSheet, 0, [1], true );
            this.anims.walking = new ig.Animation( this.sheepAnimSheet, 0.1, [5,7,9,11] );
            this.anims.scared = new ig.Animation( this.sheepAnimSheet, 0, [0], true );
            this.anims.running = new ig.Animation( this.sheepAnimSheet, 0.1, [4,6] );
    },


    /******* GRAZE FUNCTIONS *******/

    startGrazing: function() {
        this.speed = this.minSpeed;
        this.grazeTimer.reset();
        this.checkGrazeAction();
    },

    checkGrazeAction: function() {
        this.grazeTimer.pause();
        var rand = 0;
        this.idling = !this.idling;
        rand = ig.game.controller.randomFromTo(this.grazeTimerMin,this.grazeTimerMax);
        if (this.idling) {
            this.pickRandTargetAngle();
        } 
        else {
            this.vel.x = 0;
            this.vel.y = 0;
        }
        this.grazeTimer.set(rand);
        this.grazeTimer.reset();
        console.log('delta: ' + this.grazeTimer.delta());
        this.grazeTimer.unpause();
    },

    checkGrazeMovement: function() {
        if (!this.idling) {
            this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
            this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
        }
        if (this.grazeTimer.delta() > 0) {
                        console.log('graze timer reached ' + this.grazeTimer.delta());

            this.checkGrazeAction();
        }
    },

    /******* END GRAZE FUNCTIONS *******/

    update: function() {
        this.checkAngles();
        if (this.isGrazing) {
            this.checkGrazeMovement();
            this.checkSpook();
        }

        this.checkAnimations();
      
        this.parent();
    },

    /******* ANGLE FUNCTIONS *******/

    pickRandTargetAngle: function() {
        this.targetAngle = ig.game.controller.randomFromTo(0,360);
    },
    
    checkAngles: function() {
        if (this.targetAngle > this.angle + 5) {
            this.angle += this.accelTurnSpeed * ig.system.tick;
        }
        else if (this.targetAngle < this.angle - 5) {
            this.angle -= this.accelTurnSpeed * ig.system.tick;
        }
        else if (this.targetAngle !== this.angle) {
            this.angle = this.targetAngle;
        }
        this.currentAnim.angle = this.angle.toRad();
    },

    /******* END ANGLE FUNCTIONS *******/

    /******* SPOOK FUNCTIONS *******/

    checkSpook: function() {
        // If this is close enough to the player, PANIC!!!!
        if (this.distanceTo(ig.game.player) <= this.viewDistance) {
            this.isGrazing = false;
        }
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

   

    checkDetection: function() {
     /*   var oldDetection = this.detected;
        this.detected = ig.game.controller.checkDetection(this.pos.x,this.pos.y,this.size.x);
        if (!oldDetection && this.detected) {
            ig.game.ouchSound.play();
            this.lives--;
            if (this.lives <= 0) {
                ig.game.loadLevel(LevelEnd);
            }
        } */
    },



    check: function(other) {
      /*  if (ig.input.pressed('space') && other.visible && other.fertility > 0 && !other.justBorn && !this.pregnant) {
            other.fertility--;
            other.hideFlea(false);
            var tempAngle = other.currentAnim.angle;
            this.currentAnim = this.anims.humping.rewind();
            ig.game.humpingSound.play();
            this.currentAnim.angle = tempAngle;
            if (this.footstepsPlaying === true) {
                ig.music.pause('footstepMusic');
                this.footstepsPlaying = false;
            }
        }
        else if (ig.input.pressed('space') && other.visible && this.pregnant) {
            other.hideFlea(false);
        } */
        this.parent();
    },

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
        var x = 5;
        var y = 25;
        ig.game.ctx.save();
        ig.game.ctx.font = '20px verdana';
        ig.game.ctx.fillStyle = '#fff';
        ig.game.ctx.fillText('grazing? ' + this.isGrazing, x, y);
        ig.game.ctx.restore();
    }

});
});