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
    var snake = null;

    //key booleans
    var downKey = false;
    var upKey = false;
    var leftKey = false;
    var rightKey = false;

    //------------------------------------------------------------- private methods
    function monitorKeys() {
        if (leftKey) {
            snake.mover.setDirection(MoverDirection.LEFT);
            snake.mover.startMe();
        } else if (rightKey) {
            snake.mover.setDirection(MoverDirection.RIGHT);
            snake.mover.startMe();
        } else if (upKey) {
            snake.mover.setDirection(MoverDirection.UP);
            snake.mover.startMe();
        } else if (downKey) {
            snake.mover.setDirection(MoverDirection.DOWN);
            snake.mover.startMe();
        } else {
            snake.mover.stopMe();
        }
    }

    // ------------------------------------------------------------ event handlers
    function onInit() {
        console.log(">> initializing");

        // get reference to canvas
        canvas = document.getElementById("stage");
        // set canvas to as wide/high as the browser window
        canvas.width = 600;
        canvas.height = 600;
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
        snake = assetManager.getSprite("assets");
        snake.x = 275;
        snake.y = 500;
        snake.gotoAndStop("Player");
        snake.regX = snake.getBounds().width/2;
        snake.regY = snake.getBounds().height/2;
        snake.mover = new Mover(snake, stage);
        snake.mover.setSpeed(4);        
        stage.addChild(snake);

        //setup event listeners for Keyboard
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("keyup", onKeyUp);

        // startup the ticker
        createjs.Ticker.setFPS(frameRate);
        createjs.Ticker.addEventListener("tick", onTick);

        console.log(">> game ready");
    }

    function onKeyDown(e) {
        //console.log("key was pressed " + e.keyCode);
        if (e.keyCode == 37) leftKey = true;
        else if (e.keyCode == 39) rightKey = true;
        else if (e.keyCode == 38) upKey = true;
        else if (e.keyCode == 40) downKey = true;                        
    }

    function onKeyUp(e) {
        //console.log("key was pressed " + e.keyCode);
        if (e.keyCode == 37) leftKey = false;
        else if (e.keyCode == 39) rightKey = false;
        else if (e.keyCode == 38) upKey = false;
        else if (e.keyCode == 40) downKey = false;
    }

    function onTick(e) {
        // TESTING FPS
        document.getElementById("fps").innerHTML = Math.floor(createjs.Ticker.getMeasuredFPS());

        //calling the method to monitor keys
        monitorKeys();

        // game loop code here
        snake.mover.update();

        // update the stage!
        stage.update();
    }

})();