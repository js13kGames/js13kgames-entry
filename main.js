var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');
var terminal_window = document.getElementById("terminal-window");
var terminal_input = document.getElementById("terminal-input");
var control;
var DATA;
var GAME_OVER;
var PLAYER_VISION = 5;
var gameloop;
var EXP_TO_LEVEL = 100;
var FPS = 90;
var GO_timer = 0; // Game over timer
var delta = 0; // Game over timer
var TILESIZE = 15;
var keys = {"left": false, "up": false, "right": false, "down": false};
var click_at = null;
var click = false;

reset();

canvas.addEventListener( 'click', handler );
document.addEventListener( 'keyup', handler);
document.addEventListener( 'keydown', handler);

function handler(evt) {
    if (evt.type == "click") {
        click_at = getCursorPosition(canvas, evt);
        click = true;
    }
    if( GAME_OVER && GO_timer > 5000 && (evt.type == "keyup" || evt.type == "click") ) {
        GAME_OVER = false;
        startGame();
    }
    if (!GAME_OVER) {
        var press = evt.type == "keydown";
        if (evt.keyCode == 37) { keys['left'] = press }
        if (evt.keyCode == 38) { keys['up'] = press }
        if (evt.keyCode == 39) { keys['right'] = press }
        if (evt.keyCode == 40) { keys['down'] = press }

        if(evt.key === "Enter") { user_command(); }
        if(evt.key === "Escape") { terminal_input.focus(); }
    }
}

function startGame(){
    reset();
    control.changeScene(new MenuScene("menu"));
    if (gameloop) { clearInterval(gameloop); }
    gameloop = setInterval(gameLoop, FPS);
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
        "programs": [],
        "scripts": ["Scan", "Refresh", "Reconnect", "Glitch", "Decrypt", "Ping", "Hack"],
        "installed": ["Maintenance", "Proxy", "Denial_Of_Service", "Scavenger"],
        "bits": 0,
        "version": 1,
        "memory": 3,
        "level": 1,
        "passwords": 0
    }
}

function gameLoop() {
    control.cur_scene.handle()
    control.update();
    control.draw();

    if (GAME_OVER) { GO_timer += FPS; }
    delta += FPS;
}

startGame();
