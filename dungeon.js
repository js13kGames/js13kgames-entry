
class DungeonGrid {
    constructor(size) {
        this.size = size;
        this.grid = [];

        for (var y=0; y<size; y++) {
            this.grid[y] = [];
            for (var x=0; x<size; x++) {
                this.grid[y][x] = {"isWall": true, "obstacles": [], "onFloor": []};
            }
        }
    }

    createDungeon(maxLeafSize=10) {
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
        
        var halls = [];
        root.createRooms(halls);

        for(var i=0; i<all_leaves.length; i++) {
            if(all_leaves[i].room) {
                var points = all_leaves[i].room.asPointArray();
                for(var p=0; p<points.length; p++) {
                    this.grid[points[p][1]][points[p][0]]["isWall"] = false;
                }
            }
        }
        
        var rooms = [];
        for(var i=0; i<halls.length; i++) {
            var points = halls[i].asPointArray();
            for(var p=0; p<points.length; p++) {
                this.grid[points[p][1]][points[p][0]]["isWall"] = false;
            }
        }
    }
}


function drawDungeon(canvas, ctx, dungeon) {
    var tileSize = canvas.width / dungeon.size;

    for(var y=0; y < dungeon.size; y++) {
        for(var x=0; x < dungeon.size; x++) {
            if( dungeon.grid[y][x]["isWall"] ) {
                ctx.strokeStyle = "gray";
                ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else {
                ctx.fillStyle = 'white';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
}