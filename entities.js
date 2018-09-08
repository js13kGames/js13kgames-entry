class Entity {
    constructor(dungeon,pos,type="") {
        this.dungeon = dungeon;
        this.pos = pos;
        this.type = type;
        this.destroy = false;
    }
    interactsWith(other) {}
}

class Player extends Entity {
    constructor(dungeon, pos) {
        super(dungeon, pos)
        this.latency = 80;
        this.type = "player";
        this.status = {"stun": 0, "poison": 0};
    }
    interactWith(other) {
        if (other.type == "enemy") {
            var roll = randint(1, 21); // Attack roll
            if (roll + DATA["version"] < other.ac) {
                print_message(">> Missed your attack")
                playFloatText(other.pos.x, other.pos.y, "miss", 'white');
                return;
            }

            var dmg = randint(1,7) + DATA["version"]; // Damage roll
            other.hp -= dmg

            if (DATA["installed"].indexOf("Denial_Of_Service") > -1 && roll == 20) {
                if (Math.random < 0.2) {
                    print_message(">> Denial_Of_Service successfully shut down the enemy's connection");
                    playFloatText(other.pos.x, other.pos.y, "OFFLINE", 'red');
                    other.destroy = true;
                    DATA["bits"]++;
                }
            }
            if (other.hp == 0) {
                other.destroy = true;
                if (DATA["installed"].indexOf("Maintenance") > -1 && this.latency > 40) {
                    print_message(">> Maintenance repairs your connection by 20ms.")
                    this.latency -= 20;
                }
                playFloatText(other.pos.x, other.pos.y, "OFFLINE", 'red');
                DATA["bits"]++;
            }
            if (!other.destroy) {
                playFloatText(other.pos.x, other.pos.y, dmg, 'yellow');
                playBullet(other.pos.x, other.pos.y, 3);
            }
        } else if (other.type == "goal") {
            playAnimation(0, 0, canvas.width, [140,60,200]);
            other.destroy = true;
            print_message("!! You reached your goal!");
            DATA["level"]++;
            startDungeon();
        } else if (other.type == "firewall") {
            if (DATA["passwords"] > 0) {
                playFloatText(other.pos.x, other.pos.y, "****", 'green');
                other.destroy = true;
                DATA["passwords"]--;
                return;
            }
            playFloatText(other.pos.x, other.pos.y, "****", 'red');
        }
    }
}

class Enemy extends Entity {
    constructor(dungeon, pos, _class) {
        super(dungeon, pos);
        var color, hp, ac, att, dmg;
        if (_class == "common") { color='#ffac3f'; hp=3; ac=12; att=2; dmg=10; // Common enemy
        } else if (_class == "tough") { color='#773b00'; hp=5; ac=14; att=1; dmg=5; // Tough enemy
        } else if (_class == "glass") { color='#ff753a'; hp=2; ac=10; att=3; dmg=20; } // Glass cannon

        this.color = color;
        this.hp = hp;
        this.ac = ac;  // Armor class
        this.att = att;  // Accuracy
        this.dmg = dmg; // Damage
        this.type = "enemy";
        this.status = {"stun": 0, "poison": 0};
        this.player_in_range = false;
    }
    interactWith(other) {
        if (other.type == "player") {
            if (randint(0, 20) < 10 + DATA["level"]) { // Attack roll, 10 is the base AC
                print_message("<< Enemy tried to cut your connection, but failed!");
                playFloatText(other.pos.x, other.pos.y, "miss", 'white');
                return;
            }
            var dmg = randint(0, 21) + this.dmg; // Dmg roll
            other.latency += dmg
            print_message("<< Enemy is trying to cut your connection, increased latency by 10ms!");
            playFloatText(other.pos.x, other.pos.y, "+" + dmg + "ms", 'yellow');
            playBullet(other.pos.x, other.pos.y, 3, [234, 175, 58]);
            if (other.latency == 0) { other.destroy = true; }
        }
    }
    turn(dungeon) {
        if (this.status["poison"] > 0) {
            var dmg = 1;
            if (this.player_in_range) { playFloatText(this.pos.x, this.pos.y, dmg, 'green') };
            this.hp -= dmg;
            this.status['poison']--;
        }
        if (this.hp <= 0) { this.destroy = true; }
        if (this.status['stun'] > 0) {
            if (this.player_in_range) { playFloatText(this.pos.x, this.pos.y, "X", 'yellow'); }
            this.status['stun']--;
            return;
        }
        var from = this.pos,
            to = new Vector(from),
            to_player = new Vector(from);

        to_player.subtract(dungeon.player_at);
        
        if (this.player_in_range) {
            if (to_player.length == 1) {
                this.interactWith(dungeon.player)
            } else {
                to = dungeon.walkTowards(from, dungeon.player_at);
            }
        } else {
            switch (randint(0, 5)) {
                case 0: {to.add(0, 0); break;}
                case 1: {to.add(-1, 0); break;}
                case 2: {to.add(0, 1); break;}
                case 3: {to.add(1, 0); break;}
                case 4: {to.add(0, -1); break;}
            }
        }
        if (to_player.length < PLAYER_VISION) { this.player_in_range = true;}

        this.dungeon.moveEntity(from, to);
    }
}