
class DungeonGrid {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.rooms = [];
        this.halls = [];
        this.entities = [];
        this.player_at = null;

        for (var y=0; y<size; y++) {
            this.grid[y] = [];
            for (var x=0; x<size; x++) {
                this.grid[y][x] = {"isWall": true, "entity": null, "trap": null, "items": []};
            }
        }
    }

    getTile(x_or_vec, y=null) {
        if (y != null) {
            // Coordinates are not in the grid
            if(y < 0 || y >= this.size || x_or_vec < 0 || x_or_vec >= this.size) { return; }

            return this.grid[y][x_or_vec];
        } else {
            return this.getTile(x_or_vec.x, x_or_vec.y);
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
                    this.getTile(point)["isWall"] = false;
                }
            }
        }
        
        for(var i=0; i<this.halls.length; i++) {
            var points = this.halls[i].asPointArray();
            for(var p=0; p<points.length; p++) {
                var point = points[p];
                this.getTile(point)["isWall"] = false;
            }
        }

        this.populateDungeon();
    }

    populateDungeon() {
        // TODO: Refactor this
        var enemies_to_spawn = randint(this.size * 0.1, this.size * 0.3);

        while(enemies_to_spawn > 0) {
            var rand_point = this.randomPointInRoom();
            if (this.grid[rand_point.y][rand_point.x]["entity"] === null) {
                this.addEntity(new Enemy(this, rand_point), rand_point);
                enemies_to_spawn--;
            }
        }
        var traps_to_spawn = randint(1, this.size * 0.1);

        while(traps_to_spawn > 0) {
            var rand_point = this.randomPointInRoom();
            // if (this.grid[rand_point.y][rand_point.x]["entity"] === null) {
            if (this.getTile(rand_point)["entity"] === null) {
                var trap = TRAP_LIST[randint(0, TRAP_LIST.length)];
                this.addTrap(trap, rand_point);
                traps_to_spawn--;
            }
        }
        
        var items_to_spawn = randint(1, this.size * 0.08);

        while(items_to_spawn > 0) {
            var rand_point = this.randomPointInRoom();
            if (this.getTile(rand_point)["entity"] === null) {
                if (randint(0, 2)) {
                    var item = PROGRAM_LIST[randint(0, PROGRAM_LIST.length)];
                } else {
                    var item = SCRIPT_LIST[randint(0, SCRIPT_LIST.length)];
                }
                this.addItem(item, rand_point);
                items_to_spawn--;
            }
        }
    }

    executeTurn() {
        var to_destroy = [];

        for (var e=0; e<this.entities.length; e++) {
            var entity = this.entities[e];
            if (entity) {
                if (entity.type == "enemy") {
                    entity.turn();
                };
                
                if (entity.destroy) {
                    to_destroy.push(e);
                    this.grid[entity.pos.y][entity.pos.x]["entity"] = null;
                }
            }
        }

        for (var d=0; d<to_destroy.length; d++) {
            this.entities.splice(to_destroy[d], 1);
        }
    }

    addEntity(ent, point) {
        this.getTile(point)["entity"] = ent;
        this.entities.push(ent);
    }

    addTrap(trap, point) {
        this.getTile(point)["trap"] = trap;
    }

    addItem(item, point) {
        this.getTile(point)["items"].push(item);
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
        var from_tile = this.getTile(from),
            to_tile = this.getTile(to),
            entity = from_tile["entity"];

        // No entity to move in the origin tile
        if (!entity) { return; }
        // Trying to move into a wall
        if (to_tile["isWall"]) { return; }

        if (to_tile["entity"]) {
            // Going to a tile occupied by another entity
            from_tile["entity"].interactWith(to_tile["entity"]);
        } else {
            from_tile["entity"] = null;
            to_tile["entity"] = entity;
            entity.pos = to;

            // If the player is moving, update the tracker
            if (entity.type == "player") { this.player_at = to; }
        }
    }
}