/*
 * File: MyGame.js 
 * This is the logic of our game. 
 */

/*jslint node: true, vars: true */
/*global gEngine, Scene, GameObjectset, TextureObject, Camera, vec2,
  FontRenderable, SpriteRenderable, LineRenderable,
  GameObject */
/* find out more about jslint: http://www.jslint.com/help.html */

"use strict";  // Operate in Strict mode such that variables must be declared before used!

function MyGame() 
{
    this.kSpriteSheet = "assets/Hero/sheet.png";
    this.kBackground = "assets/Backgrounds/blue.png";
    this.mShip = null;
    this.mEnemies = [];
    this.mAsteroids = [];
    this.mGlobalLightSet = null;
    // The camera to view the scene
    this.mCamera = null;
}
gEngine.Core.inheritPrototype(MyGame, Scene);


MyGame.prototype.loadScene = function () 
{
    gEngine.Textures.loadTexture(this.kSpriteSheet);
    gEngine.Textures.loadTexture(this.kBackground);
};

MyGame.prototype.unloadScene = function () 
{
    gEngine.Textures.unloadTexture(this.kSpriteSheet);
    gEngine.Textures.unloadTexture(this.kBackground);
};

MyGame.prototype.asteroidFactory = function(atX, atY, light) {
    var ast1 = new Asteroid(this.kSpriteSheet, atX, atY, light);
    this.applyLights(ast1.getRenderable());
    this.mAsteroids.push(ast1);
}

MyGame.prototype.applyLights = function(lightRenderable) {
    for (let i = 1; i < 4; i++) {
        lightRenderable.addLight(this.mGlobalLightSet.getLightAt(i));
    }
}

MyGame.prototype.initialize = function () {
    // Step A: set up the cameras
    this.mCamera = new Camera(
        vec2.fromValues(50, 40), // position of the camera
        150,                     // width of camera
        [0, 0, 800, 600]         // viewport (orgX, orgY, width, height)
    );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);
    
    this._initializeLights();
    
    // create the player ship
    this.mShip = new PlayerShip(this.kSpriteSheet, 50, 40, 2, this.mGlobalLightSet.getLightAt(0));
    this.mShip.toggleDrawRenderable(); //normally spawns invisible really weird
    for (let i = 0; i < 4; i++) {
        this.mShip.getRenderable().addLight(this.mGlobalLightSet.getLightAt(i));
    }
    
    this.asteroidFactory(20, 30, this.mGlobalLightSet.getLightAt(2));
    this.asteroidFactory(50, 30, this.mGlobalLightSet.getLightAt(3));
    
    // create the tiled background
    this.mBackground = new TiledGameObject(new TextureRenderable(this.kBackground));
    this.mBackground.getXform().setSize(50,50);
    this.mBackground.getXform().setPosition(50,40);
    
    this.spawnEnemy();
    console.log(this.mAsteroids[0]);
    // sets the background to gray
    gEngine.DefaultResources.setGlobalAmbientIntensity(3);
};

MyGame.prototype.spawnEnemy = function() 
{
    var enemy = new GrayEnemy(this.kSpriteSheet, 10, 10);
    var enemy1 = new LightEnemy(this.kSpriteSheet, 80, 80);
    enemy1.toggleDrawRenderable();
    this.applyLights(enemy1.getRenderable());

    enemy1.setVisibility(true);

    this.mEnemies.push(enemy);
    this.mEnemies.push(enemy1);
}

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
MyGame.prototype.draw = function () 
{
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1]); // clear to light gray
       // this.mGlobalLightSet.getLightAt(0).set2DPosition(this.mEnemies[1].getRenderable().getXform().getPosition());
    this.mCamera.setupViewProjection();
    
    // draw the game objects
    this.mBackground.draw(this.mCamera);
//    this.mBg.draw(this.mCamera);
    if(this.mShip.isAlive())
    {
        this.mShip.draw(this.mCamera);   
    }
    
    for(var i = 0; i < this.mEnemies.length; ++i) {
        this.mEnemies[i].draw(this.mCamera);
    }
    for(var i = 0; i < this.mAsteroids.length; ++i) {
        this.mAsteroids[i].draw(this.mCamera);
    }

};

MyGame.prototype.removeDeadEnemies = function (){
    var to_remove = [];
    for( var j = 0; j < this.mEnemies.length; ++j){
        var alive = this.mEnemies[j].isAlive();
        if(!alive){
            to_remove.push(j);
        }
    }
    for(var i = 0; i < to_remove.length; ++i){
        this.mEnemies.splice(to_remove[i], 1);
    }
};

MyGame.prototype.removeDeadPlayer = function (){
    this.mShip = null;
};

MyGame.prototype.update = function () 
{
    // update game objects
    if(this.mShip.isAlive())
    {
        if(!this.mShip.update(this.mCamera, this.mEnemies))
        {
            this.removeDeadPlayer();
        }
    }
    
    for(var i = 0; i < this.mEnemies.length; ++i) {
        this.mEnemies[i].update(this.mShip);
    }
    
    this.removeDeadEnemies();
    
    
    
    for(var i = 0; i < this.mAsteroids.length; ++i) {
        this.mAsteroids[i].update(this.mShip.getLasers());
    }

    this.mCamera.update();
};