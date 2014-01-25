ig.module(
	'game.entities.sheep'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntitySheep = ig.Entity.extend({
    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.PASSIVE,
    checkAgainst: ig.Entity.TYPE.B,

    size: {x: 32, y: 32},
    offset: {x: 7, y: 1},

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
    spookTimer: new ig.Timer(5),


    // Angles
    angle: 0,
    targetAngle: 0,

    // Speeds
    speed: 0,
    maxSpeed: 170,
    minSpeed: 50,
    accelTurnSpeed: 250,

    // Other movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    accelGround: 700,
    accelAir: 700,
    footstepsPlaying: false,
    trapped: false,

    // Audio
    baahTimer: new ig.Timer(10),
    baahMin: 10,
    baahMax: 35,
    
    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep1.png', 46, 34 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);

        this.setAnimations();
        this.currentAnim = this.anims.idle;

        if (ig.game.getEntitiesByType(EntitySheep).length === 1) {
            // Pick a random baah sound
            var sheepSoundsShuffledArr = ig.game.controller.shuffleArray(ig.game.sheepSoundsArr);
            sheepSoundsShuffledArr[0].play();
        }
        // Set sounds arr
        var rand = ig.game.controller.randomFromTo(this.baahMin, this.baahMax);
        this.baahTimer.set(rand);
        this.baahTimer.reset();



        this.pickRandTargetAngle();
        this.startGrazing();
    },

    update: function() {
        this.checkAngles();
        if (!this.trapped) {
            if (this.isGrazing) {
                this.checkForSound();
                this.checkGrazeMovement();
                if (ig.game.player) {
                    this.checkSpook();
                }
            }
            else {
                this.checkRunMovement();
            }
            this.checkIfBeingAttacked();
            this.checkAnimations();
        }
        else {
            ig.game.controller.killOffScreen(this);
            if (this.pos.x > 30) {
                this.pos.x -= this.speed * ig.system.tick;
            }

            else if (this.pos.y > -this.size.y) {
                this.pos.y -= this.speed * ig.system.tick;
            }
        }
      
        this.parent();
    },

    /******* SOUND FUNCTIONS *******/
    checkForSound: function() {
        if (this.baahTimer.delta() > 0) {
            var rand = ig.game.controller.randomFromTo(0, ig.game.sheepSoundsArr.length - 1);
            this.baahTimer.set(rand);
            this.baahTimer.reset();

            // Pick a random baah sound
            var sheepSoundsShuffledArr = ig.game.controller.shuffleArray(ig.game.sheepSoundsArr);
            sheepSoundsShuffledArr[0].play();
        }
    },
   


    /******* GRAZE FUNCTIONS *******/

    startGrazing: function() {
        this.isGrazing = true;
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
        this.grazeTimer.unpause();
    },

    checkGrazeMovement: function() {
        if (!this.idling) {
            this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
            this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
        }
        if (this.grazeTimer.delta() > 0) {

            this.checkGrazeAction();
        }
    },

    /******* END GRAZE FUNCTIONS *******/

    /******* SPOOK FUNCTIONS *******/

    checkSpook: function() {
        // If this is close enough to the player, PANIC!!!!
        if (!ig.game.player.isSheep && this.distanceTo(ig.game.player) <= this.viewDistance) {
            this.spotted = ig.game.player;
            this.startRunning();
        }

        else if (ig.game.wolf && this.distanceTo(ig.game.wolf) <= this.viewDistance) {
            this.spotted = ig.game.wolf;
            this.startRunning();
        }
        else if (!this.isGrazing) {
            this.startGrazing();
        }
    },

    startRunning: function() {
        this.isGrazing = false;
        this.speed = this.maxSpeed;
        this.pickEscapeAngle();
        this.spookTimer.reset();
    },

    checkRunMovement: function() {
     /*   var r = Math.atan2(ig.game.player.pos.y-this.pos.y, ig.game.player.pos.x-this.pos.x);
        var vely = -(Math.sin(r) * this.speed);
        var velx = -(Math.cos(r) * this.speed);
        this.vel.x = velx;
        this.vel.y = vely; */

        this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
        this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
    /*    if (this.previousDistance !== this.distanceTo(ig.game.player)) {
            this.previousDistance = this.distanceTo(ig.game.player);
        } */
   /*     if (this.targetAngle < this.spotted.angle - 10 && this.targetAngle > this.spotted.angle + 10) {
            if (this.previousDistance > this.distanceTo(ig.game.player)) {
                console.log('too close, picking again');
             //   console.log('running TOWARD player')
                this.pickEscapeAngle();
            }
        } */
        
        if (this.spookTimer.delta() > 0) {
            this.checkSpook();
        }
    },

    /******* END SPOOK FUNCTIONS *******/


    /******* ANGLE FUNCTIONS *******/

    pickRandTargetAngle: function() {
        this.targetAngle = ig.game.controller.randomFromTo(0,360);
    },

    pickEscapeAngle: function() {
   //     this.previousDistance = this.distanceTo(ig.game.player);
        // Angle of player
        var spottedAngle = this.spotted.angle;
        var angleToSpotted = (this.angleTo(this.spotted)).toDeg();
      //  this.targetAngle = -this.angleToPlayer;
      this.targetAngle = angleToSpotted + 180;
     //   this.targetAngle = ig.game.controller.randomFromTo(spottedAngle - 5, spottedAngle + 5);
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

    getEaten: function() {
        ig.game.sheepEaten++;
        this.kill();
    },

    checkIfBeingAttacked: function() {
        if (!ig.game.player.isSheep) {
            if (this.distanceTo(ig.game.player) < ig.game.player.attackDistance) {
                if (ig.input.pressed('space')) {
                    ig.game.player.eatSheep(this);
                }
            }
        }
    },

    kill: function() {
       
        this.parent();
    },

    /******* END DEATH FUNCTIONS *******/

  
    /******* ANIMATION FUNCTIONS *******/
    setAnimations: function() {
        this.anims.idle = new ig.Animation( this.sheepAnimSheet, 0, [1], true );
        this.anims.walking = new ig.Animation( this.sheepAnimSheet, 0.1, [5,7,9,7] );
        this.anims.scared = new ig.Animation( this.sheepAnimSheet, 0, [0], true );
        this.anims.running = new ig.Animation( this.sheepAnimSheet, 0.05, [4,6,8,6] );
    },

    checkAnimations: function() {
        if (this.vel.x !== 0 || this.vel.y !== 0) {
            if (this.isGrazing) {
                if (this.currentAnim !== this.anims.walking) {
                    this.currentAnim = this.anims.walking;
                }
            }
            else {
                if (this.currentAnim !== this.anims.running) {
                    this.currentAnim = this.anims.running;
                }
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

    handleMovementTrace: function ( res ){
        if( res.collision.x || res.collision.y ) {
            if (res.collision.x) {
                if (this.vel.x > 0) {
                    // Colliding right
                    this.targetAngle = ig.game.controller.randomFromTo(100, 260);
                }
                else {
                    // Colliding left
                    this.targetAngle = ig.game.controller.randomFromTo(80, 280);
                }
            }
            else {
                if (this.vel.y > 0) {
                    // Colliding down
                    this.targetAngle = ig.game.controller.randomFromTo(190, 350);                
                }
                else {
                    // Colliding up
                    this.targetAngle = ig.game.controller.randomFromTo(10, 170);                
                }
            }
        }
        else {
            // No collision. Just move normally.
            this.parent( res );
        }    
    },


    check: function(other) {
        if (other instanceof EntitySheep) {
            if (this.isGrazing && !other.isGrazing) {
                this.startRunning();
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

        if (!this.isGrazing) {
            ig.game.ctx.save();
            var x = this.pos.x + this.size.x / 2;
            var y = this.pos.y - 3;
            ig.game.ctx.font = 'bold 30px verdana';
            ig.game.ctx.fillStyle = '#ff0000';
            ig.game.ctx.fillText('!', x, y);
            ig.game.ctx.restore();        
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