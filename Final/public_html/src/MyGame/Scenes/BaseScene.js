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

function BaseScene()
{
    this.kSpriteSheet = "assets/Hero/sheet.png";
    this.kBackground = "assets/Backgrounds/blue.png";
    // Objects
    this.mShip = null;
    this.mEnemies = [];
    this.mAsteroids = [];
    this.mGlobalLightSet = null;
    
    // The camera to view the scene
    this.mCamera = null;
    this.mScore = 0;
    this.mScoreMsg = null;
    this.mStartTime = null;
    this.mTimeMsg = null;
    this.mToggleMiniMap = false;
}
gEngine.Core.inheritPrototype(BaseScene, Scene);


BaseScene.prototype.loadScene = function ()
{
    gEngine.Textures.loadTexture(this.kSpriteSheet);
    gEngine.Textures.loadTexture(this.kBackground);
};

BaseScene.prototype.unloadScene = function ()
{
    gEngine.Textures.unloadTexture(this.kSpriteSheet);
    gEngine.Textures.unloadTexture(this.kBackground);
};

BaseScene.prototype.asteroidFactory = function (atX, atY, light) {
    var ast1 = new Asteroid(this.kSpriteSheet, atX, atY, light);
    this.applyAllLights(ast1.getRenderable());
    this.mAsteroids.push(ast1);
}

BaseScene.prototype.applyAllLights = function (lightRenderable) {
    for (let i = 1; i < 4; i++) {
        lightRenderable.addLight(this.mGlobalLightSet.getLightAt(i));
    }
}

BaseScene.prototype.initialize = function () {
    this.mStatsCamera = new Camera(
            vec2.fromValues(0, 0),
            50,
            [0, 0, 800, 100]
            );
    this.mStatsCamera.setBackgroundColor([0, 0, 0, 1]);

    this.mCamera = new Camera(
            vec2.fromValues(50, 40),
            150,
            [0, 100, 800, 600]
            );
    this.mCamera.setBackgroundColor([0.8, 0.8, 0.8, 1]);

    this.mMiniCam = new Camera(
            vec2.fromValues(0, 0),
            300,
            [600, 500, 200, 200]         
            );
    this.mMiniCam.setBackgroundColor([0.4, 0.4, 0.4, 1]);

    this.mScoreMsg = new FontRenderable("");
    this.mScoreMsg.setColor([1, 1, 1, 1]);
    this.mScoreMsg.getXform().setPosition(-23, 1);
    this.mScoreMsg.setTextHeight(2);

    this.mTimeMsg = new FontRenderable("");
    this.mTimeMsg.setColor([1, 1, 1, 1]);
    this.mTimeMsg.getXform().setPosition(-23, -1);
    this.mTimeMsg.setTextHeight(2);

    this._initializeLights();

//    this.asteroidFactory(20, 30, this.mGlobalLightSet.getLightAt(2));
//    this.asteroidFactory(50, 30, this.mGlobalLightSet.getLightAt(3));

    // create the tiled background

    // sets the background to gray
    gEngine.DefaultResources.setGlobalAmbientIntensity(3);
    this.mStartTime = Date.now();
};

BaseScene.prototype.initializePlayer = function(atX, atY) {
      this.mShip = new PlayerShip(this.kSpriteSheet, atX, atY, 2, this.mGlobalLightSet.getLightAt(0));
    this.mShip.toggleDrawRenderable(); //normally spawns invisible really weird
    for (let i = 0; i < 4; i++) {
        this.mShip.getRenderable().addLight(this.mGlobalLightSet.getLightAt(i));
    }
};

BaseScene.prototype.intializeBackground = function() {
     // create the tiled background
    this.mBackground = new TiledGameObject(new TextureRenderable(this.kBackground));
    this.mBackground.getXform().setSize(50, 50);
    this.mBackground.getXform().setPosition(50, 40);
};

BaseScene.prototype.drawCore = function (camera) {
    if (this.mShip.isAlive())
    {
        this.mShip.draw(camera);
    }

    for (var i = 0; i < this.mEnemies.length; ++i) {
        this.mEnemies[i].draw(camera);
    }
    for (var i = 0; i < this.mAsteroids.length; ++i) {
        this.mAsteroids[i].draw(camera);
    }
};

BaseScene.prototype.drawMainCam = function() {
      this.mCamera.setupViewProjection();
      this.mBackground.draw(this.mCamera);
      this.drawCore(this.mCamera);
};

BaseScene.prototype.drawMiniMap = function() {
     if (this.mToggleMinimap) {
        this.mMiniCam.setupViewProjection();
        this.drawCore(this.mMiniCam);
    }
};

BaseScene.prototype.drawStats = function () {
    this.mStatsCamera.setupViewProjection();
    this.mScoreMsg.draw(this.mStatsCamera);   // only draw status in the main camera
    this.mTimeMsg.draw(this.mStatsCamera);
};

// This is the draw function, make sure to setup proper drawing environment, and more
// importantly, make sure to _NOT_ change any state.
BaseScene.prototype.draw = function ()
{
    // Step A: clear the canvas
    gEngine.Core.clearCanvas([0.9, 0.9, 0.9, 1]); // clear to light gray
    this.drawMainCam();
    this.drawMiniMap();
    this.drawStats();
};

BaseScene.prototype.removeDeadEnemies = function () {
    var to_remove = [];
    for (var j = 0; j < this.mEnemies.length; ++j) {
        // TODO Is it possible to assign the "isAlive" variable as 0 when alive 
        // and then a number when did which adds to the score
        var alive = this.mEnemies[j].isAlive();
        if (alive != -1) {
            to_remove.push(j);
            this.mScore += alive;
        }
    }
    for (var i = 0; i < to_remove.length; ++i) {
        this.mEnemies.splice(to_remove[i], 1);
    }
};

BaseScene.prototype.removeDeadPlayer = function () {
    this.mShip = null;
};

BaseScene.prototype.updateText = function () {
    this.mScoreMsg.setText("Score: " + this.mScore);
    var delta = (Date.now() - this.mStartTime) / 1000;
    this.mTimeMsg.setText("Time: " + Math.floor(delta))
};

BaseScene.prototype.updatePlayer = function() {
      // update game objects
    var condition = this.mShip.isAlive();
    if (condition)
    {
        if (!this.mShip.update(this.mCamera, this.mEnemies))
        {
            this.removeDeadPlayer();
        }
    }
    return condition;
};

BaseScene.prototype.updateEnemies = function () {
    for (var i = 0; i < this.mEnemies.length; ++i) {
        this.mEnemies[i].update(this.mShip);
    }
    this.removeDeadEnemies();
};

BaseScene.prototype.updateAsteroids = function() {
    for (var i = 0; i < this.mAsteroids.length; ++i) {
        this.mAsteroids[i].update(this.mShip.getLasers());
    }
};

BaseScene.prototype.checkForNextLevel = function() {

};

BaseScene.prototype.update = function ()
{
    this.updateText();
    this.controls();
    this.mCamera.update();
    this.updatePlayer();
    this.updateEnemies();
    this.updateAsteroids();
};
