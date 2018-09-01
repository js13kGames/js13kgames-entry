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
        return x > this.left && x < this.right && y > this.top && y < this.bottom;
    }
}