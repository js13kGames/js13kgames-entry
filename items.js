TRAP_LIST = ["damage", "stun", "poison"];

TRAPS = {
    "damage": function(target) { print_message("<< Stepped on a disconnection trap, received 3 damage.") },
    "stun": function(target) { print_message("<< Stepped on a disruption trap, your connection is unstable.") },
    "poison": function(target) { print_message("<< Stepped on a worm trap, your connection is slowly degrading.") },

    // This is not a trap, just used to represent the exit of the dungeon.
    "exit": function(target) { print_message("!! You're at the exit. Press space to exit the dungeon."); }
};

PROGRAM_LIST = ["Maintenance", "Proxy", "Denial_Of_Service", "Scavenger"];
SCRIPT_LIST = ["Scan", "Refresh", "Reconnect", "Glitch", "Decrypt", "Ping", "Hack"];

SCRIPTS = {
    "Scan" : {
        "msg" : "Scanning surroundings...",
        "run" : function(dungeon) {
                    playAnimation(0, 0, canvas.width, [0,255,0], 0.3);
                    for (var y=0; y < dungeon.size; y++) {
                        for (var x=0; x < dungeon.size; x++) {
                            dungeon.grid[y][x]["fow"] = 1;
                        }
                    }
                }
    },
    "Refresh" : {
        "msg" : "Teleporting back to the start...",
        "run" :  function(dungeon) {
                    playAnimation(0, 0, canvas.width, [66,134,244], 0.3);
                    dungeon.moveEntity(dungeon.player_at, dungeon.player_start);
                }
    },
    "Reconnect" : {
        "msg" : "Restoring Neural Link connection...",
        "run" : function(dungeon) {
            playFloatText(dungeon.player_at.x*TILESIZE + TILESIZE/2, dungeon.player_at.y*TILESIZE, "+", 'green');
            dungeon.player.latency += 40;
        }
    },
    "Glitch" : {
        "msg" : "All enemies are now paralyzed.",
        "run" : function(dungeon) {
            for (var y=0; y < dungeon.size; y++) {
                for (var x=0; x < dungeon.size; x++) {
                    var entity = dungeon.grid[y][x]["entity"];
                    if (entity && entity.type == "enemy") {
                        playAnimation(0, 0, canvas.width, [232,232,95], 0.3);
                        entity.status = "stun3";
                    }
                }
            }
        }
    },
    "Ping" : {
        "msg" : "Deals damage to all enemies you can see.",
        "run" : function(dungeon) {
            var center = dungeon.player_at;
            for(var y=center.y-PLAYER_VISION; y<center.y+PLAYER_VISION; y++) {
                for(var x=center.x-PLAYER_VISION; x<center.x+PLAYER_VISION; x++) {
                    if (y >= 0 && y < dungeon.size && x >= 0 && x < dungeon.size) {
                        entity = dungeon.getTile(x, y)["entity"];
                        if(entity && entity.type == "enemy") {
                            playFloatText(entity.pos.x*TILESIZE + TILESIZE/2, entity.pos.y*TILESIZE, DATA["version"], 'red');
                            entity.hp -= DATA["version"];
                        }
                    }
                }
            }
        }
    },
    "Hack" : {
        "msg" : "Hacking surrounding walls into passable tiles.",
        "run" : function(dungeon) {
            var center = dungeon.player_at;
            for(var y=center.y-3; y<center.y+3; y++) {
                for(var x=center.x-3; x<center.x+3; x++) {
                    if (y >= 1 && y < dungeon.size-1 && x >= 1 && x < dungeon.size-1) {
                        playFloatText(x*TILESIZE + TILESIZE/2, y*TILESIZE, "@#%&*!", 'gray');
                        dungeon.getTile(x, y)["isWall"] = false;
                    }
                }
            }
        }
    }
}