var MENU = 0,
    MISSION_SELECT = 1,
    GAMEPLAY = 2;


class Scene {
    constructor(id) {
        this.id = id;
        this.ui = [];
    }

    load() {
        ctx.fillStyle = "rgb(25,25,25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}


var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');

var cur_scene = new Scene(MENU);

cur_scene.load();