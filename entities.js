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
    }
    interactWith(other) {
        if (other.type == "enemy") {
            var roll = randint(1, 21); // Attack roll
            if (roll + DATA["version"] < other.ac) {
                print_message(">> Missed your attack")
                playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "miss", 'white');
                return;
            }

            other.hp -= DATA["version"];
            if (DATA["installed"].indexOf("Denial_Of_Service") > -1 && roll == 20) {
                if (Math.random < 0.2) {
                    print_message(">> Denial_Of_Service successfully shut down the enemy's connection");
                    playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "OFFLINE", 'red');
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
                playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "OFFLINE", 'red');
                DATA["bits"]++;
            }
            if (!other.destroy) {
                playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, DATA["version"], 'yellow');
            }
        } else if (other.type == "goal") {
            other.destroy = true;
            print_message("!! You reached your goal!");
            DATA["level"]++;
            startDungeon();
        } else if (other.type == "firewall") {
            if (DATA["passwords"] > 0) {
                playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "****", 'green');
                other.destroy = true;
                DATA["passwords"]--;
                return;
            }
            playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "****", 'red');
        }
    }
}

class Enemy extends Entity {
    constructor(dungeon, pos, hp=3, ac=12, att=1, dmg=20) {
        super(dungeon, pos)
        this.hp = hp;
        this.ac = ac;  // Armor class
        this.att = att;  // Accuracy
        this.dmg = dmg; // Damage
        this.type = "enemy";
        this.status = "";
        this.player_in_range = false;
    }
    interactWith(other) {
        if (other.type == "player") {
            if (randint(0, 20) < 10 + DATA["level"]) { // Attack roll, 10 is the base AC
                print_message("<< Enemy tried to cut your connection, but failed!");
                playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "miss", 'white');
                return;
            }
            other.latency += this.att * 10;
            print_message("<< Enemy is trying to cut your connection, increased latency by 10ms!");
            playFloatText(other.pos.x*TILESIZE + TILESIZE/2, other.pos.y*TILESIZE, "+" + this.att * 10 + "ms", 'yellow');
            if (other.latency == 0) { other.destroy = true; }
        }
    }
    turn(dungeon) {
        if (this.hp <= 0) { this.destroy = true; }
        if (this.status.startsWith('stun') && this.player_in_range) {
            playFloatText(this.pos.x*TILESIZE + TILESIZE/2, this.pos.y*TILESIZE, "X", 'yellow');
        }
        if (this.status == "stun3") { this.status = "stun2"; return;}
        if (this.status == "stun2") { this.status = "stun1"; return;}
        if (this.status == "stun1") { this.status = ""; return;}
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