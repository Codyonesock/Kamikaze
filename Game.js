(function() {
    "use strict";

    window.addEventListener("load", onInit);

    // game variables
    var stage = null;
    var canvas = null;

    // frame rate of game
    var frameRate = 24;

    // game objects
    var assetManager = null;
    var ship = null;

    //bullet objects
    var bulletArray = null;
    var bulletGraphics = null;
    var bulletShape = null;
    var bulletLimit = null;

    //settings
    var shipSpeed = 8;
    var bulletSpeed = 20;
    var enemyLimit = 8;
    var enemySpeed = 8;    

    //key booleans
    var downKey = false;
    var upKey = false;
    var leftKey = false;
    var rightKey = false;

    //background objects
    var stars = null;    
    var starShape = null;
    var starGraphics = null;
    var currentStar = null;
    var limit = null;

    //enemy objects 
    var enemy = null;
    var enemyBitmap = null; 
    var updateLimit = null;  

    //------------------------------------------------------------- private methods
    

    // ------------------------------------------------------------ event handlers
    function onInit() {
        console.log(">> initializing");

        //bullet drawing attempt
        bulletArray = new Array();
        bulletGraphics = new createjs.Graphics();
        bulletGraphics.setStrokeStyle(1);
        bulletGraphics.beginStroke("#66d9ff");
        bulletGraphics.beginFill("#b3ecff");
        bulletGraphics.drawCircle(0,0,3);

        //store enemy in array
        enemy = new Array();

        // get reference to canvas
        canvas = document.getElementById("stage");
        // set canvas to as wide/high as the browser window
        canvas.width = 640;
        canvas.height = 480;
        // create stage object
        stage = new createjs.Stage(canvas);

        //background graphics
        drawBackground();

        // construct preloader object to load spritesheet and sound assets
        assetManager = new AssetManager(stage);
        stage.addEventListener("onAllAssetsLoaded", onSetup);
        // load the assets
        assetManager.loadAssets(manifest);
    }

    function onSetup(e) {
        console.log(">> adding sprites to game");
        stage.removeEventListener("onAllAssetsLoaded", onSetup);

        //intialize keys - no keys pressed
        downKey = false;
        upKey = false;
        leftKey = false;
        rightKey = false;
        
        // construct game object sprites
        ship = assetManager.getSprite("assets");
        ship.x = 320;
        ship.y = 450;
        ship.gotoAndStop("Player");
        ship.regX = ship.getBounds().width/2;
        ship.regY = ship.getBounds().height/2;                
        stage.addChild(ship);

        //testing what an enemy will look like on the stage -- FIX THE NASTY COLORS
        // enemyBitmap = new createjs.Bitmap("lib/enemy.png");
        // stage.addChild(enemyBitmap);

        //setup event listeners for Keyboard
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);

        // startup the ticker
        createjs.Ticker.setFPS(frameRate);
        createjs.Ticker.addEventListener("tick", onTick);

        console.log(">> game ready");
    }

    //function that returns a random range based off min and max
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }       

    function drawBackground(e) {
        //array for the stars
        stars = new Array();

        //drawing a circle and setting stroke/fill colors
        starGraphics = new createjs.Graphics();
        starGraphics.setStrokeStyle(1);
        starGraphics.beginStroke("#ffffff");
        starGraphics.beginFill("#ffffff");
        starGraphics.drawCircle(0,0,1);

        //putting stars in random places using the randomRange function and adding to the stage
        for (var i = 0; i < 100; i++) {
            starShape = new createjs.Shape(starGraphics);
            stars.push(starShape);
            starShape.x = randomRange(10, 630);
            starShape.y = randomRange(-250, 470);
            starShape.scaleX = randomRange(0.5, 2);
            starShape.scaleY = starShape.scaleX;
            starShape.alpha = Math.random() + 0.2;
            
            stage.addChild(starShape);
        }
    }

    /* This function loops through the stars array and updates the Y value
       position by adding 4 to it. It then checks to see if the new Y value
       is greater than the stages height (in this case 480) if it is then it
       sets the star to a new position at the top of the stage thus creating
       a scrolling effect and stars in different places */
    function updateBackground(e) {        
        limit = stars.length;
        for (var i = 0; i < limit; ++i) {
            currentStar = stars[i];
            currentStar.y += 4;
            if (currentStar.y > 480) {
                currentStar.x = randomRange(10, 630);
                currentStar.y = -randomRange(20, 450);
            }
        }
    }        

    //draw bullets and add them to the stage based off the ship x/y position
    function fireBullet() {
        bulletShape = new createjs.Shape(bulletGraphics);
        bulletShape.scaleY = 1.5;
        bulletShape.x = ship.x;
        bulletShape.y = ship.y - 30;
        bulletArray.push(bulletShape);

        stage.addChild(bulletShape);
    }

    /* loop through the bullet array and update the y position. If a bullet moves
       of the screen it removes it from the stage. Finally removing the bullets
       from the array and replacing them. */
    function updateBullets() {
        bulletLimit = bulletArray.length - 1;

        for (var i = bulletLimit; i >=0; --i) {
            bulletArray[i].y -= bulletSpeed;
            if (bulletArray[i].y < -3) {
                stage.removeChild(bulletArray[i]);
                bulletArray.splice(i, i)
            }
        }
    }

    /* Doing the same exact thing I did with bullets/stars and setting the registration point to the center.
       Finally it creates more enemies unless the enemyLimit is reached. Instead of my inital plan to have pathing
       with multiple different enemies like the original Galaga I've decided a spin and to have kamikaze pilots
       to rain down and try and hit the player. 
     */
    function createEnemies() {
        if (randomRange(0, 100) > 80 && enemy.length < enemyLimit) {
            enemyBitmap = new createjs.Bitmap("lib/enemy.png");
            enemyBitmap.regX = enemyBitmap.image.width * 0.5;
            enemyBitmap.regY = enemyBitmap.image.height * 0.5;
            enemyBitmap.x = randomRange(20, 630);
            enemyBitmap.y = -randomRange(50, 100);
            enemy.push(enemyBitmap);
            stage.addChild(enemyBitmap);
        }
    } 

    /* This function loops through the array and updated the y position (like the stars) 
       If the position is greater than 500 remove the old enemy form the stage/array and prep for a new one
    */
    function updateEnemies() {
        updateLimit = enemy.length -1;
        for (var i = updateLimit; i >= 0; --i) {
            enemy[i].y += enemySpeed;
            if (enemy[i].y > 500) {
                stage.removeChild(enemy[i]);
                enemy.splice(i, 1);
            }
        }
    }

    //key down to make things move
    function onKeyDown(e) {       
    if(!e){ var e = window.event; }                
    switch(e.keyCode) {  
        // left  
        case 37: leftKey = true; rightKey = false;      
        break;                    
        // up  
        case 38: upKey = true; downKey = false;  
        break;                    
        // right  
        case 39: rightKey = true; leftKey = false;  
        break;                                        
        // down  
        case 40: downKey = true; upKey = false;  
        break;  
    }  
}  
    //key up to make things move more and handling the bullet firing
    function onKeyUp(e) {         
     if(!e){ var e = window.event; }  
     switch(e.keyCode) {  
        // left  
        case 37: leftKey = false;   
        break;                    
        // up  
        case 38: upKey = false;  
        break;  
        // right  
        case 39: rightKey = false;  
        break;  
        // down  
        case 40: downKey = false;  
        break;  
        //space bar for bullets
        case 32: fireBullet();
        break;  
    }  
}

    //using this to check for movement and to set a boundry
    function checkMovement() {  
    //set a boundry for top/down/right/left -- think of it as an invisible border around the canvas
    if (leftKey) {  
        if (ship.x - shipSpeed > 20)  
            ship.x -= shipSpeed;  
    }  
    else if (rightKey) {  
        if (ship.x + shipSpeed < 620)  
            ship.x += shipSpeed;  
    }                        
    if (upKey) {  
        if (ship.y - shipSpeed > 24)  
            ship.y -= shipSpeed;  
    }  
    else if (downKey) {  
        if (ship.y + shipSpeed < 460)  
            ship.y += shipSpeed;  
    }  
}

    function onTick(e) {
        // TESTING FPS
        document.getElementById("fps").innerHTML = Math.floor(createjs.Ticker.getMeasuredFPS());            

        //create the enemies 
        createEnemies();

        //updating the background
        updateBackground();

        //call the bullet update
        updateBullets(); 

        //update the enemies 
        updateEnemies();           

        //checking for player movement for each frame
        checkMovement();        

        // update the stage!
        stage.update();
    }

})();