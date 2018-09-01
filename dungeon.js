
class DungeonGrid {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.rooms = [];
        this.halls = [];
        this.player_at = null;

        for (var y=0; y<size; y++) {
            this.grid[y] = [];
            for (var x=0; x<size; x++) {
                this.grid[y][x] = {"isWall": true, "entity": null, "items": []};
            }
        }
    }

    createDungeon(maxLeafSize=10) {
        // Uses the BSP module to generate a dungeon and set it on the grid array.
        var root = new Leaf(0, 0, this.size, this.size);
        var all_leaves = [root];
    
        var splitted = true;
        // Loop until no more Leafs can be split
        while (splitted) {
            for (i=0; i < all_leaves.length; i++) {
                var cur_leaf = all_leaves[i];
                if(!cur_leaf.lChild && !cur_leaf.rChild) {
                    var a = [cur_leaf.width > maxLeafSize,cur_leaf.height > maxLeafSize];
                    // Leaf has not been split
                    if(cur_leaf.width > maxLeafSize || cur_leaf.height > maxLeafSize || Math.random() > 0.25) {
                        // If the leaf is greater than the max size... or a 75% chance
                        if(cur_leaf.split()) {
                            // Successful split
                            all_leaves.push(cur_leaf.lChild);
                            all_leaves.push(cur_leaf.rChild);
                            splitted = true;
                        }
                    }
                }
            }
            splitted = false;
        }
        
        root.createRooms(this.halls, this.rooms);

        // Set the grid elements as walls or not walls.
        for(var i=0; i<all_leaves.length; i++) {
            if(all_leaves[i].room) {
                var points = all_leaves[i].room.asPointArray();
                for(var p=0; p<points.length; p++) {
                    var X = points[p][0],
                        Y = points[p][1];
                    this.grid[Y][X]["isWall"] = false;
                }
            }
        }
        
        for(var i=0; i<this.halls.length; i++) {
            var points = this.halls[i].asPointArray();
            for(var p=0; p<points.length; p++) {
                var X = points[p][0],
                    Y = points[p][1];
                this.grid[Y][X]["isWall"] = false;
            }
        }
    }

    addEntity(ent, point) {
        this.grid[ point[1] ][ point[0] ]["entity"] = ent;
    }

    addPlayer() {
        // Creates a player object at a random location inside a random room.
        var rand_room = this.rooms[ randint(0, this.rooms.length) ];
        var rand_point = rand_room.randomPoint();

        this.player_at = rand_point;
        this.addEntity("player", rand_point);
    }

    moveEntity(from, to) {
        var entity = this.grid[from[1]][from[0]]["entity"];

        if (entity) {
            if (this.grid[to[1]][to[0]]["isWall"]) {
                return;
            } else {
                this.grid[from[1]][from[0]]["entity"] = null;
                this.grid[to[1]][to[0]]["entity"] = entity;
                if (entity == "player") {
                    this.player_at = to;
                }
            }
        }
        return;

    }

    handleKeyUp(evt) {
        if (!this.player_at) { return; } // There is no player to move
        switch (evt.key) {
            case "ArrowUp": {
                this.moveEntity(this.player_at, [ this.player_at[0], this.player_at[1]-1 ])
                break;
            }
            case "ArrowLeft": {
                this.moveEntity(this.player_at, [ this.player_at[0]-1, this.player_at[1] ])
                break;
            }
            case "ArrowDown": {
                this.moveEntity(this.player_at, [ this.player_at[0], this.player_at[1]+1 ])
                break;
            }
            case "ArrowRight": {
                this.moveEntity(this.player_at, [ this.player_at[0]+1, this.player_at[1] ])
                break;
            }
        }
    }

}


function drawDungeon(canvas, ctx, dungeon) {
    var tileSize = canvas.width / dungeon.size;

    for(var y=0; y < dungeon.size; y++) {
        for(var x=0; x < dungeon.size; x++) {
            var tile = dungeon.grid[y][x]
            if ( tile["isWall"] ) {
                ctx.strokeStyle = "gray";
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }

            if (tile["entity"] === "player") {
                ctx.fillStyle = 'blue';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}