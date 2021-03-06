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
        this.type = "player";
        this.status = {"stun": 0, "poison": 0};
    }
    interactWith(other) {
        if (other.type == "enemy") {
            // Attack roll
            var roll = randint(1, 21),
                bonus = DATA["installed"].indexOf("Linter") > -1 ? 3 : 0;
            if (roll + DATA["version"] + bonus < other.ac) {
                print_message(">> Missed your attack")
                playFloatText(other.pos.x, other.pos.y, "miss", 'white');
                return;
            }

            // Damage roll
            bonus = DATA["installed"].indexOf("Multithread") > -1 ? 3 : 0;
            var last_wind = 10 - ((400 - DATA['latency']) / 50) **2; // Bonus damage the closer the player is to dying
            last_wind = Math.ceil(last_wind) > 0 ? last_wind : 0;
            var dmg = randint(1,7) + DATA["version"] + bonus + last_wind;
            other.hp -= dmg

            if (DATA["installed"].indexOf("Denial_Of_Service") > -1 && roll == 20) {
                print_message(">> Denial_Of_Service successfully shut down the enemy's connection");
                playFloatText(other.pos.x, other.pos.y, "OFFLINE", 'red');
                other.destroy = true;
                DATA["bits"]++;
            }
            if (other.hp <= 0) {
                other.destroy = true;
                DATA["bits"]++;
                if (DATA["installed"].indexOf("Maintenance") > -1) {
                    var heal = randint(1, 11);
                    print_message(">> Maintenance repairs your connection by "+ heal +"ms.")
                    DATA["latency"] -= heal;
                    if (DATA["latency"] < 16) { DATA["latency"] = 16 }
                }
                playFloatText(other.pos.x, other.pos.y, "OFFLINE", 'red');
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
        var bonus = DATA['level'] > 10 ? DATA['level'] - 10 : 0;
        if (_class == "common") { color='#ffac3f'; hp=3+bonus; ac=12+bonus; att=2+bonus; dmg=10+bonus; // Common enemy
        } else if (_class == "tough") { color='#773b00'; hp=5+bonus*2; ac=14+bonus*2; att=1+bonus; dmg=5+bonus; // Tough enemy
        } else if (_class == "vampire") { color='#770000'; hp=5+bonus*2; ac=12+bonus*2; att=1+bonus; dmg=5+bonus; // Vampire enemy
        } else if (_class == "glass") { color='#ff753a'; hp=2+bonus; ac=10+bonus; att=3+bonus; dmg=20+bonus*2; // Glass cannon
        } else if (_class == "poison") { color='#617500'; hp=3+bonus; ac=12+bonus; att=2+bonus; dmg=10+bonus; // Poison
        } else if (_class == "explosive") { color='#ff009d'; hp=1+bonus; ac=14+bonus; att=0; dmg=80+bonus; // Explosive
        }

        this._class = _class;
        this.color = color;
        this.hp = hp;
        this.ac = ac;  // Armor class
        this.att = att;  // Accuracy
        this.dmg = dmg; // Damage
        this.type = "enemy";
        this.status = {"stun": 0, "poison": 0, "explosion": 3};
        this.player_in_range = false;
    }
    interactWith(other) {
        if (other.type == "player") {
            var player_ac_bonus = DATA['installed'].indexOf("Redundancy") > -1 ? 3 : 0;
            if (randint(0, 20) < 10 + DATA["version"] + player_ac_bonus) { // Attack roll, 10 is the base AC
                print_message("<< Enemy tried to cut your connection, but failed!");
                playFloatText(other.pos.x, other.pos.y, "miss", 'white');
                return;
            }

            var dmg = randint(0, 21) + this.dmg; // Dmg roll
            DATA["latency"] += dmg
            print_message("<< Enemy is trying to cut your connection, increased latency by " + dmg + "ms !");


            if (this._class == "tough" && Math.random() < 0.05) {
                print_message("<< Enemy has stunned you!");
                other.status["stun"] = 3;
            }
            if (this._class == "poison") {
                print_message("<< The enemy's attacks are slowly degrading your connection!");
                other.status["poison"] = 10;
            }
            if (this._class == "vampire" && this.hp < 5) {
                print_message("<< The enemy's grows stronger with every successful attack!");
                playFloatText(this.pos.x, this.pos.y, "+1", 'green');
                this.hp += 1
            }
            playFloatText(other.pos.x, other.pos.y, "+" + dmg + "ms", 'yellow');
            playBullet(other.pos.x, other.pos.y, 3, [234, 175, 58]);
            if (DATA["latency"] == 0) { other.destroy = true; }
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

        if (this._class == "explosive" && this.status["explosion"] < 3) {
            playFloatText(this.pos.x, this.pos.y, this.status["explosion"], 'red');

            if (this.status["explosion"] == 0) {
                playBullet(this.pos.x, this.pos.y, 30, [255,0,0]);
                this.destroy = true;
                if (to_player.length == 1) {
                    DATA["latency"] += this.dmg;
                    print_message("<< Enemy heavily damaged your connetion, increased latency by " + this.dmg + "ms !");
                    playFloatText(this.dungeon.player_at.x, this.dungeon.player_at.y, "+" + this.dmg + "ms", 'yellow');
                 }
            }

            this.status["explosion"]--;
            return;
        }
        if (this._class == "explosive" && to_player.length == 1) {
            playFloatText(this.pos.x, this.pos.y, this.status["explosion"], 'red');
            this.status["explosion"]--;
            return;
        }


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