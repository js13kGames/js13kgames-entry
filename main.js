var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');

var terminal = document.getElementById("terminal");
terminal.value = "";

var control = new SceneControl();


function handleEvents(evt) {
    control.cur_scene.handle(evt);
}

canvas.addEventListener( 'click', handleEvents );
document.addEventListener( 'keyup', handleEvents );


function startGame(){
    control.changeScene(new DungeonScene(40));
    control.cur_scene.draw();
}

control.changeScene(new MenuScene());

control.setUpMainMenu();
control.cur_scene.draw();