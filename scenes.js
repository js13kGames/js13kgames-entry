class Scene {
    // This is a base class, supposed to be extended
    constructor() { 
    }
    draw() {
        ctx.fillStyle = "rgb(25,25,25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    handle(evt) {
    }
    execute_command(cmd) {
        return;
    }
}

class MenuScene extends Scene {
    constructor() {
        super();
        this.buttons = [];
    }
    draw() {
        clearCanvas();
        for(var b=0; b<this.buttons.length; b++) {
           this.buttons[b].draw();
        }
    }
    handle(evt) {
        // When a click event is generated, checks if the user has clicked
        // on a button.
        var clicked_at = getCursorPosition(canvas, evt);

        for(var b=0; b<this.buttons.length; b++){
            var button = this.buttons[b];
            if( button.callback && button.hasPoint(clicked_at) ) {
                button.callback();
            }
        }
    }
    addButton(x, y, width, height, text, color, callback) {
        var button = new Button(x, y, width, height, text, color, callback);
        this.buttons.push(button);
    } 
}

class MissionScene extends MenuScene {
    constructor() {
        super();
        this.buttons = [];

        this.data = {
            "programs": [],
            "scripts": [],
            "installed": [],
            "money": 0,
            "memory": 8
        }
    }
}

class DungeonScene extends Scene {
    constructor(size) {
        super();
        this.dungeon = new DungeonGrid(size);
        this.dungeon.createDungeon();
        this.dungeon.addPlayer();
    }

    draw() {
        clearCanvas();

        var tileSize = canvas.width / this.dungeon.size;
    
        for(var y=0; y < this.dungeon.size; y++) {
            for(var x=0; x < this.dungeon.size; x++) {
                var tile = this.dungeon.grid[y][x]

                if ( tile["isWall"] ) {
                    ctx.strokeStyle = "gray";
                    ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
                } else {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }

                if (tile["trap"]) {
                    ctx.fillStyle = 'rgb(200,200,200)';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
    
                if (tile["entity"]) {
                    if (tile["entity"].type === "player") {
                        ctx.fillStyle = 'blue';
                    }
                    if (tile["entity"].type === "enemy") {
                        ctx.fillStyle = 'orange';
                    }
                    ctx.fillRect(x * tileSize + 1, y * tileSize + 1, tileSize - 1, tileSize - 1);
                }

                if (tile["items"].length > 0) {
                    ctx.fillStyle = 'cyan';
                    ctx.fillRect(x * tileSize + 2, y * tileSize + 2, tileSize - 2, tileSize - 2);
                }
            }
        }
    }

    handle(evt) {
        if (evt.type == "keyup") {
            if (!this.dungeon.player_at) { return; } // There is no player to move
    
            // Flag so only the arrows keys will raise a turn execution.
            var noMovement = false,
                from = this.dungeon.player_at,
                to = new Vector(this.dungeon.player_at);
    
            switch (evt.key) {
                case "ArrowUp": {
                    to.add(0, -1);
                    break;
                }
                case "ArrowLeft": {
                    to.add(-1, 0);
                    break;
                }
                case "ArrowDown": {
                    to.add(0, 1);
                    break;
                }
                case "ArrowRight": {
                    to.add(1, 0);
                    break;
                }
                default: {
                    noMovement = true;
                }
            }
            if (!noMovement) {
                this.dungeon.moveEntity(from, to);
                this.dungeon.executeTurn();
            }
        }
        this.draw();
    }
}

class SceneControl {
    constructor() {
        this.cur_scene = null;
    }
    changeScene(to_scene) {
        this.cur_scene = to_scene;
    }

    setUpMainMenu() {
        this.cur_scene = new MenuScene();
        this.cur_scene.addButton(canvas.width/2-100, canvas.height/2-50, 200, 100,
                                 "START", "purple", startGame);
    }

    setUpNewGame() {
        this.cur_scene = new MissionScene();
        this.cur_scene.addButton(canvas.width/2-175, 25, 350, 100,
                                 "MISSION 1", "yellow", startDungeon);
        this.cur_scene.addButton(canvas.width/2-175, 145, 350, 100,
                                 "MISSION 2", "yellow", startDungeon);
        this.cur_scene.addButton(canvas.width/2-175, 265, 350, 100,
                                 "MISSION 3", "yellow", startDungeon);
    }
}