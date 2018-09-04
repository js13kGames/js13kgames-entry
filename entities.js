class Entity {
    constructor(dungeon,pos) {
        this.dungeon = dungeon;
        this.pos = pos;
        this.type = "";
        this.destroy = false;
    }
    interactsWith(other) {}
}

class Player extends Entity {
    constructor(dungeon, pos) {
        super(dungeon, pos)
        this.latency = 80;
        this.att = 1;
        this.type = "player";
    }
    interactWith(other) {
        if (other.type == "enemy") {
            other.hp -= this.att;
            if (DATA["installed"].indexOf("Denial_Of_Service")) {
                if (Math.random < 0.2) {
                    print_message("Denial_Of_Service successfully shut down the enemy's connection");
                    other.destroy = true;
                }
            }
            if (other.hp == 0) {
                other.destroy = true;
                if (DATA["installed"].indexOf("Maintenance") && this.latency > 40) {
                    print_message("Maintenance repairs your connection by 20ms.")
                    this.latency -= 20;
                }
            }
        } else if (other.type == "goal") {
            other.destroy = true;
            print_message("You reached your goal!");
        }
    }
}

class Enemy extends Entity {
    constructor(dungeon, pos) {
        super(dungeon, pos)
        this.hp = 3;
        this.att = 20;
        this.type = "enemy";
        this.status = "";
    }
    interactWith(other) {
        if (other.type == "player") {
            other.latency += this.att;
            print_message("Enemy is trying to cut your connection, increased latency by 10ms.")
            if (other.latency == 0) { other.destroy = true; }
        }
    }
    turn() {
        if (this.stats == "stun3") { this.stats = "stun2"; return;}
        if (this.stats == "stun2") { this.stats = "stun1"; return;}
        if (this.stats == "stun1") { this.stats = ""; return;}
        var from = this.pos,
            to = new Vector(from);
        switch (randint(0, 4)) {
            case 0: {to.add(-1, 0); break;}
            case 1: {to.add(0, 1); break;}
            case 2: {to.add(1, 0); break;}
            case 3: {to.add(0, -1); break;}
        }
        this.dungeon.moveEntity(from, to);
    }
}