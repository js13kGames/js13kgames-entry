var canvas = document.getElementById("screen");
var ctx = canvas.getContext('2d');

var MENU = 0,
    MISSION_SELECT = 1,
    GAMEPLAY = 2;

var ui = [];
var cur_scene;

function getCursorPosition(canvas, event) {
    // Get the mouse position relative to the canvas.
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return [x, y];
}

function handleClick(evt) {
    // When a click event is generated, checks if the user has clicked
    // on a button.
    var clicked_at = getCursorPosition(canvas, evt);
    for(var i=0; i<ui.length; i++){
      var rect = ui[i][0],
          callback = ui[i][1];
  
      if ( callback && rect.hasPoint(clicked_at[0], clicked_at[1]) ) { callback(); }
    }
}

function addButton(rect, text, color, callback=null) {
    ctx.font="20px Consolas";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.strokeStyle = color;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    ctx.fillStyle = color;
    ctx.fillText(text, rect.x + (rect.width/2), rect.y + (rect.height/2));
    
    ui[0] = [rect, callback];
}


var cur_scene;

// var dungeon;

function changeScene(to_scene) {
    ctx.fillStyle = "rgb(25,25,25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ui = [];
    cur_scene = to_scene;

    switch (to_scene) {
        case 0: {
            addButton(new Rect(canvas.width/2-100, canvas.height/2-50, 200, 100),
                      "START", "purple", function() { changeScene(GAMEPLAY) });
            canvas.addEventListener('click', handleClick);

            break;
        }
        case 2: {
            var dungeon = new DungeonGrid(40);
            dungeon.createDungeon();
            dungeon.addPlayer();
            drawDungeon(canvas, ctx, dungeon);

            document.addEventListener('keyup', function(evt) { dungeon.handleKeyUp(evt); drawDungeon(canvas, ctx, dungeon); console.log("keypress"); });

            break;
        }
    }
}


changeScene(MENU);