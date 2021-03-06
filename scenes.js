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
        for(var b=0; b<this.buttons.length; b++) { this.buttons[b].draw(); }
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
                        if (DATA["level"] % 40 <= 10) { ctx.fillStyle = "#14412b";
                        } else if (DATA["level"] % 40 <= 20) { ctx.fillStyle = "#043363";
                        } else if (DATA["level"] % 40 <= 30) { ctx.fillStyle = "#7d3232";
                        } else if (DATA["level"] % 40 <= 40) { ctx.fillStyle = "#404040"; }
                    } else if (tile["isHall"]) {
                        if (DATA["level"] % 40 <= 10) { ctx.fillStyle = "#71c96e";
                        } else if (DATA["level"] % 40 <= 20) { ctx.fillStyle = "#4f6ac4";
                        } else if (DATA["level"] % 40 <= 30) { ctx.fillStyle = "#b96868";
                        } else if (DATA["level"] % 40 <= 40) { ctx.fillStyle = "#b1b1b1"; }
                    } else {
                        ctx.fillStyle = '#262626';
                    }
                    ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);

                    if (tile["entity"]) {
                        if (tile["entity"].type === "goal") {
                            var grd=ctx.createLinearGradient(x*TILESIZE, y*TILESIZE,(x+1)*TILESIZE,(y+1)*TILESIZE);
                            grd.addColorStop(0,"#000a57");
                            grd.addColorStop(1,"#880073");
                            ctx.fillStyle = grd;
                            ctx.beginPath();
                            ctx.arc(x*TILESIZE+TILESIZE/2, y*TILESIZE+TILESIZE/2, TILESIZE/2-2, 0, 2*Math.PI);
                            ctx.fill();
                        }
                    }
                }
                if (tile["fow"] == 1) {
                    // Visible map
                    if ( tile["isWall"] ) {
                        if (DATA["level"] % 40 <= 10) { ctx.fillStyle = "#1f774d";
                        } else if (DATA["level"] % 40 <= 20) { ctx.fillStyle = "#075db6";
                        } else if (DATA["level"] % 40 <= 30) { ctx.fillStyle = "#af4646";
                        } else if (DATA["level"] % 40 <= 40) { ctx.fillStyle = "#5c5c5c"; }
                    } else if (tile["isHall"]) {
                        if (DATA["level"] % 40 <= 10) { ctx.fillStyle = "#b1e1b0";
                        } else if (DATA["level"] % 40 <= 20) { ctx.fillStyle = "#a0afdf";
                        } else if (DATA["level"] % 40 <= 30) { ctx.fillStyle = "#d9aeae";
                        } else if (DATA["level"] % 40 <= 40) { ctx.fillStyle = "#d5d5d5"; }
                    } else {
                        ctx.fillStyle = '#1a1a1a';
                    }
                    ctx.fillRect(x * TILESIZE, y * TILESIZE, TILESIZE, TILESIZE);
                    
                    if (tile["trap"]) {
                        ctx.fillStyle = 'rgb(200,200,200)';
                        if (tile["trap"] == "exit") {
                            ctx.fillStyle = "#b0b0b0"
                            ctx.strokeStyle = "#333333"
                            ctx.lineWidth = 2;
                            ctx.beginPath();
                            ctx.arc(x*TILESIZE+TILESIZE/2, y*TILESIZE+TILESIZE/2, TILESIZE/2-2, 0, 2*Math.PI);
                            ctx.fill();
                            ctx.stroke();
                        } else {
                            var grd=ctx.createLinearGradient(x*TILESIZE, y*TILESIZE,(x+1)*TILESIZE,(y+1)*TILESIZE);
                            grd.addColorStop(0.2,"#770000");
                            grd.addColorStop(0.5,"red");
                            grd.addColorStop(0.8,"#770000");
                            ctx.fillStyle = grd;
                            ctx.beginPath();
                            ctx.arc(x*TILESIZE+TILESIZE/2, y*TILESIZE+TILESIZE/2, TILESIZE/2-2, 0, 2*Math.PI);
                            ctx.fill();
                        }
                    }
                    
                    if (tile["item"]) {
                        if (tile['item'] == "password") {
                            ctx.fillStyle = "#f9dd00";
                            ctx.beginPath();
                            ctx.arc(x*TILESIZE+TILESIZE/2, y*TILESIZE+TILESIZE/2, TILESIZE/2-4, 0, 2*Math.PI);
                            ctx.fill();
                        } else if (PROGRAM_LIST.indexOf(tile['item']) > -1) {
                            var grd=ctx.createLinearGradient(x*TILESIZE+2, y*TILESIZE+2,(x+1)*TILESIZE-2,(y+1)*TILESIZE-2);
                            grd.addColorStop(0,"#9a9a9a");
                            grd.addColorStop(0.4,"#d5d5d5");
                            grd.addColorStop(0.45,"yellow");
                            grd.addColorStop(0.5,"green");
                            grd.addColorStop(0.55,"red");
                            grd.addColorStop(0.6,"#9a9a9a");
                            grd.addColorStop(1,"#d5d5d5");
                            ctx.fillStyle = grd;
                            ctx.beginPath();
                            ctx.arc(x*TILESIZE+TILESIZE/2, y*TILESIZE+TILESIZE/2, TILESIZE/2-4, 0, 2*Math.PI);
                            ctx.fill();
                        } else {
                            ctx.fillStyle = "black";
                            ctx.strokeStyle = "white";
                            ctx.lineWidth = 1;
                            ctx.fillRect(x*TILESIZE+3, y*TILESIZE+3, TILESIZE-3, TILESIZE-3);
                            ctx.beginPath();
                            ctx.moveTo(x*TILESIZE+4, y*TILESIZE+4)
                            ctx.lineTo(x*TILESIZE+8, y*TILESIZE+8)
                            ctx.lineTo(x*TILESIZE+4, y*TILESIZE+12)
                            ctx.moveTo(x*TILESIZE+8, y*TILESIZE+12)
                            ctx.lineTo(x*TILESIZE+14, y*TILESIZE+12)
                            ctx.stroke();
                        }
                    }
                    
                    if (tile["entity"]) {
                        if (tile["entity"].type === "player") {
                            ctx.fillStyle = "#4e73ff";
                            ctx.fillRect(x*TILESIZE+2, y*TILESIZE+2, TILESIZE-4, TILESIZE-4);
                        }
                        if (tile["entity"].type === "enemy") {
                            if (tile["entity"]._class == "common") {
                                ctx.fillStyle = "#752669";
                                ctx.fillRect(x*TILESIZE+2, y*TILESIZE+2, TILESIZE-4, TILESIZE-4);
                            } else if (tile["entity"]._class == "tough") {
                                ctx.fillStyle = "#752669";
                                ctx.fillRect(x*TILESIZE+2, y*TILESIZE+2, TILESIZE-4, TILESIZE-8);
                                ctx.beginPath();
                                ctx.moveTo(x*TILESIZE+2, y*TILESIZE+9);
                                ctx.lineTo(x*TILESIZE+TILESIZE/2, (y+1)*TILESIZE);
                                ctx.lineTo((x+1)*TILESIZE-2, y*TILESIZE+9);
                                ctx.lineTo(x*TILESIZE+2, y*TILESIZE+9);
                                ctx.fill();
                            } else if (tile["entity"]._class == "glass") {
                                ctx.fillStyle = "#752669";
                                ctx.fillRect(x*TILESIZE+4, y*TILESIZE+2, TILESIZE-8, TILESIZE-4);
                            } else if (tile["entity"]._class == "vamp") {
                                ctx.fillStyle = "#752669";
                                ctx.beginPath();
                                ctx.moveTo(x*TILESIZE+2, y*TILESIZE+2);
                                ctx.lineTo(x*TILESIZE+TILESIZE/2, (y+1)*TILESIZE);
                                ctx.lineTo((x+1)*TILESIZE-2, y*TILESIZE+2);
                                ctx.lineTo(x*TILESIZE+2, y*TILESIZE+2);
                                ctx.fill();
                            } else if (tile["entity"]._class == "explosive") {
                                ctx.fillStyle = "#752669";
                                ctx.moveTo(x*TILESIZE+TILESIZE/2, y*TILESIZE);
                                ctx.lineTo(x*TILESIZE, y*TILESIZE+TILESIZE/2);
                                ctx.lineTo(x*TILESIZE+TILESIZE/2, (y+1)*TILESIZE);
                                ctx.lineTo((x+1)*TILESIZE, y*TILESIZE+TILESIZE/2);
                                ctx.lineTo(x*TILESIZE+TILESIZE/2, y*TILESIZE);
                                ctx.fill();
                            } else if (tile["entity"]._class == "poison") {
                                ctx.fillStyle = "#752669";
                                ctx.moveTo(x*TILESIZE+TILESIZE/2, y*TILESIZE);
                                ctx.lineTo(x*TILESIZE, y*TILESIZE+TILESIZE/2);
                                ctx.lineTo((x+1)*TILESIZE, y*TILESIZE+TILESIZE/2);
                                ctx.lineTo(x*TILESIZE+TILESIZE/2, y*TILESIZE);
                                ctx.fill();
                            }
                        }
                        if (tile["entity"].type === "goal") {
                            var grd=ctx.createLinearGradient(x*TILESIZE, y*TILESIZE,(x+1)*TILESIZE,(y+1)*TILESIZE);
                            grd.addColorStop(0,"#0013a0");
                            grd.addColorStop(1,"#f300ce");
                            ctx.fillStyle = grd;
                            ctx.beginPath();
                            ctx.arc(x*TILESIZE+TILESIZE/2, y*TILESIZE+TILESIZE/2, TILESIZE/2-2, 0, 2*Math.PI);
                            ctx.fill();
                        }
                        if (tile["entity"].type === "firewall") {
                            var grd=ctx.createLinearGradient(x*TILESIZE + TILESIZE/2, y*TILESIZE,(x+1)*TILESIZE+TILESIZE/2,(y+1)*TILESIZE);
                            grd.addColorStop(0,"orange");
                            grd.addColorStop(1,"red");
                            ctx.fillStyle = grd;
                            ctx.fillRect(x*TILESIZE, y*TILESIZE, TILESIZE, TILESIZE);
                        }
                    }
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
        var latency_text = "Latency: " + DATA["latency"] + "ms";

        if (DATA["latency"] < 81) { var latency_level = "#0dc600"; }
        else if (DATA["latency"] < 171) { var latency_level = "#e0e000"; }
        else if (DATA["latency"] < 301) { var latency_level = "#c66600"; }
        else { var latency_level = "#ff0000"; }
        
        this.buttons = [];

        this.addButton(canvas.width-200, canvas.height-20, 200, 20, latency_text, 20, latency_level);
        this.addButton(0, canvas.height-20, 200, 20, "Version: " + DATA["version"] + "." + DATA["bits"] , 20, "#0dc600");
        this.addButton(canvas.width/2-100, canvas.height-20, 200, 20, "Level: " + DATA["level"], 20, "#0dc600");
        this.addButton(0, canvas.height-40, 200, 20, "Pass: " + DATA["passwords"], 20, "#0dc600");
        this.addButton(canvas.width-200, canvas.height-40, 200, 20, "Mem: " + DATA["installed"].length + "/3" , 20, "#0dc600");
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