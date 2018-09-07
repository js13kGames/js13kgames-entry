var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');
var terminal_window = document.getElementById("terminal-window");
var terminal_input = document.getElementById("terminal-input");
var control;
var DATA;
var GAME_OVER;
var PLAYER_VISION = 5;
var PLAYER_VISION = 15;

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
    reset();
    control.cur_scene = new MenuScene("menu");
    setInterval(gameLoop, 33);
}

function startDungeon(){
    control.changeScene(new DungeonScene(40));
}

function reset() {
    if (terminal_window) {terminal_window.value = ""};
    if (terminal_input) {terminal_input.value = ""};
    
    control = new SceneControl();
    terminal_input.focus();

    DATA = {
        "programs": ["Maintenance", "Proxy", "Denial_Of_Service", "Scavenger"],
        "scripts": ["Scan", "Refresh", "Reconnect", "Glitch", "Decrypt", "Ping", "Hack"],
        "installed": [],
        "money": 0,
        "memory": 3,
        "processing": 10
    }
    GAME_OVER = false;
}

function gameLoop() {
    control.update();
    control.draw();
}

startGame();