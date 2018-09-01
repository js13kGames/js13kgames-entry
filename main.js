var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');


var MENU = 0,
    MISSION_SELECT = 1,
    GAMEPLAY = 2;


function getCursorPosition(canvas, event) {
    // Get the mouse position relative to the canvas.
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return [x, y];
}

function handleClick(scene, evt) {
    // When a click event is generated, checks if the user has clicked
    // on a button.
    var clicked_at = getCursorPosition(canvas, evt);
    for(var i=0; i<scene.ui.length; i++){
      var rect = scene.ui[i][0],
          callback = scene.ui[i][1];
  
      if ( callback && rect.hasPoint(clicked_at[0], clicked_at[1]) ) { callback(); }
    }
}


class Scene {
    constructor(id) {
        this.id = id;
        this.ui = [];
    }

    load() {
        ctx.fillStyle = "rgb(25,25,25)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    addButton(rect, text, color, callback=null) {
        ctx.font="20px Consolas";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.strokeStyle = color;
        ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        ctx.fillStyle = color;
        ctx.fillText(text, rect.x + (rect.width/2), rect.y + (rect.height/2));
      
        this.ui[0] = [rect, callback];
    }

}

var cur_scene = new Scene(MENU);

cur_scene.load();
cur_scene.addButton(new Rect(canvas.width/2-100, canvas.height/2-50, 200, 100),
                    "START", "purple", function() { console.log("START"); });

canvas.addEventListener('click', function(evt){ handleClick(cur_scene, evt) });