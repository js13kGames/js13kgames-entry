TRAP_LIST = ["damage", "stun", "poison"];

TRAPS = {
    "damage": function(target) {
        dmg = randint(1, 11) * 10;
        print_message("<< Stepped on a disconnection trap, received " + dmg + " damage.")
        playFloatText(target.pos.x, target.pos.y, dmg, 'red');
        DATA["latency"] += dmg;
        playBullet(target.pos.x, target.pos.y);
    },
    "stun": function(target) {
        print_message("<< Stepped on a disruption trap, your connection is unstable.")
        playFloatText(target.pos.x, target.pos.y, "XXX", 'yellow');
        target.status["stun"] += 3;
        playBullet(target.pos.x, target.pos.y, 5, [234,208,60]);
    },
    "poison": function(target) {
        print_message("<< Stepped on a worm trap, your connection is slowly degrading.")
        playFloatText(target.pos.x, target.pos.y, "###", 'green');
        target.status["poison"] += 10;
        playBullet(target.pos.x, target.pos.y, 5, [70,130,42]);
    },
};

PROGRAM_LIST = ["Maintenance", "Backup", "Denial_Of_Service", "Scavenger", "Linter", "Multithread", "Redundancy"];
PROGRAM_HELP = {"Maintenance": "Restores part of your connection after defeating an enemy.",
                "Backup": "If your connection goes offline, immediatly starts a new one.",
                "Denial_Of_Service": "Every attack on a enemy has a chance of disconnecting him instantly.",
                "Scavenger": "Chance of randomly producing a new item for every step you take",
                "Linter": "Increases accuracy.",
                "Multithread": "Increases damage dealt",
                "Redundancy": "Increases defenses",
            }
SCRIPT_LIST = ["Scan", "Refresh", "Reconnect", "Glitch", "Ping", "Hack", "AV"];
SCRIPT_HELP = {"Scan": "Reveals the layout of the map.",
               "Refresh": "Teleports back to the entrance.",
               "Reconnect": "Restores a bit of your connetion.",
               "Glitch": "Disables every enemy on the map.",
               "Ping": "Deals damage to every enemy you can see.",
               "Hack": "Turns walls into walkable tiles.",
               "AV": "Clear any status in effect."
            }
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
        "msg" : "Restoring Connection...",
        "run" : function(dungeon) {
            playBullet(dungeon.player_at.x, dungeon.player_at.y, 10, [0,0,255]);
            var heal = randint(30, 80);
            DATA["latency"] -= heal
            if (DATA["latency"] < 16) { DATA["latency"] = 16 }
            playFloatText(dungeon.player_at.x, dungeon.player_at.y, "-" + heal + "ms", 'green');
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
        "msg" : "Sending packets to enemies...",
        "run" : function(dungeon) {
            var center = dungeon.player_at;
            playBullet(center.x, center.y, 70, [255,0,0]);
            for(var y=center.y-PLAYER_VISION; y<center.y+PLAYER_VISION; y++) {
                for(var x=center.x-PLAYER_VISION; x<center.x+PLAYER_VISION; x++) {
                    if (y >= 0 && y < dungeon.size && x >= 0 && x < dungeon.size) {
                        entity = dungeon.getTile(x, y)["entity"];
                        if(entity && entity.type == "enemy") {
                            playFloatText(entity.pos.x, entity.pos.y, DATA["version"], 'red');
                            entity.hp -= randint(1, 7) + DATA["version"];
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
            playBullet(center.x, center.y, 70, [100,100,100]);
            for(var y=center.y-3; y<center.y+4; y++) {
                for(var x=center.x-3; x<center.x+4; x++) {
                    if (y >= 1 && y < dungeon.size-1 && x >= 1 && x < dungeon.size-1) {
                        playFloatText(x, y, "10110100", 'gray');
                        dungeon.getTile(x, y)["isWall"] = false;
                    }
                }
            }
        }
    },
    "AV" : {
        "msg" : "Clearing statuses...",
        "run" : function(dungeon) {
            dungeon.player.status = {"stun": 0, "poison": 0};
        }
    }
}