TRAP_LIST = ["damage", "stun", "poison"];

TRAPS = {
    "damage": function(target) {
        dmg = randint(1, 11) * 10;
        print_message("<< Stepped on a disconnection trap, received " + dmg + " damage.")
        playFloatText(target.pos.x, target.pos.y, dmg, 'red');
        target.latency += dmg;
        playBullet(target.pos.x, target.pos.y);
    },
    "stun": function(target) {
        print_message("<< Stepped on a disruption trap, your connection is unstable.")
        playFloatText(target.pos.x, target.pos.y, "XXX", 'yellow');
        target.status["stun"] += 3;
    },
    "poison": function(target) {
        print_message("<< Stepped on a worm trap, your connection is slowly degrading.")
        playFloatText(target.pos.x, target.pos.y, "###", 'green');
        target.status["poison"] += 10;
    },
};

PROGRAM_LIST = ["Maintenance", "Proxy", "Denial_Of_Service", "Scavenger"];
SCRIPT_LIST = ["Scan", "Refresh", "Reconnect", "Glitch", "Ping", "Hack"];

SCRIPTS = {
    "Scan" : {
        "msg" : "Scanning surroundings...",
        "run" : function(dungeon) {
                    playAnimation(0, 0, canvas.width, [0,255,0]);
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
                    playAnimation(0, 0, canvas.width, [66,134,244]);
                    dungeon.moveEntity(dungeon.player_at, dungeon.player_start);
                }
    },
    "Reconnect" : {
        "msg" : "Restoring Neural Link connection...",
        "run" : function(dungeon) {
            playFloatText(dungeon.player_at.x, dungeon.player_at.y, "+", 'green');
            dungeon.player.latency -= 40;
        }
    },
    "Glitch" : {
        "msg" : "All enemies are now paralyzed.",
        "run" : function(dungeon) {
            playAnimation(0, 0, canvas.width, [232,232,95]);
            for (var y=0; y < dungeon.size; y++) {
                for (var x=0; x < dungeon.size; x++) {
                    var entity = dungeon.grid[y][x]["entity"];
                    if (entity && entity.type == "enemy") {
                        entity.status["stun"] += 3;
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
                            playFloatText(entity.pos.x, entity.pos.y, DATA["version"], 'red');
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
                        playFloatText(x, y, "10110100", 'gray');
                        dungeon.getTile(x, y)["isWall"] = false;
                    }
                }
            }
        }
    }
}