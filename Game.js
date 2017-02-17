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
    var bulletArray;
    var bulletGraphics;
    var bulletShape;

    //settings
    var shipSpeed = 8;
    var bulletSpeed = 20;

    //key booleans
    var downKey = false;
    var upKey = false;
    var leftKey = false;
    var rightKey = false;

    //background objects
    var stars;    
    var starShape;

    //------------------------------------------------------------- private methods
    // function monitorKeys() {
    //     if (leftKey) {
    //         ship.mover.setDirection(MoverDirection.LEFT);
    //         ship.mover.startMe();
    //     } else if (rightKey) {
    //         ship.mover.setDirection(MoverDirection.RIGHT);
    //         ship.mover.startMe();
    //     } else if (upKey) {
    //         ship.mover.setDirection(MoverDirection.UP);
    //         ship.mover.startMe();
    //     } else if (downKey) {
    //         ship.mover.setDirection(MoverDirection.DOWN);
    //         ship.mover.startMe();
    //     } else {
    //         ship.mover.stopMe();
    //     }
    // }

    // ------------------------------------------------------------ event handlers
    function onInit() {
        console.log(">> initializing");

        //bullet drawing attempt - im leaving this for now -- it will go into a custom class later when I get unlazy
        bulletArray = new Array();
        bulletGraphics = new createjs.Graphics();
        bulletGraphics.setStrokeStyle(1);
        bulletGraphics.beginStroke("#66d9ff");
        bulletGraphics.beginFill("#b3ecff");
        bulletGraphics.drawCircle(0,0,3);



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

    //function that returns a random range based off min and max
    function randomRange(min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    }

    function drawBackground(e) {
        //array for the stars
        stars = new Array();

        //drawing a circle and setting stroke/fill colors
        var graphics = new createjs.Graphics();
        graphics.setStrokeStyle(1);
        graphics.beginStroke("#ffffff");
        graphics.beginFill("#ffffff");
        graphics.drawCircle(0,0,1);

        //putting stars in random places using the randomRange function and adding to the stage
        for (var i = 0; i < 100; i++) {
            starShape = new createjs.Shape(graphics);
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
        var currentStar;
        var limit = stars.length;
        for (var i = 0; i < limit; ++i) {
            currentStar = stars[i];
            currentStar.y += 4;
            if (currentStar.y > 480) {
                currentStar.x = randomRange(10, 630);
                currentStar.y = -randomRange(20, 450);
            }
        }
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
        // ship.mover = new Mover(ship, stage);
        // ship.mover.setSpeed(8);        
        stage.addChild(ship);

        //setup event listeners for Keyboard
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);

        // startup the ticker
        createjs.Ticker.setFPS(frameRate);
        createjs.Ticker.addEventListener("tick", onTick);

        console.log(">> game ready");
    }

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
        var bulletLimit = bulletArray.length - 1;

        for (var i = bulletLimit; i >=0; --i) {
            bulletArray[i].y -= bulletSpeed;
            if (bulletArray[i].y < -3) {
                stage.removeChild(bulletArray[i]);
                bulletArray.splice(i, i)
            }
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

        //calling the method to monitor keys
        // monitorKeys();        

        //updating the background
        updateBackground();

        //checking for player movement for each frame
        checkMovement();

        // game loop code here
        // ship.mover.update();

        // update the stage!
        stage.update();
    }

})();