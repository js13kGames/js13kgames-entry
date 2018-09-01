class Entity {
    constructor(dungeon,pos) {
        this.dungeon = dungeon;
        this.pos = pos;
        this.type = "";
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
        }
    }
}