ig.module(
	'game.entities.sheep'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntitySheep = ig.Entity.extend({
    type: ig.Entity.TYPE.B,
    collides: ig.Entity.COLLIDES.ACTIVE,
    checkAgainst: ig.Entity.TYPE.B,

    size: {x: 32, y: 32},
    offset: {x: 7, y: 1},

    health: 1,

    gravityFactor: 0,
    zIndex: 100,

    bouncingTimer: new ig.Timer(1),

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
    minViewDistance: 50,
    maxViewDistance: 200,
    spookTimer: new ig.Timer(5),


    // Angles
    angle: 0,
    targetAngle: 0,

    // Speeds
    speed: 0,
    maxSpeed: 170,
    minSpeed: 50,
    accelTurnSpeed: 250,

    minMinSpeed: 30,
    maxMinSpeed: 60,
    maxMaxSpeed: 170,

    // Other movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    accelGround: 700,
    accelAir: 700,
    trapped: false,

    // Audio
    baahTimer: new ig.Timer(10),
    baahMin: 10,
    baahMax: 35,
    sheepRunSound: new ig.Sound( 'media/audio/sheepsounds/sheep-running.*', false ),


    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep-other.png', 46, 34 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);

        ig.music.add( this.sheepRunSound, 'sheepRunSound' );

        this.setAnimations();
        this.currentAnim = this.anims.idle;

        if (ig.game.getEntitiesByType(EntitySheep).length === 1) {
            // Pick a random baah sound
            var sheepSoundsShuffledArr = ig.game.controller.shuffleArray(ig.game.sheepSoundsArr);
            sheepSoundsShuffledArr[0].play();
        }

        this.setDifficulty();


        // Set sounds arr
        var rand = ig.game.controller.randomFromTo(this.baahMin, this.baahMax);
        this.baahTimer.set(rand);
        this.baahTimer.reset();
        this.pickRandTargetAngle();
        this.startGrazing();
    },

    setDifficulty: function() {
        // Set view distance
        var viewDistance = 100 * ig.game.sheepEaten / 5;
        if (viewDistance < this.minViewDistance) {
            this.viewDistance = this.minViewDistance;
        }
        else if (viewDistance > this.maxViewDistance) {
            this.viewDistance = this.maxViewDistance;
        }
        else {
            this.viewDistance = viewDistance;
        }

        // Set min speed 
        var minSpeed = 100 * ig.game.sheepProcessed / 5;
        if (minSpeed < this.minMinSpeed) {
            this.minSpeed = this.minMinSpeed;
        }
        else if (minSpeed > this.maxMinSpeed) {
            this.minSpeed = this.maxMinSpeed;
        }
        else {
            this.minSpeed = minSpeed;
        }    

        this.maxSpeed = minSpeed + 120;
        if (this.maxSpeed > this.maxMaxSpeed) {
            this.maxSpeed = this.maxMaxSpeed;
        }

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
            this.sheepRunSound.stop();
            ig.game.controller.killOffScreen(this);
            if (this.pos.x > 15) {
                this.pos.x -= this.speed * ig.system.tick;
                if (this.pos.y < ig.system.height - 75) {
                    this.pos.y += this.speed * ig.system.tick;
                }
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
        this.sheepRunSound.stop();
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
        this.sheepRunSound.play();
        this.isGrazing = false;
        this.speed = this.maxSpeed;
        this.pickEscapeAngle();
        this.spookTimer.reset();
    },

    checkRunMovement: function() {
        this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
        this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
        
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
        if (this.spotted) {
            var spottedAngle = this.spotted.angle;
            var angleToSpotted = (this.angleTo(this.spotted)).toDeg();
            this.targetAngle = angleToSpotted + 180;
        }
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
        this.currentAnim.angle = this.angle.toRad();
    },

    /******* END ANGLE FUNCTIONS *******/

    /******* DEATH FUNCTIONS *******/

    getEaten: function() {
        ig.game.sheepEaten++;
        ig.game.controller.checkSheepStats();
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
        this.sheepRunSound.stop();
        if (ig.game.wolf && ig.game.wolf.targetSheep === this) {
            ig.game.wolf.lockOnTarget();
            console.log('making wolf lockon target');
        }
        if (this.trapped) {
            var conveyor = ig.game.getEntitiesByType(EntityConveyor)[0];
            ig.game.controller.removeFromArray(this, conveyor.onConveyorArr);
        }

        // Blood splatter!!!
        var bloodLayer = ig.game.backgroundMaps[2];
        var randBloodSplatter = ig.game.controller.randomFromTo(1,5);
        bloodLayer.setTile( this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, randBloodSplatter );
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
                    if (this.angle > 0 && this.angle < 90) {
                        this.targetAngle = ig.game.controller.randomFromTo(91, 170);
                    }
                    else if (this.angle >= 270) {
                        this.targetAngle = ig.game.controller.randomFromTo(190, 269);
                    }
              //      this.targetAngle = ig.game.controller.randomFromTo(91, 269);
                }
                else {
                    // Colliding left

                    if (this.angle > 90 && this.angle < 180) {
                        this.targetAngle = ig.game.controller.randomFromTo(10, 90);
                    }
                    else if (this.angle >= 180) {
                        this.targetAngle = ig.game.controller.randomFromTo(190, 360);
                    }

               //     this.targetAngle = ig.game.controller.randomFromTo(89, 271);
                }
            }
            else {
                if (this.vel.y > 0) {
                    // Colliding down

                    if (this.angle > 0 && this.angle < 90) {
                        this.targetAngle = ig.game.controller.randomFromTo(300, 350);
                    }
                    else if (this.angle >= 90) {
                        this.targetAngle = ig.game.controller.randomFromTo(190, 250);
                    }

                //    this.targetAngle = ig.game.controller.randomFromTo(181, 359);                
                }
                else {
                    // Colliding up
                    if (this.angle > 180 && this.angle < 280) {
                        this.targetAngle = ig.game.controller.randomFromTo(100, 170);
                    }
                    else if (this.angle >= 270) {
                        this.targetAngle = ig.game.controller.randomFromTo(0, 80);
                    }
                  //  this.targetAngle = ig.game.controller.randomFromTo(1, 179);                
                }
            }
            this.bouncingTimer.reset();
            this.bouncingTimer.unpause();
        }
        else {
            // No collision. Just move normally.
            if (this.bouncingTimer.delta() > 0) {
                if (!this.isGrazing && this.distanceTo(this.spotted) <= this.viewDistance * 2) {
                    var angleToSpotted = (this.angleTo(this.spotted)).toDeg();
                    this.targetAngle = angleToSpotted + 180;
                }
            }
            this.parent( res );
        }    
    },


    check: function(other) {
        if (other instanceof EntitySheep) {
            if (this.isGrazing && !other.isGrazing) {
                this.spotted = other.spotted;
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
            ig.game.ctx.arc(this.pos.x + this.size.x / 2, this.pos.y + this.size.y / 2, this.viewDistance - 5, 0, 2 * Math.PI, false);
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
    }

});
});