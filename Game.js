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
    var gameOver = false;
    var gameOverText = null;
    var scoreText = null;
    var playerScore = null;
    var restartText = null;

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

    //enemyArray objects 
    var enemyArray = null;
    var enemyBitmap = null; 
    var updateEnemyLimit = null; 

    //colision objects
    var difX = null;
    var difY = null;
    var bulletAmount = null;
    var enemyAmount = null;
    var currentEnemy = null;
    var currentBullet = null;

    //explison objects
    var explosionArray = null;
    var explosionBitmap = null;
    var updateExplosionLimit = null;     
    
    // ------------------------------------------------------------ event handlers
    function onInit() {
        console.log(">> initializing");

        //explosion array
        explosionArray = new Array();
        //store enemyArray in array
        enemyArray = new Array();
        //bullet array 
        bulletArray = new Array();                
        
        //drawing bullets
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

        //adding the score
        scoreText = new createjs.Text('0', "14pt bold Arial", "#FFFFFF");        
        scoreText.x = 10;
        scoreText.y = 10;        
        stage.addChild(scoreText);                        

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
        //for my happiness
        console.log("Pew..Pew..");
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
        if (randomRange(0, 100) > 80 && enemyArray.length < enemyLimit) {
            enemyBitmap = new createjs.Bitmap("lib/enemy.png");
            enemyBitmap.regX = enemyBitmap.image.width * 0.5;
            enemyBitmap.regY = enemyBitmap.image.height * 0.5;
            enemyBitmap.x = randomRange(20, 630);
            enemyBitmap.y = -randomRange(50, 100);
            enemyArray.push(enemyBitmap);
            stage.addChild(enemyBitmap);
        }
    } 

    /* This function loops through the array and updated the y position (like the stars) 
       If the position is greater than 500 remove the old enemyArray form the stage/array and prep for a new one
    */
    function updateEnemies() {
        updateEnemyLimit = enemyArray.length -1;
        for (var i = updateEnemyLimit; i >= 0; --i) {
            enemyArray[i].y += enemySpeed;
            if (enemyArray[i].y > 500) {
                stage.removeChild(enemyArray[i]);
                enemyArray.splice(i, 1);
            }
        }
    }

    /* This is basically the same code as above with enemies just it handles explosions
       this simply makes explosions and positions them. It also sets the registration point
       to the center as usual with all of my game objects and adds the explosion to the array */
    function createExplosion(positionX, positionY) {        
        explosionBitmap = assetManager.getSprite("assets");        
        explosionBitmap.regX = explosionBitmap.getBounds().width/2;
        explosionBitmap.regY = explosionBitmap.getBounds().height/2;
        explosionBitmap.x = positionX;
        explosionBitmap.y = positionY;
        explosionBitmap.gotoAndPlay("Death");                
        explosionArray.push(explosionBitmap);
        stage.addChild(explosionBitmap);
    }    

    /* This update works similar to the enemies aswell it loops through and with me being lazy
       to fix flash and my sprites I'm using alpha to fade away the explosion to give it an effect
       and finally removing it from the array to prep for a new one */
    function updateExplosion() {
        updateExplosionLimit = explosionArray.length - 1;
        for (var i = updateExplosionLimit; i >= 0; --i) {
            explosionArray[i].alpha -= 0.02;
            if (explosionArray[i].alpha <= 0) {
                stage.removeChild(explosionArray[i]);
                explosionArray.splice(i, 1);
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
            //r key to reset
            case 82: reset();
            break;  
        }  
    }    

    /* This function measures the distance between two objects using the differences
       I'm sure it's not absolutely pixel perfect but it'll work.  */
    function distanceBetween(objectOne, objectTwo) {
        difX = objectTwo.x - objectOne.x;
        difY = objectTwo.y - objectOne.y;

        //returning the final distance
        return Math.sqrt((difX*difX) + (difY*difY));
    }

    /* First this function stores the amount of enemies/bullets there are it works in conjunction
       with the variables created to hold the current enemy and bullet. Next using the previous set
       registration points it loops through and checks to see if they make contact. Finally is the same
       except with bullets/enemies if the distance is less than half tjhe enemy a collision happened and 
       it'll remove the enemy and bullet from the stage/array and finally a reset of the array incase there
       was a change in the number of bullets in the original array  */
    function collision() {
        //these store the number of bullets/enemies
        enemyAmount = enemyArray.length - 1;
        bulletAmount = bulletArray.length -1;

        //this uses the registration points set earlier(the center of enemies/player) to check if they collide
        for (var i = enemyAmount; i >= 0; --i) {
            currentEnemy = enemyArray[i];
            //checking the player/enemy collision
            if (distanceBetween(currentEnemy, ship) < 30) {
                console.log("Ahhh....I've been hit..");
                endGame();
            }
            
            //using this loop to check distance between an enemy and a bullet registration point
            for (var j = bulletAmount; j >= 0; --j) {
                currentBullet = bulletArray[j];
                //check bullet/enemy collision                
                if (distanceBetween(currentEnemy, currentBullet) < 32) {
                    stage.removeChild(currentEnemy);
                    stage.removeChild(currentBullet);
                    //here I call the explosion method to make things go boom!..
                    createExplosion(currentEnemy.x, currentEnemy.y);
                    enemyArray.splice(i, 1);
                    bulletArray.splice(j, 1);
                    console.log("Boom..");
                    //increment the score when an enemy is killed
                    scoreText.text = parseInt(scoreText.text + 10);
                    // console.log(playerScore);
                }
            }
            //reseting the array incase of a change of bullets
            bulletAmount = bulletArray.length - 1;
        }        
    }

    /* Setting a game over function to make an explosion where the player died then removing the ship.
       Finally setting the gameOver bool to true and adding an arcade like game over screen  */
    function endGame() {
        //make explosion where the ship is and remove ship
        createExplosion(ship.x, ship.y);
        stage.removeChild(ship);
        //set gameOver equal to true
        gameOver = true;                

        //set game over screen
        gameOverText = new createjs.Text("GAME OVER", "72pt bold Arial", "#CC0000");
        gameOverText.textAlign = "center";
        gameOverText.x = 320;
        gameOverText.y = 200;        
        stage.addChild(gameOverText);        

        //why...
        restartText = new createjs.Text("Press R to restart", "16pt bold Arial", "#FFFFFF");
        restartText.textAlign = "center";
        restartText.x = 320;
        restartText.y = 290;
        stage.addChild(restartText);
    }

    /* simple reset function to restart the game by press R.
       I set gameOver to false to unprove the endGame bool */
    function reset() {
        gameOver = false;
        onInit();        
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

        //checking for a game over
        if (gameOver != true) {
            //checking for collision
            collision();
            //create the enemies 
            createEnemies();
            //checking for player movement for each frame
            checkMovement();   
        }        

        //updating the background
        updateBackground();
        //call the bullet update
        updateBullets(); 
        //update the enemies 
        updateEnemies(); 
        //update explosions
        updateExplosion();                       
        // update the stage!
        stage.update();
    }

})();