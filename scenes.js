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
    execute(cmd) {
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
            "memory": 3
        }
    }
    execute(cmd) {
        if (cmd == "ls programs" || cmd == "ls programs/") {
            print_message("Available programs:");
            print_message(control.cur_scene.data["programs"]);
        }
        if (cmd == "ls scripts" || cmd == "ls scripts/") {
            print_message("Available scripts:");
            print_message(control.cur_scene.data["scripts"]);
        }
        if (cmd == "ls installed" || cmd == "ls installed/") {
            print_message("Programs installed:");
            print_message(control.cur_scene.data["installed"]);
        }
        if (cmd.startsWith("install ")) {
            var program = cmd.slice(8),
                index = findInArray(program, this.data["programs"]);

            if (index === null) {
                print_message("There's no program named " + program);
                return;
            }

            if (this.data["installed"].length === this.data["memory"]) {
                print_message("There's no memory available, try uninstalling another program");
                return;
            }

            if (findInArray(program, this.data["installed"]) != null) {
                print_message("Program " + program + " is already installed");
                return;
            }

            this.data["installed"].push(this.data["programs"][index]);
            print_message("Successfully installed " + program);
        }

        if (cmd.startsWith("uninstall ")) {
            var program = cmd.slice(10),
                index = findInArray(program, this.data["installed"]);
            if (index === null) { print_message("Program " + program + " is not installed."); }

            this.data["installed"].splice(index, 1);
            print_message("Successfully uninstalled " + program);
        }

        if (cmd.startsWith("sell ")) {
            var program = cmd.slice(5),
                index = findInArray(program, this.data["programs"]),
                installed_index = findInArray(program, this.data["installed"]);

            if (index === null) {
                print_message("There's no program named " + program);
                return;
            }

            if (installed_index != null) {
                print_message("Uninstalling " + program);
                this.data["installed"].splice(installed_index, 1);
            }
            print_message("Sucessfully sold " + program + " for 100$")
            this.data["programs"].splice(index, 1);
            this.data["money"] += 100;

        }
    }
}

class DungeonScene extends Scene {
    constructor(data, size) {
        super();
        this.dungeon = new DungeonGrid(size);
        this.dungeon.createDungeon();
        this.dungeon.addPlayer();

        // this.data = {
        //     "programs_running": data["installed"],
        //     "programs_found": [],
        //     "scripts": data["scripts"],
        //     "media": 0,
        //     "memory": data["memory"]
        // }
    }

    draw() {
        clearCanvas();

        var tileSize = canvas.width / this.dungeon.size;
    
        for(var y=0; y < this.dungeon.size; y++) {
            for(var x=0; x < this.dungeon.size; x++) {
                var tile = this.dungeon.getTile(x, y)

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

                if (tile["items"].length > 0) {
                    ctx.fillStyle = 'cyan';
                    ctx.fillRect(x * tileSize +3, y * tileSize +3, tileSize-3, tileSize-3);
                }
    
                if (tile["entity"]) {
                    if (tile["entity"].type === "player") {
                        ctx.fillStyle = 'blue';
                    }
                    if (tile["entity"].type === "enemy") {
                        ctx.fillStyle = 'orange';
                    }
                    ctx.fillRect(x * tileSize +1, y * tileSize +1, tileSize-1, tileSize-1);
                }
            }
        }

        var latency = this.dungeon.player.latency,
            latency_text = "Latency: " + this.dungeon.player.latency + "ms";
        if (latency < 81) { var latency_level = "#0dc600"; }
        else if (latency < 171) { var latency_level = "#e0e000"; }
        else if (latency < 301) { var latency_level = "#ff0000"; }
        

        var latency_label = new Button(canvas.width-200, canvas.height-20, 200, 20, latency_text, latency_level);
        latency_label.draw("20px");
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