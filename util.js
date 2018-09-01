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
    hasPoint(x, y) {
        // True if the given point in inside the rect
        return x > this.left && x < this.right && y > this.top && y < this.bottom;
    }
    asPointArray() {
        // Return every point inside this rect
        var points = [];
        for (var y=this.top; y<this.bottom; y++) {
            for (var x=this.left; x<this.right; x++) {
                points.push([x, y]);
            }
        }

        return points;
    }
    randomPoint() {
        // Return a random point inside this rect
        var x = randint(this.left, this.right),
            y = randint(this.top, this.bottom);
        return [x, y];
    }
}

function randint(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

// TODO: Create a Vector object to facilitate the math