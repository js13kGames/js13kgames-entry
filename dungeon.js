
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
                    var point = points[p];
                    this.grid[point.y][point.x]["isWall"] = false;
                }
            }
        }
        
        for(var i=0; i<this.halls.length; i++) {
            var points = this.halls[i].asPointArray();
            for(var p=0; p<points.length; p++) {
                var point = points[p];
                this.grid[point.y][point.x]["isWall"] = false;
            }
        }

        this.populateDungeon();
    }

    populateDungeon() {
        var enemies_to_spawn = this.size / 4;

        while(enemies_to_spawn > 0) {
            var rand_point = this.randomPointInRoom();
            if (this.grid[rand_point.y][rand_point.x]["entity"] === null) {
                this.addEntity(new Enemy(this, rand_point), rand_point);
                enemies_to_spawn--;
            }
        }
    }

    addEntity(ent, point) {
        this.grid[ point.y ][ point.x ]["entity"] = ent;
    }

    randomPointInRoom() {
        var rand_room = this.rooms[ randint(0, this.rooms.length) ];
        return rand_room.randomPoint();
    }

    addPlayer() {
        // Creates a player object at a random location inside a random room.
        var rand_point = this.randomPointInRoom();
        this.player_at = rand_point;
        this.addEntity(new Player(this, rand_point), rand_point);
    }

    moveEntity(from, to) {
        var entity = this.grid[from.y][from.x]["entity"];

        if (entity) {
            if (this.grid[to.y][to.x]["isWall"]) {
                // Trying to move into a wall
                return;
            } else {

                var from_tile = this.grid[from.y][from.x], 
                    to_tile = this.grid[to.y][to.x];

                if (to_tile["entity"]) {
                    from_tile["entity"].interactWith(to_tile["entity"]);
                } else {
                    from_tile["entity"] = null;
                    to_tile["entity"] = entity;
                    if (entity.type == "player") {
                        this.player_at = to;
                    }
                }
            }
        }
        return;

    }
}