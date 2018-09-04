var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');
var terminal_window = document.getElementById("terminal-window");
var terminal_input = document.getElementById("terminal-input");
var control;
var DATA;
var GAME_OVER;
var PLAYER_VISION = 4;

reset();

canvas.addEventListener( 'click', handleEvents );
document.addEventListener( 'keyup', handleEvents );


function handleEvents(evt) {
    if( GAME_OVER && (evt.type == "keyup" || evt.type == "click") ) { reset(); }
    if(evt.key === "Enter") { user_command(); }
    if(evt.key === "Escape") { terminal_input.focus(); }
    control.cur_scene.handle(evt)
}

function startGame(){
    control.setUpNewGame();
    control.cur_scene.draw();
}

function startDungeon(){
    control.changeScene(new DungeonScene(40));
    control.cur_scene.draw();
}

function reset() {
    if (terminal_window) {terminal_window.value = ""};
    if (terminal_input) {terminal_input.value = ""};
    
    control = new SceneControl();    
    control.setUpMainMenu();
    control.cur_scene.draw();
    terminal_input.focus();

    DATA = {
        "programs": [],
        "scripts": ["Refresh"],
        "installed": [],
        "money": 0,
        "memory": 3,
        "processing": 10,
    }
    GAME_OVER = false;
}