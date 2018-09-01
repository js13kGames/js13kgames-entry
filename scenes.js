class Scene {
    // This is a base class, supposed to be extended
    constructor(canvas, ctx) { 
        this.canvas = canvas;
        this.ctx = ctx;
    }
    draw() {
        this.ctx.fillStyle = "rgb(25,25,25)";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    handle(evt) {
    }
}

class MenuScene extends Scene {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.buttons = [];
    }
    draw() {
        clearCanvas(this.canvas, this.ctx);
        for(var b=0; b<this.buttons.length; b++) {
           this.buttons[b].draw(this.ctx);
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

class DungeonScene extends Scene {
    constructor(canvas, ctx, size) {
        super(canvas, ctx);
        this.dungeon = new DungeonGrid(size);
        this.dungeon.createDungeon();
        this.dungeon.addPlayer();
    }

    draw() {
        clearCanvas(this.canvas, this.ctx);

        var tileSize = this.canvas.width / this.dungeon.size;
    
        for(var y=0; y < this.dungeon.size; y++) {
            for(var x=0; x < this.dungeon.size; x++) {
                var tile = this.dungeon.grid[y][x]

                if ( tile["isWall"] ) {
                    this.ctx.strokeStyle = "gray";
                    this.ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
                } else {
                    this.ctx.fillStyle = 'white';
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
    
                if (tile["entity"] === "player") {
                    this.ctx.fillStyle = 'blue';
                    this.ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }

    handle(evt) {
        this.dungeon.handleKeyUp(evt);
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
}