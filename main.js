var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');


var terminal_window = document.getElementById("terminal-window");
var terminal_input = document.getElementById("terminal-input");
if (terminal_window) {terminal_window.value = ""};
if (terminal_input) {terminal_input.value = ""};

var previous_commands = [];


var control = new SceneControl();


function handleEvents(evt) {
    if(evt.key === "Enter") { user_command(); }
    control.cur_scene.handle(evt)
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
terminal_input.focus();