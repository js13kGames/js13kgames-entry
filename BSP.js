function createHall(lChild, rChild, hallways) {
    // Connects two rooms with hallways in a straight line or a pair of lines.

    // Gets two random points, one in each room
    var point1 = [randint(lChild.left + 1, lChild.right - 2),
                  randint(lChild.top + 1, lChild.bottom - 2)];
    var point2 = [randint(rChild.left + 1, rChild.right - 2),
                  randint(rChild.top + 1, rChild.bottom - 2)];

    // The difference between the positions of both points
    w = point2[0] - point1[0];
    h = point2[1] - point1[1];

    if(w < 0) {
        // point2 is at the left of point1
        if(h < 0) {
            // point2 is bellow point1
            if(Math.random() < 0.5) {
                hallways.push( new Rect(point2[0], point1[1], Math.abs(w), 1) );
                hallways.push( new Rect(point2[0], point2[1], 1, Math.abs(h)) );
            } else {
                hallways.push( new Rect(point2[0], point2[1], Math.abs(w), 1) );
                hallways.push( new Rect(point1[0], point2[1], 1, Math.abs(h)) );
            }

        } else if (h > 0) {
            // point2 is above point 1
            if(Math.random() < 0.5) {
                hallways.push( new Rect(point2[0], point1[1], Math.abs(w), 1) );
                hallways.push( new Rect(point2[0], point1[1], 1, Math.abs(h)) );
            } else {
                hallways.push( new Rect(point2[0], point2[1], Math.abs(w), 1) );
                hallways.push( new Rect(point1[0], point1[1], 1, Math.abs(h)) );
            }

        } else {
            // points are vertically aligned
            hallways.push( new Rect(point2[0], point2[1], Math.abs(w), 1) );
        }
    } else if (w > 0) {
        // point2 is on the right of point1
        if(h < 0) {
            // point2 is bellow point1
            if(Math.random() < 0.5) {
                hallways.push( new Rect(point1[0], point2[1], Math.abs(w), 1) );
                hallways.push( new Rect(point1[0], point2[1], 1, Math.abs(h)) );
            } else {
                hallways.push( new Rect(point1[0], point1[1], Math.abs(w), 1) );
                hallways.push( new Rect(point2[0], point2[1], 1, Math.abs(h)) );
            }

        } else if (h > 0) {
            // point2 is above point 1
            if(Math.random() < 0.5) {
                hallways.push( new Rect(point1[0], point1[1], Math.abs(w), 1) );
                hallways.push( new Rect(point2[0], point1[1], 1, Math.abs(h)) );
            } else {
                hallways.push( new Rect(point1[0], point2[1], Math.abs(w), 1) );
                hallways.push( new Rect(point1[0], point1[1], 1, Math.abs(h)) );
            }

        } else {
            // points are vertically aligned
            hallways.push( new Rect(point1[0], point1[1], Math.abs(w), 1) );
        }
    } else {
        // points are horizontally aligned
        if (h < 0) {
            // point2 is above point 1
            hallways.push( new Rect(point2[0], point2[1], 1, Math.abs(h)) );
        } else if (h > 0) {
            hallways.push( new Rect(point1[0], point1[1], 1, Math.abs(h)) );
        }
    }
}

class Leaf extends Rect{
    constructor(x, y, width, height) {
        super(x, y, width, height);

        this.lChild = null;
        this.rChild = null;

        this.room = null;
    }

    split(minLeafSize=6) {
        if(this.lChild && this.rChild) { return false; }

        var splitH;
        if(this.width > this.height && this.width / this.height >= 1.25) {
            // If height is 25% greater than width, split horizontally
            splitH = false;
        } else if (this.height > this.width && this.height / this.width >= 1.25) {
            // If width is 25% greater than height, split vertically
            splitH = true;
        } else {
            // Otherwise, chose a random direction
            splitH = Math.random() > 0.5;
        }

        // maximum dimension (height or width)
        var maxDimension = (splitH ? this.height : this.width)
        maxDimension -= minLeafSize;
        // Checks if the area is too small to split.
        if(maxDimension <= minLeafSize) { return false; }

        // point to split based on the chosen direction
        var cut = randint(minLeafSize, maxDimension);

        if(splitH) {
            this.lChild = new Leaf(this.x, this.y, this.width, cut);
            this.rChild = new Leaf(this.x, this.y + cut,
                                   this.width, this.height - cut);
        } else {
            this.lChild = new Leaf(this.x, this.y, cut, this.height);
            this.rChild = new Leaf(this.x + cut, this.y,
                                   this.width - cut, this.height);
        }
        return true;
    }

    createRooms(hallways, rooms) {
        // Create rooms and hallways for this leaf and all children.
        // hallways must be an array to store the hallways
        if(this.lChild || this.rChild) {
            if(this.lChild) { this.lChild.createRooms(hallways, rooms); }
            if(this.rChild) { this.rChild.createRooms(hallways, rooms); }
            if(this.lChild && this.rChild) {
                createHall(this.lChild.findRoom(), this.rChild.findRoom(), hallways); }
        } else {
            // This leaf has no children, let's make a room on it.
            var roomSize = [ randint(3, this.width - 2), randint(3, this.height - 2) ];

            // Place the room with an offset (so adjacent rooms do not touch)
            var roomPos = [ randint(1, this.width - roomSize[0] - 1),
                            randint(1, this.height - roomSize[1] - 1) ];

            this.room = new Rect(this.x + roomPos[0], this.y + roomPos[1],
                                 roomSize[0], roomSize[1]);
            rooms.push(this.room);
        }
    }

    findRoom() {
        // Iterates over the children of this leaf until a room is found
        if(this.room) { return this.room;
        } else {
            var lRoom = null,
                rRoom = null;
            if(this.lChild) { lRoom = this.lChild.findRoom(); }
            if(this.rChild) { rRoom = this.rChild.findRoom(); }
            if(!lRoom && !rRoom) {
                return null;
            }
            else if (!rRoom) { return lRoom; }
            else if (!lRoom) { return rRoom; }
            else if (Math.random() > 0.5) { return lRoom; }
            else { return rRoom; }
        }
    }
}