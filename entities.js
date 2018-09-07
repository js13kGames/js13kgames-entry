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
                print_message(">> Missed your attack!")
                return;
            }

            other.hp -= DATA["version"];
            if (DATA["installed"].indexOf("Denial_Of_Service") && roll == 20) {
                if (Math.random < 0.2) {
                    print_message(">> Denial_Of_Service successfully shut down the enemy's connection");
                    other.destroy = true;
                    DATA["bits"]++;
                }
            }
            if (other.hp == 0) {
                other.destroy = true;
                if (DATA["installed"].indexOf("Maintenance") && this.latency > 40) {
                    print_message(">> Maintenance repairs your connection by 20ms.")
                    this.latency -= 20;
                }
                DATA["bits"]++;
            }
            if (!other.destroy) {
                playAnimation(other.pos.x*TILESIZE, other.pos.y*TILESIZE, TILESIZE, [255,0,0], 0.4);
            }
        } else if (other.type == "goal") {
            other.destroy = true;
            print_message("!! You reached your goal!");
            DATA["level"]++;
            startDungeon();
        } else if (other.type == "firewall") {
            if (DATA["passwords"] > 0) { other.destroy = true; DATA["passwords"]--;}
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
    }
    interactWith(other) {
        if (other.type == "player") {
            if (randint(0, 20) < 10 + DATA["level"]) { // Attack roll, 10 is the base AC
                print_message("<< Enemy tried to cut your connection, but failed!")
                return;
            }
            other.latency += this.att;
            print_message("<< Enemy is trying to cut your connection, increased latency by 10ms!")
            playAnimation(0, 0, canvas.width,  [255,255,255], 0.2);
            if (other.latency == 0) { other.destroy = true; }
        }
    }
    turn(dungeon) {
        if (this.hp <= 0) { this.destroy = true; }
        if (this.stats == "stun3") { this.stats = "stun2"; return;}
        if (this.stats == "stun2") { this.stats = "stun1"; return;}
        if (this.stats == "stun1") { this.stats = ""; return;}
        var from = this.pos,
            to = new Vector(from),
            to_player = new Vector(from);

        to_player.subtract(dungeon.player_at);
        
        if (to_player.length < PLAYER_VISION) {
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

        this.dungeon.moveEntity(from, to);
    }
}