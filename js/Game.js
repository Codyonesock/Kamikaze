(function() {
    "use strict";

    window.addEventListener("load", onInit);

    // game variables
    var stage = null;
    var canvas = null;
    var assetManager = null;
    var ship = null;   
    var mover = null;    

    // frame rate of game
    var frameRate = 24;                

    // ------------------------------------------------------------ event handlers
    function onInit() {
        console.log(">> initializing");

        // get reference to canvas
        canvas = document.getElementById("stage");
        // set canvas to as wide/high as the browser window
        canvas.width = 300;
        canvas.height = 300;
        // create stage object
        stage = new createjs.Stage(canvas);
		stage.enableMouseOver(10);        
        
        //setup the assetManager and start loading assets
        assetManager = new AssetManager(stage);
        stage.addEventListener("onAllAssetsLoaded", onReady);
        assetManager.loadAssets(manifest);
        
        // startup the ticker
        createjs.Ticker.setFPS(frameRate);
        createjs.Ticker.addEventListener("tick", onTick);
    }

    function onReady(e) {
        console.log(">> adding sprites to game");                
        stage.removeEventListener("onAllAssetsLoaded", onReady);                        

        //ship object
        ship = new Ship(assetManager, stage);        
        ship.showMe();

        //mover object
        mover = new Mover(ship, stage);

        //ship event
        stage.addEventListener("shipMoving", onShipMoving);               

        console.log(">> game ready");
    }
    //next button
    function onShipMoving(e) {                        
        //do the mover stuff here yo            
    }      

    function onTick(e) {
        // TESTING FPS
        document.getElementById("fps").innerHTML = Math.floor(createjs.Ticker.getMeasuredFPS());
        
        stage.update();
    }

})();