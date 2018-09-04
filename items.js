TRAP_LIST = ["damage", "stun", "poison"];

TRAPS = {
    "damage": function(target) { print_message("Stepped on a disconnection trap, received 3 damage.") },
    "stun": function(target) { print_message("Stepped on a disruption trap, your connection is unstable.") },
    "poison": function(target) { print_message("Stepped on a worm trap, your connection is slowly degrading.") },

    // This is not a trap, just used to represent the exit of the dungeon.
    "exit": function(target) { print_message("You're at the exit. Press space to exit the dungeon."); }
};

PROGRAM_LIST = ["Maintenance", "Proxy", "Denial_Of_Service", "Scavenger"];
SCRIPT_LIST = ["Scan", "Refresh", "Reconnect", "Glitch", "Decrypt", "Ping", "Interference"];

SCRIPTS = {
    "Scan" : {
        "msg" : "Scanning surroundings...",
        "cost": 3,
        "run" : function(dungeon) {
                    for (var y=0; y < dungeon.size; y++) {
                        for (var x=0; x < dungeon.size; x++) {
                            dungeon.grid[y][x]["fow"] = 1;
                        }
                    }
                }
    },
    "Refresh" : {
        "msg" : "Teleporting back to the start...",
        "cost" : 5,
        "run" :  function(dungeon) {
                    dungeon.moveEntity(dungeon.player_at, dungeon.player_start);
                }
    },
    "Reconnect" : {
        "msg" : "Restoring Neural Link connection...",
        "cost" : 2,
        "run" : function(dungeon) { dungeon.player.latency += 40; }
    },
    "Glitch" : {
        "msg" : "All enemies are now paralyzed.",
        "cost" : 5,
        "run" : function(dungeon) {
            for (var y=0; y < dungeon.size; y++) {
                for (var x=0; x < dungeon.size; x++) {
                    var entity = dungeon.grid[y][x]["entity"];
                    if (entity && entity.type == "enemy") {
                        entity.stats = "stun3";
                    }
                }
            }
        }
    },
    "Ping" : {
        "msg" : "",
        "cost" : 0,
        "run" : function(dungeon) {}
    },
    "Interference" : {
        "msg" : "",
        "cost" : 0,
        "run" : function(dungeon) {}
    }
}