class Scene {
    // This is a base class, supposed to be extended
    constructor(type) { 
        this.type = type;
        this.buttons = [];
        this.ani = [];
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
        for(var b=0; b<this.buttons.length; b++) { this.buttons[b].draw(); }
        for(var a=0; a<this.ani.length; a++) { this.ani[a].draw(); if(this.ani[a].destroy) { this.ani.splice(a, 1); } }
    }
    handle() {
        // When a click event is generated, checks if the user has clicked
        // on a button.
        if (click) {
            for(var b=0; b<this.buttons.length; b++){
                var button = this.buttons[b];
                if( button.callback && button.hasPoint(click_at) ) {
                    button.callback();
                }
            }
            click = false;
        }
    }
    update() {
        this.buttons = [];
        this.addButton(canvas.width/2-150, canvas.height/2-50, 300, 100,
                       "NEW GAME", 40, "green", startDungeon);
    }
}

class DungeonScene extends Scene {
    constructor(size) {
        super("dungeon");
        this.dungeon = new DungeonGrid(size);
        this.dungeon.createDungeon();

        TILESIZE = canvas.width / size;

        this.scan = 0;
    }

    draw() {
        clearCanvas();
    
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
                    } else if (tile["isHall"]) {
                        ctx.fillStyle = '#7f9642';
                    } else {
                        ctx.fillStyle = '#262626';
                    }
                    ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);

                    if (tile["entity"]) {
                        if (tile["entity"].type === "goal") {
                            ctx.fillStyle = '#562a7c';
                        }
                        ctx.fillRect(x * TILESIZE +1, y * TILESIZE +1, TILESIZE-1, TILESIZE-1);
                    }
                }
                if (tile["fow"] == 1) {
                    // Visible map
                    if ( tile["isWall"] ) {
                        ctx.fillStyle = "#1f774d";
                    } else if (tile["isHall"]) {
                        ctx.fillStyle = '#caca56';
                    } else {
                        ctx.fillStyle = '#1a1a1a';
                    }
                    ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
                    
                    if (tile["trap"]) {
                        ctx.fillStyle = 'rgb(200,200,200)';
                        if (tile["trap"] == "exit") { ctx.fillStyle = 'cyan'; }
                        ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
                    }
                    
                    if (tile["item"]) {
                        ctx.fillStyle = 'green';
                        if (tile['item'] == "password") { ctx.fillStyle = 'yellow'; }
                        ctx.fillRect(x * TILESIZE +3, y * TILESIZE +3, TILESIZE-3, TILESIZE-3);
                    }
                    
                    if (tile["entity"]) {
                        if (tile["entity"].type === "player") {
                            ctx.fillStyle = 'blue';
                        }
                        if (tile["entity"].type === "enemy") {
                            ctx.fillStyle = 'orange';
                        }
                        if (tile["entity"].type === "goal") {
                            ctx.fillStyle = 'purple';
                        }
                        if (tile["entity"].type === "firewall") {
                            ctx.fillStyle = 'red';
                        }
                        ctx.fillRect(x * TILESIZE +1, y * TILESIZE +1, TILESIZE-1, TILESIZE-1);
                    }
                } 
                if (tile["isDoor"]) {
                    ctx.fillStyle = '#725337';
                    ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
                }
            }
        }


        for(var b=0; b<this.buttons.length; b++) { this.buttons[b].draw(); }
    }

    handle() {
        if (!this.dungeon.player_at) { return; }

        var noMovement = false,
            to = new Vector(this.dungeon.player_at);

        if (keys['left']) { to.add(-1, 0);
        } else if (keys['up']) { to.add(0, -1);
        } else if (keys['right']) { to.add(1, 0);
        } else if (keys['down']) { to.add(0, 1);
        } else { noMovement = true; }
        if (!noMovement) { this.dungeon.movePlayer(to); }
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
            var alpha = GO_timer / 3000;
            this.addButton(canvas.width/2-150, canvas.height/2-50, 300, 50, "GAME OVER", 40, 'rgba(255,0,0,' + alpha + ")");
            if (GO_timer > 3000) {
                this.addButton(canvas.width/2-150, canvas.height/2, 300, 50, "Press any key to start again.", 16, 'rgba(255,0,0,' + alpha/2 + ")");
            }
        }
    }
}

class SceneControl {
    constructor() {
        this.cur_scene = new MenuScene("main");
        this.ani = [];
    }
    changeScene(to_scene) {
        this.cur_scene = to_scene;
    }

    update() { this.cur_scene.update() }
    draw() {
        this.cur_scene.draw();
        for(var a=0; a<this.ani.length; a++) { this.ani[a].draw(); if(this.ani[a].destroy) { this.ani.splice(a, 1); } }
    }
}