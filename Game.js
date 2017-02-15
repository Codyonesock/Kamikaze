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

    //settings
    var speed = 8;

    //key booleans
    var downKey = false;
    var upKey = false;
    var leftKey = false;
    var rightKey = false;

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

        // get reference to canvas
        canvas = document.getElementById("stage");
        // set canvas to as wide/high as the browser window
        canvas.width = 640;
        canvas.height = 480;
        // create stage object
        stage = new createjs.Stage(canvas);

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
    }  
}

    //using this to check for movement and to set a boundry
    function checkMovement() {  
    //set a boundry for top/down/right/left -- think of it as an invisible border around the canvas
    if (leftKey) {  
        if (ship.x - speed > 20)  
            ship.x -= speed;  
    }  
    else if (rightKey) {  
        if (ship.x + speed < 620)  
            ship.x += speed;  
    }                        
    if (upKey) {  
        if (ship.y - speed > 24)  
            ship.y -= speed;  
    }  
    else if (downKey) {  
        if (ship.y + speed < 460)  
            ship.y += speed;  
    }  
}

    function onTick(e) {
        // TESTING FPS
        document.getElementById("fps").innerHTML = Math.floor(createjs.Ticker.getMeasuredFPS());

        //calling the method to monitor keys
        // monitorKeys();

        //checking for player movement for each frame
        checkMovement();

        // game loop code here
        // ship.mover.update();

        // update the stage!
        stage.update();
    }

})();