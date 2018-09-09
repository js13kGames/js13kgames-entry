var canvas = document.getElementById("screen"),
    D_SIZE = 600,
    ctx = canvas.getContext('2d'),
    terminal_window = document.getElementById("terminal-window"),
    terminal_input = document.getElementById("terminal-input"),
    control,
    DATA,
    GAME_OVER,
    PLAYER_VISION = 5,
    gameloop,
    EXP_TO_LEVEL = 100,
    interval = 90,
    GO_timer = 0;
    delta = 0;
    TILESIZE = 15,
    keys = {"left": false, "up": false, "right": false, "down": false},
    click_at = null,
    click = false,
    sprites = new Image();

sprites.src = 'sprites.png';

reset();

canvas.addEventListener( 'click', handler );
document.addEventListener( 'keyup', handler);
document.addEventListener( 'keydown', handler);

function handler(evt) {
    if (evt.type == "keyup" || evt.type == "keydown" && [37,38,39,40].indexOf(evt.keyCode)) {
        evt.preventDefault();
    }
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
    gameloop = setInterval(gameLoop, interval);
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
        "latency": 80,
        "programs": [],
        "scripts": [],
        "installed": [],
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

    if (GAME_OVER) { GO_timer += interval; }
    delta += interval;
}

startGame();
