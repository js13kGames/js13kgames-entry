class Vector {
    constructor(vec_or_x, y=null) {
        if (y != null) {
            this.x = vec_or_x;
            this.y = y;
        } else {
            this.x = vec_or_x.x;
            this.y = vec_or_x.y;
        }
    }
    add(vec_or_x, y=null) {
        if (y != null) {
            this.x += vec_or_x;
            this.y += y;
        } else {
            this.x += vec_or_x.x;
            this.y += vec_or_x.y;
        }
    }
    subtract(vec_or_x, y=null) {
        if (y != null) {
            this.x -= vec_or_x;
            this.y -= y;
        } else {
            this.x -= vec_or_x.x;
            this.y -= vec_or_x.y;
        }
    }
    scale(s) {
        this.x *= s;
        this.y *= s;
    }
}

class Rect {
    // A Rectangle, facilitate geometry calculations.
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.left = x;
        this.right = x + width;
        this.top = y;
        this.bottom = y + height;
        this.centerx = x + width / 2;
        this.centery = y + height / 2;
    }
    hasPoint(vec) {
        // True if the given point in inside the rect
        return vec.x > this.left && vec.x < this.right && vec.y > this.top && vec.y < this.bottom;
    }
    asPointArray() {
        // Return every point inside this rect
        var points = [];
        for (var y=this.top; y<this.bottom; y++) {
            for (var x=this.left; x<this.right; x++) {
                points.push(new Vector(x, y));
            }
        }

        return points;
    }
    randomPoint() {
        // Return a random point inside this rect
        var x = randint(this.left, this.right),
            y = randint(this.top, this.bottom);
        return new Vector(x, y);
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

class Button extends Rect {
    constructor(x, y, width, height, text, color, callback) {
        super(x, y, width, height);

        this.color = color;
        this.text = text;
        this.callback = callback;
    }
    draw() {
        ctx.font="20px Consolas";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
    
        ctx.strokeStyle = this.color;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x + (this.width/2), this.y + (this.height/2));
    }
}

function getCursorPosition(canvas, event) {
    // Get the mouse position relative to the canvas.
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return new Vector(x, y);
}

function clearCanvas() {
    ctx.fillStyle = "rgb(25,25,25)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}