ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityPlayer = ig.Entity.extend({
    type: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.NEVER,
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 32, y: 32},
    gravityFactor: 0,
    zIndex: 2,

    // Main stats
    lives: 3,
    energy: 50,
    mode: 'sheep',

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0,
    accelGround: 700,
    accelAir: 700,
    speed: 200,
    accelTurnSpeed: 250,
    footstepsPlaying: false,
    
    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep.png', 32, 32 ),
    wolfAnimSheep: new ig.AnimationSheet( 'media/wolf.png', 32, 32 ),

    animSheetHumping: new ig.AnimationSheet( 'media/humping-fleas.png', 44, 31 ),

	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.player = this;


        this.setAnimations();
        this.currentAnim = this.anims.idle;
    },

    setAnimations: function() {
        switch (this.mode) {
            case 'sheep':
                this.anims.idle = new ig.Animation( this.sheepAnimSheet, 0, [0], true );
                this.anims.walking = new ig.Animation( this.sheepAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
                this.anims.idlePregnant = new ig.Animation (this.sheepAnimSheet, 0, [6], true);
                this.anims.walkingPregnant = new ig.Animation( this.sheepAnimSheet, 0.1, [6,7,8,7,6,9,10,9] );
                break;
            case 'wolf':
                this.anims.idle = new ig.Animation( this.wolfAnimSheet, 0, [0], true );
                this.anims.walking = new ig.Animation( this.wolfAnimSheet, 0.1, [0,1,2,1,0,3,4,3] );
                this.anims.idlePregnant = new ig.Animation (this.wolfAnimSheet, 0, [6], true);
                this.anims.walkingPregnant = new ig.Animation( this.wolfAnimSheet, 0.1, [6,7,8,7,6,9,10,9] );
                break;
        }

    },
	
    update: function() {
    //    var accel = this.standing ? this.accelGround : this.accelAir;
        this.currentAnim.angle = this.angle.toRad();
        this.checkMovement();
        this.checkDetection();
        if (this.currentAnim === this.anims.humping && this.currentAnim.loopCount > 0) {
            this.currentAnim = this.anims.idle;
           
        }

      
        this.parent();
    },

    checkMovement: function() {
        if (this.currentAnim !== this.anims.humping) {
            if (ig.input.state('right')) {
                this.angle += this.accelTurnSpeed * ig.system.tick;
            }
            
            else if (ig.input.state('left')) {
                this.angle -= this.accelTurnSpeed * ig.system.tick;
            }


            if (ig.input.state('up')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180) * this.speed;
                this.vel.y = Math.sin(this.angle*Math.PI/180) * this.speed;
             /*   if (this.footstepsPlaying === false) {
                    ig.music.play('footstepMusic');
                    this.footstepsPlaying = true;
                } */
            }

            else if (ig.input.state('down')) {
                // Accelerate the player in the right direction
                this.vel.x = Math.cos(this.angle*Math.PI/180) * -this.speed;
                this.vel.y = Math.sin(this.angle*Math.PI/180) * -this.speed;
            /*    if (this.footstepsPlaying === false) {
                    ig.music.play('footstepMusic');
                    this.footstepsPlaying = true;
                } */
            } 

            else {
                this.vel.y = 0;
                this.vel.x = 0;
             /*   if (this.footstepsPlaying === true) {
                    ig.music.pause('footstepMusic');
                    this.footstepsPlaying = false;
                }   */              
            }

        //    if (!this.pregnant) {
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
            }
        /*    else {
                if (ig.input.state('right') || ig.input.state('left') || this.vel.x !== 0 || this.vel.y !== 0) {
                    if (this.currentAnim !== this.anims.walkingPregnant) {
                        this.currentAnim = this.anims.walkingPregnant;
                    }
                }
                else {
                    if (this.currentAnim !== this.anims.idlePregnant) {
                        this.currentAnim = this.anims.idlePregnant;
                    }
                }
            } */

    //    }
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
        if (ig.input.pressed('space') && other.visible && other.fertility > 0 && !other.justBorn && !this.pregnant) {
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
        }
        this.parent();
    },

    draw: function() {
        this.parent();
    }

});
});