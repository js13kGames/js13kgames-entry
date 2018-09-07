class Scene {
    // This is a base class, supposed to be extended
    constructor(type) { 
        this.type = type;
        this.buttons = [];
    }
    draw() {
        ctx.fillStyle = "rgb(25,25,25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    handle(evt) {
    }
    execute(cmd) {
        return;
    }
    addButton(x, y, width, height, text, fontsize, color, callback) {
        this.buttons.push(new Button(x, y, width, height, text, fontsize, color, callback));
    }
}

class MenuScene extends Scene {
    constructor(type) {
        super(type);
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
    update() {
        this.buttons = [];
        this.addButton(canvas.width/2-150, canvas.height/2-50, 300, 100,
                       "NEW GAME", 40, "green", startDungeon);
        if (GAME_OVER) {
            this.addButton(canvas.width/2-150, canvas.height/2-200, 300, 100,
                           "GAME OVER", 40, "red", startDungeon);
        }
    }
}

class DungeonScene extends Scene {
    constructor(size) {
        super("dungeon");
        this.dungeon = new DungeonGrid(size);
        this.dungeon.createDungeon();

        this.ui = [];

        this.scan = 0;
    }

    draw() {
        clearCanvas();

        var tileSize = canvas.width / this.dungeon.size;
    
        for(var y=0; y < this.dungeon.size; y++) {
            for(var x=0; x < this.dungeon.size; x++) {
                var tile = this.dungeon.getTile(x, y)
                if (Math.abs(this.dungeon.player_at.x - x) < PLAYER_VISION &&
                    Math.abs(this.dungeon.player_at.y - y) < PLAYER_VISION) {
                    // Tile in player's vision range
                    tile["fow"] = 1;
                } else if(tile["fow"] == 1) {
                    // Tile has been explored but not in player's range
                    tile["fow"] = 0;
                }

                if (tile["fow"] == 0) {
                    // Explored map
                    if ( tile["isWall"] ) {
                        ctx.fillStyle = "#14412b";
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else {
                        if (tile["isHall"]) {
                            ctx.fillStyle = '#7f9642';
                        } else {
                            ctx.fillStyle = '#262626';
                        }
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                }
                if (tile["fow"] == 1) {
                    // Visible map
                    if ( tile["isWall"] ) {
                        ctx.fillStyle = "#1f774d";
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    } else {
                        if (tile["isHall"]) {
                            ctx.fillStyle = '#caca56';
                        } else {
                            ctx.fillStyle = '#1a1a1a';
                        }
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                    
                    if (tile["trap"]) {
                        ctx.fillStyle = 'rgb(200,200,200)';
                        if (tile["trap"] == "exit") { ctx.fillStyle = 'cyan'; }
                        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                    }
                    
                    if (tile["item"]) {
                        ctx.fillStyle = 'green';
                        ctx.fillRect(x * tileSize +3, y * tileSize +3, tileSize-3, tileSize-3);
                    }
                    
                    if (tile["entity"]) {
                        if (tile["entity"].type === "player") {
                            ctx.fillStyle = 'blue';
                        }
                        if (tile["entity"].type === "enemy") {
                            ctx.fillStyle = 'orange';
                        }
                        if (tile["entity"].type === "goal") {
                            ctx.fillStyle = 'yellow';
                        }
                        ctx.fillRect(x * tileSize +1, y * tileSize +1, tileSize-1, tileSize-1);
                    }
                } else {
                }
            }
        }


        for(var b=0; b<this.buttons.length; b++) { this.buttons[b].draw(); }
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
    }

    update() {
        var latency = this.dungeon.player.latency,
            latency_text = "Latency: " + this.dungeon.player.latency + "ms";

        if (latency < 81) { var latency_level = "#0dc600"; }
        else if (latency < 171) { var latency_level = "#e0e000"; }
        else if (latency < 301) { var latency_level = "#c66600"; }
        else { var latency_level = "#ff0000"; }
        
        this.buttons = [];

        this.addButton(canvas.width-200, canvas.height-20, 200, 20, latency_text, 20, latency_level);
        this.addButton(0, canvas.height-20, 200, 20, "Version: " + DATA["version"] + "." + DATA["bits"] , 20, "#0dc600");
        this.addButton(canvas.width/2-100, canvas.height-20, 200, 20, "Level: " + DATA["level"], 20, "#0dc600");
        if (GAME_OVER) {
            this.addButton(canvas.width/2-150, canvas.height/2-50, 300, 50, "GAME OVER", 40, "red");
        }
    }
}

class SceneControl {
    constructor() {
        this.cur_scene = new MenuScene("main");
    }
    changeScene(to_scene) {
        this.cur_scene = to_scene;
    }

    update() { this.cur_scene.update() }
    draw() { this.cur_scene.draw() }
}