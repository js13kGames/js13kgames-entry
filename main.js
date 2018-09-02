var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');

var terminal_window = document.getElementById("terminal-window");
var terminal_cli = document.getElementById("terminal-cli");
if (terminal_window) {terminal_window.value = ""};
if (terminal_cli) {terminal_cli.value = ""};

var control = new SceneControl();


function handleEvents(evt) {
    control.cur_scene.handle(evt);
}

canvas.addEventListener( 'click', handleEvents );
document.addEventListener( 'keyup', handleEvents );


function startGame(){
    control.setUpNewGame();
    control.cur_scene.draw();
}

function startDungeon(){
    control.changeScene(new DungeonScene(40));
    control.cur_scene.draw();
}

control.changeScene(new MenuScene());

control.setUpMainMenu();
control.cur_scene.draw();