
class DungeonGrid {
    constructor(size) {
        this.size = size;
        this.grid = [];
        this.rooms = [];
        this.halls = [];
        this.entities = [];
        this.player = null;
        this.player_at = null;
        this.player_start = null;

        for (var y=0; y<size; y++) {
            this.grid[y] = [];
            for (var x=0; x<size; x++) {
                this.grid[y][x] = {"isWall": true, "entity": null, "trap": null, "item": null, "fow": -1};
            }
        }
    }

    getTile(x_or_vec, y=null) {
        if (y != null) {
            // Coordinates are not in the grid
            if(y < 0 || y >= this.size || x_or_vec < 0 || x_or_vec >= this.size) { return null; }
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
        var enemies_to_spawn = randint(this.size * 0.1, this.size * 0.3),
            traps_to_spawn = randint(1, this.size * 0.1),
            items_to_spawn = randint(1, this.size * 0.08),
            player_spawned = false,
            goal_spawned = false,
            goal_start = null;
        

        while(enemies_to_spawn + traps_to_spawn + items_to_spawn > 0) {
            var rand_point = this.randomRoom().randomPoint(),
                tile = this.getTile(rand_point);

            if (player_spawned && this.player_start == rand_point) { continue; }
            if (goal_spawned && goal_start == rand_point) { continue; }

            if (!player_spawned) {
                this.player_at = rand_point;
                this.player_start = rand_point;
                this.player = new Player(this, rand_point);
                this.addEntity(this.player, rand_point);
                this.getTile(rand_point)["trap"] = "exit";
                player_spawned = true;

            } else if (!goal_spawned ) {
                var goal = new Entity(this, rand_point);
                goal.type = "goal";
                this.addEntity(goal, rand_point);
                goal_spawned = true;
                goal_start = rand_point;

            } else if (traps_to_spawn && tile['trap'] === null) {
                var trap = TRAP_LIST[randint(0, TRAP_LIST.length)];
                this.addTrap(trap, rand_point);
                traps_to_spawn--;
            } else if (items_to_spawn && tile['item'] === null) {

                if (randint(0, 2)) {
                    var item = PROGRAM_LIST[randint(0, PROGRAM_LIST.length)];
                } else {
                    var item = SCRIPT_LIST[randint(0, SCRIPT_LIST.length)];
                }
                this.addItem(item, rand_point);
                items_to_spawn--;
            } else if (enemies_to_spawn && tile['entity'] === null) {
                this.addEntity(new Enemy(this, rand_point), rand_point);
                enemies_to_spawn--;
            }
        }
    }

    executeTurn() {
        // Player coomputation
        var player_tile = this.getTile(this.player_at);
        if (player_tile["trap"] && player_tile["trap"] != "exit") {
            TRAPS[player_tile["trap"]](this.player);
            player_tile["trap"] = null;
        }
        if (player_tile["item"]) {
            var item = player_tile["item"];
            print_message("Obtained " + player_tile["item"] + " item!");
            if (PROGRAM_LIST.indexOf(item)) { DATA["programs"].push('item');
            } else if (SCRIPT_LIST.indexOf(item)) { DATA["scripts"].push('item'); }
            
            player_tile["item"] = null;
        }

        if (this.player.latency > 400) { this.player.destroy = true; }

        // Enemy turn
        var to_destroy = [];

        for (var e=0; e<this.entities.length; e++) {
            var entity = this.entities[e];
            if (entity) {
                if (entity.type == "enemy") {
                    entity.turn(this);
                };
                
                if (entity.destroy) {
                    if (entity.type == "player") {
                        var proxy = DATA["installed"].indexOf("Proxy");
                        if (proxy < 0) {
                            // Player dies
                            print_message("Connection lost, your neural link to your body is offline.");
                            print_message("GAME OVER");
                            GAME_OVER = true;
                        } else {
                            print_message("Main connection lost, Proxy connection estabilished.");
                            this.player.latency = 80;
                            DATA["installed"].splice(proxy, 1);
                            DATA["programs"].splice(proxy, 1);
                        }
                    }
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
        this.getTile(point)["item"] = item;
    }

    randomRoom() { // Changed from randomPointInRoom
        return this.rooms[ randint(0, this.rooms.length) ];
    }

    getNeighbors(center) {
        var neighbors = [];
        if (center.x > 0) { neighbors.push(new Vector(center.x -1, center.y)); }
        if (center.x < this.size -1) { neighbors.push(new Vector(center.x +1, center.y)); }
        if (center.y > 0) { neighbors.push(new Vector(center.x, center.y-1)); }
        if (center.y < this.size -1) { neighbors.push(new Vector(center.x, center.y+1)); }
        return neighbors;
    }

    walkTowards(from, to) {
        // NOTE: Its fine, but the entities do not go around corners.
        // Maybe adding diagonal movement will fix this.
        // Maybe computing the diagonal tiles distance and script a two movement path when the entity reaches a corner
        var neighbors = this.getNeighbors(from),
            closest = neighbors[0],
            closest_distance = new Vector(to);
        closest_distance.subtract(from);

        for (var n=0; n < neighbors.length; n++) {
            var n_distance = new Vector(to);
                n_distance.subtract(neighbors[n]);
            if (n_distance.length < closest_distance.length) {
                closest = neighbors[n];
            }
        }

        return closest
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
            if (entity.type == "player") {
                this.player_at = to;
                var scavenger = DATA["installed"].indexOf("Scavenger");
                if (scavenger >= 0 && Math.random() > 0.05) {
                    print_message("Scavenger program found a file worth of 50$.");
                    DATA["money"] += 50;
                }
            }
        }
    }
}