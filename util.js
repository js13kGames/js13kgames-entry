class Vector {
    constructor(vec_or_x, y=null) {
        if (y != null) {
            this.x = vec_or_x;
            this.y = y;
        } else {
            this.x = vec_or_x.x;
            this.y = vec_or_x.y;
        }
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    add(vec_or_x, y=null) {
        if (y != null) {
            this.x += vec_or_x;
            this.y += y;
        } else {
            this.x += vec_or_x.x;
            this.y += vec_or_x.y;
        }
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    subtract(vec_or_x, y=null) {
        if (y != null) {
            this.x -= vec_or_x;
            this.y -= y;
        } else {
            this.x -= vec_or_x.x;
            this.y -= vec_or_x.y;
        }
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    scale(s) {
        this.x *= s;
        this.y *= s;
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    normalize() {
        this.x /= this.length;
        this.x = Math.round(this.x);
        this.y /= this.length;
        this.y = Math.round(this.y);
        this.length = Math.sqrt(this.x * this.x + this.y * this.y);
    }
    isInside(array){
        for (var i=0; i<array.length; i++) {
            if(array[i].x == this.x && array[i].y == this.y) {
                return true;
            }
        }
        return false;
    }
    isEqual(vec) {
        return this.x == vec.x && this.y == vec.y;
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
    constructor(x, y, width, height, text, fontsize, color, callback) {
        super(x, y, width, height);

        this.text = text;
        this.fontsize = fontsize;
        this.color = color;
        this.callback = callback;
    }
    draw() {
        ctx.font = this.fontsize + "px 'Courier New'";
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

class Animation extends Rect {
    constructor(x, y, width, height, rgbArray, time, itensity) {
        super(x, y, width, height);
        this.start = delta;
        this.destroy = false;
        this.time = time;
        this.itensity = itensity;
        this.color = rgbArray;
    }

    draw() {
        var alpha = (delta - this.start) / (1000 * this.time);
        ctx.fillStyle = "rgba(" + this.color + "," + alpha + ")";
        ctx.fillRect(this.x, this.y, this.width, this.height);
        this.destroy = alpha > this.itensity;
    }
}

function playAnimation(x, y, size, color, time=0.1, itensity=0.6) {
    control.ani.push( new Animation(x, y, size, size, color, time, itensity) );
}


class FloatingText {
    constructor(x, y, text, fontsize, color) {
        this.x = x;
        this.start_y = y;
        this.y = y;
        this.text = text;
        this.fontsize = fontsize;
        this.color = color;
        this.destroy = false;
    }

    draw() {
        ctx.font = this.fontsize + "px 'Courier New'";
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, this.x, this.y);
        this.y--;
        if (this.y < this.start_y-20) { this.destroy = true; }
    }
}

function playFloatText(x, y, text, color='yellow', fontsize=10) {
    control.ani.push( new FloatingText(x*TILESIZE + TILESIZE/2, y*TILESIZE, text, fontsize, color) );
    console.log(control);
}