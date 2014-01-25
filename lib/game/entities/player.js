ig.module(
	'game.entities.player'
)
.requires(
	'impact.entity'
)

.defines(function(){"use strict";

ig.global.EntityPlayer = ig.Entity.extend({
    type: ig.Entity.TYPE.A,
    collides: ig.Entity.COLLIDES.ACTIVE,
    checkAgainst: ig.Entity.TYPE.B,
    size: {x: 32, y: 32},
    offset: {x: 7, y: 1},
    gravityFactor: 0,
    zIndex: 2,

    // Main stats
    lives: 3,
    isSheep: true,

    // Speed
    speed: 100,
    sheepSpeed: 100,
    wolfSpeed: 200,

    // Energy
    energy: 50,
    maxEnergy: 100,
    feedingEnergyBonus: 25,
    currentEnergyDepletion: 1,
    sheepEnergyDepletion: 1,
    wolfEnergyDepletion: 2,
    energyDepletionTimer: new ig.Timer(1),

    // Movement
    maxVel: {x: 150, y: 150},
    friction: {x: 500, y: 500},
    angle: 0,
    accelGround: 700,
    accelAir: 700,
    accelTurnSpeed: 250,
    footstepsPlaying: false,
    
    sheepAnimSheet: new ig.AnimationSheet( 'media/sheep-player.png', 46, 34 ),
    wolfAnimSheet: new ig.AnimationSheet( 'media/wolf2.png', 56, 30 ),


	init: function(x, y, settings) {
        this.parent(x, y, settings);
        ig.game.player = this;
        this.setAnimations();
        this.currentAnim = this.anims.idle;
    },

    setAnimations: function() {
        if (this.isSheep) {
            this.anims.idle = new ig.Animation( this.sheepAnimSheet, 0, [1], true );
            this.anims.walking = new ig.Animation( this.sheepAnimSheet, 0.1, [5,7,9,7] );
            this.anims.scared = new ig.Animation( this.sheepAnimSheet, 0, [0], true );
            this.anims.running = new ig.Animation( this.sheepAnimSheet, 0.1, [4,6,8,6] );
        }
        else {
            this.anims.idle = new ig.Animation( this.wolfAnimSheet, 0, [0], true );
            this.anims.walking = new ig.Animation( this.wolfAnimSheet, 0.1, [8,9,10,9] );

         //   this.anims.walking = new ig.Animation( this.wolfAnimSheet, 0.1, [0,1,2,3,2,1] );
         //   this.anims.running = new ig.Animation( this.wolfAnimSheet, 0.1, [8,9,10,9] );
        }
    },
	
    update: function() {
        this.currentAnim.angle = this.angle.toRad();
        if (this.angle > 360) {
            this.angle = 0;
        }
        else if (this.angle < 0) {
            this.angle = 360;
        }

        this.checkMovement();
        this.checkMode();
        this.depleteEnergy();
       
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
    },

    check: function(other) {
        if (!this.isSheep) {
            if (other instanceof EntitySheep) {
                if (ig.input.pressed('space')) {
                    this.addEnergy(this.feedingEnergyBonus);
                    other.getEaten();
                }
            }
        }
    },

    checkMode: function() {
        if (ig.input.pressed('c')) {
            this.isSheep = !this.isSheep;
            this.setAnimations();
            if (this.isSheep) {
                this.currentEnergyDepletion = this.sheepEnergyDepletion;
                this.speed = this.sheepSpeed;
            }
            else {
                this.currentEnergyDepletion = this.wolfEnergyDepletion;
                this.speed = this.wolfSpeed;
            }
            this.energyDepletionTimer.set = this.currentEnergyDepletion;
            console.log('is sheep: ' + this.isSheep);
        }
    },

    depleteEnergy: function() {
        if (this.energy <= 0) {
            console.log('GAME OVARRRRR');
        }
        else {
            if (this.energyDepletionTimer.delta() > 0) {
                this.energyDepletionTimer.reset();
                this.energy -= this.currentEnergyDepletion;
            }
        }

    },

    addEnergy: function(amount) {
        if (this.energy += amount <= this.maxEnergy) {
            this.energy += amount;
        }
        else {
            this.energy += this.energy + amount - this.maxEnergy;
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

    draw: function() {
        this.parent();
        this.drawEnergyBar();
    },

    drawEnergyBar: function() {
        ig.game.ctx.save();
        var x = ig.system.width / 2 - 300 / 2;
        var y = 10;
        ig.game.ctx.fillStyle = '#000';
        ig.game.ctx.fillRect(x, y, 300, 30);
        ig.game.ctx.fillStyle = '#0000ff';
        ig.game.ctx.fillRect(x, y, this.energy * 3, 30);
        ig.game.ctx.font = ig.game.mainhudFont;
        ig.game.ctx.textBaseline = 'top';
        x = ig.system.width / 2;
        ig.game.ctx.textAlign = 'center';
        ig.game.ctx.fillStyle = '#fff';
        ig.game.ctx.fillText('Energy: ' + this.energy, x, y);
        ig.game.ctx.restore();
    },

});
});