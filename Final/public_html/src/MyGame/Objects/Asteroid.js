/*
 * Nicholas Lewis
 * Class for asteroid obstacle
 */
function Asteroid(spriteSource, posX, posY, light) 
{
    // source for the wing image
    this.kSpriteSource = spriteSource;
    this.valid = true; 
    this.mSprite = new LightRenderable(this.kSpriteSource);
    if(Math.random() > .5){
        //grey asteroid
        this.mSprite.setElementPixelPositions(327, 424, 381, 476);
    }else{
        //brown asteroid
       this.mSprite.setElementPixelPositions(327, 424, 381+98, 476+98); 
    }
    
    this.mSprite.getXform().setSize(15, 15);
    this.mSprite.getXform().setPosition(posX, posY);
    this.mLight = light;
 // parameters for projectile(this, sprite, ridgidbody widthX, ridgidbody witdhY)
    
    Obstacle.call(this, this.mSprite, 10, 10);
    this.getRigidBody().setMass(20);
    
};
gEngine.Core.inheritPrototype(Asteroid, Obstacle);

Asteroid.prototype.draw = function (aCamera) 
{
   Obstacle.prototype.draw.call(this, aCamera);
};

//tests if a laser hit asteroid and calculates new velocity
Asteroid.prototype.laserHit = function(laser, multiplier){
    var test = this.getRigidBody().boundTest(laser.getRigidBody());
        if(test){
            var V = laser.getRigidBody().getVelocity();
            var d = laser.getDamage();
            var v = this.getRigidBody().getVelocity();
            var m = this.getRigidBody().getInertia();
            this.getRigidBody().setVelocity(v[0]+((V[0]-v[0]) * m * d)*multiplier, v[1] + ((V[1]-v[1]) * m * d)*multiplier);
        };
        return test;
};

Asteroid.prototype.update = function(playerLasers, enemyLasers) 
{   
    if(this.mLight != null) {
         this.mLight.set2DPosition(this.getRenderable().getXform().getPosition());
    }
    for(var i = 0; i < playerLasers.length; ++i){
       // console.log(playerLasers[i])
        var hit = this.laserHit(playerLasers[i], .75);
        if(hit){
            playerLasers.splice(i, 1);
        }
    }
    Obstacle.prototype.update.call(this);
  
};

