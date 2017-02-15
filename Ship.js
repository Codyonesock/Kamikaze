// var Ship = function(assetManager, stage) {
//     //custom event
//     var eventScreenComplete = new createjs.Event("shipMoving");    

//     //construct a container object
//     var screen = new createjs.Container();    

//     //add background to the screen
//     var background = assetManager.getSprite("uiAssets");
//     background.gotoAndStop("shipMoving");
//     screen.addChild(background);
    
//     //add button to this screen
//     var hitAreaSprite = assetManager.getSprite("uiAssets");
//     var ship = assetManager.getSprite("uiAssets");    
//     ship.gotoAndStop("Alive");
//     ship.x = 110;
//     ship.y = 200;    
//     screen.addChild(ship);  
                        
//     //-------------------------------------------public methods
//     this.showMe = function() {        
//         stage.addChild(screen);
//     };

//     this.hideMe = function() {
//         stage.removeChild(screen);
//     };       
// };