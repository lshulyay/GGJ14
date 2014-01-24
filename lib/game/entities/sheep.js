ig.module(
	'game.entities.sheep'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntitySheep = ig.Entity.extend({
    type: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.NEVER,
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 32, y: 32},
    gravityFactor: 0,
    zIndex: 2,

    // Main stats
    lives: 3,
    energy: 50,
    
    // Graze toggle and movement
    isGrazing: true,

    grazeIdleTimer: new ig.Timer(1),
    grazeIdleMin: 1,
    grazeIdleMax: 5,

    grazeWalkTimer: new ig.Timer(1),
    grazeWalkMin: 1,
    grazeWalkMax: 10,


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
//    angle: 0,
    accelGround: 700,
    accelAir: 700,
 //   speed: 200,
    footstepsPlaying: false,
    
    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep.png', 32, 32 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);

        this.setAnimations();
        this.currentAnim = this.anims.idle;


        this.checkGrazeAction();
    },

    setAnimations: function() {
        this.anims.idle = new ig.Animation( this.sheepAnimSheet, 0, [0], true );
        this.anims.walking = new ig.Animation( this.sheepAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
        this.anims.idlePregnant = new ig.Animation (this.sheepAnimSheet, 0, [6], true);
        this.anims.walkingPregnant = new ig.Animation( this.sheepAnimSheet, 0.1, [6,7,8,7,6,9,10,9] );
    },

    checkGrazeAction: function() {
        if (this.vel.x === 0 && this.vel.y === 0) {
            var grazeWalkRand = ig.game.controller.randomFromTo(this.grazeWalkMin, this.grazeWalkMax);
            this.grazeWalkTimer.set = grazeWalkRand;
            this.pickRandTargetAngle();
            this.speed = this.minSpeed;
        }
    },

    pickRandTargetAngle: function() {
        this.targetAngle = ig.game.controller.randomFromTo(0,360);
    },
	
    update: function() {
        this.checkAngles();
        if (this.isGrazing) {
            this.checkGrazeMovement();
        }
        this.checkAnimations();
   //     this.checkMovement();
   //     this.checkDetection();
      
        this.parent();
    },

    checkGrazeMovement: function() {
        this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
        this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
    },

    checkAngles: function() {
        if (this.targetAngle > this.angle + 10) {
            this.angle += this.accelTurnSpeed * ig.system.tick;
        }
        else if (this.targetAngle < this.angle - 10) {
            this.angle -= this.accelTurnSpeed * ig.system.tick;
        }
        else if (this.targetAngle !== this.angle) {
            this.angle = this.targetAngle;
        }
        this.currentAnim.angle = this.angle.toRad();
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
        this.parent();
    }

});
});