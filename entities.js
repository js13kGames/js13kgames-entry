class Entity {
    constructor(dungeon,pos) {
        this.dungeon = dungeon;
        this.pos = pos;
        this.type = "";
        // this.destroy = false;
    }
    interactsWith(other) {}
}

class Player extends Entity {
    constructor(dungeon, pos) {
        super(dungeon, pos)
        this.hp = 10;
        this.att = 1;
        this.type = "player";
    }
    interactWith(other) {
        if (other.type == "enemy") {
            other.hp -= this.att;
            // if (other.hp == 0) { other.destroy = true; }
        }
    }
}

class Enemy extends Entity {
    constructor(dungeon, pos) {
        super(dungeon, pos)
        this.hp = 3;
        this.att = 1;
        this.type = "enemy";
    }
    interactWith(other) {
        if (other.type == "player") {
            other.hp -= this.att;
            // if (other.hp == 0) { other.destroy = true; }
        }
    }
    turn() {
        from = this.pos;
        this.dungeon.moveEntity();
    }
}