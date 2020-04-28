const Directions = require("./directions");
const Moves = require("./moves");

module.exports = class Mover {
    constructor() {
       this.posX = 100;
       this.posY = 100;
       this.prevPosX = 100;
       this.prevPosY = 100;
       this.direction = Directions.UNKNOWN;
       this.prevDirection = Directions.UNKNOWN;

       this.movesCnt = 0;
       this.atStart = false;

       this.goingDown = false;
       this.goingUp = false;
    }

    updatePos(x, y) {
        if(this.movesCnt >= 1) {
            this.prevPosX = this.posX;
            this.prevPosY = this.posY;
        }

        this.posX = x;
        this.posY = y;
        this.movesCnt++;

        if(this.movesCnt <= 2) {
            if(this.prevPosX === this.posX && this.prevPosY === this.posY) {
                this.movesCnt--;
                return true;
            }
        }

        if(this.prevPosX === this.posX && this.prevPosY === this.posY) {
            //console.log(this.movesCnt + " POS: [" + this.posX + ", " + this.posY + "] not changed in update: " + this.direction);
            this.movesCnt++;
            return true;
        }

        if(this.movesCnt >= 2) {
            this.prevDirection = this.direction;
            if(this.prevPosX !== this.posX)
                this.posX > this.prevPosX ? this.direction = Directions.RIGHT : this.direction = Directions.LEFT;
            else
                this.posY > this.prevPosY ? this.direction = Directions.UP : this.direction = Directions.DOWN;
        }
        //console.log(this.movesCnt + " POS: [" + this.posX + ", " + this.posY + "] " + this.direction);

        return true;
    }

    getMove() {
        //console.log(this.movesCnt + " Pos: [" + this.posX + ", " + this.posY + "] " + this.direction);
        if(this.movesCnt <= 1) {
            return Moves.MOVE;
        } else if(!this.atStart) {
            return this.getToStart();
        } else {
            return this.findTheMessage();
        }
    }

    getToStart() {
        if(this.posX === 2 && this.posY === 2) {
            if(this.direction !== Directions.RIGHT) {
                this.updateDirection(Moves.TURN_RIGHT);
                return Moves.TURN_RIGHT;
            } else {
                this.atStart = true;
                this.updateDirection(Moves.TURN_RIGHT);
                return Moves.TURN_RIGHT;
            }
        }

        if(this.posX > 2 && this.posX !== 2) {
            //console.log("posx > 2");
            if(this.direction !== Directions.LEFT) {
                this.updateDirection(Moves.TURN_RIGHT);
                return Moves.TURN_RIGHT;
            }
            return Moves.MOVE;
        } else if (this.posX < 2 && this.posX !== 2) {
            //console.log("posx < 2");
            if(this.direction !== Directions.RIGHT) {
                this.updateDirection(Moves.TURN_RIGHT);
                return Moves.TURN_RIGHT;
            }
            return Moves.MOVE;
        } else if(this.posY > 2 && this.posY !== 2) {
            //console.log("posy > 2");
            if(this.direction !== Directions.DOWN) {
                this.updateDirection(Moves.TURN_RIGHT);
                return Moves.TURN_RIGHT;
            }
            return Moves.MOVE;
        } else if(this.posY < 2 && this.posY !== 2) {
            //console.log("posy <  2");
            if(this.direction !== Directions.UP) {
                this.updateDirection(Moves.TURN_RIGHT);
                return Moves.TURN_RIGHT;
            }
            return Moves.MOVE;
        }
    }

    findTheMessage() {
        if(this.posY === 2)
            this.goingDown = true;
        else if(this.posY === -2)
            this.goingDown = false;

        if(this.goingDown) {
            if(this.posX % 2 === 0) {
                if(this.direction !== Directions.DOWN) {
                    this.updateDirection(Moves.TURN_RIGHT);
                    return Moves.TURN_RIGHT;
                }
                return Moves.MOVE;
            } else {
                if(this.direction !== Directions.LEFT) {
                    this.updateDirection(Moves.TURN_LEFT);
                    return Moves.TURN_LEFT;
                }
                return Moves.MOVE;
            }
        } else if(!this.goingDown) {
            if(this.posX % 2 === 0) {
                if(this.direction !== Directions.LEFT) {
                    this.updateDirection(Moves.TURN_RIGHT);
                    return Moves.TURN_RIGHT;
                }
                return Moves.MOVE;
            } else {
                if(this.direction !== Directions.UP) {
                    this.updateDirection(Moves.TURN_RIGHT);
                    return Moves.TURN_RIGHT;
                }
                return Moves.MOVE;
            }
        }
    }

    updateDirection(move) {
        switch (this.direction) {
            case Directions.UP:
                move === Moves.TURN_RIGHT ? this.direction = Directions.RIGHT : this.direction = Directions.LEFT;
                break;
            case Directions.RIGHT:
                move === Moves.TURN_RIGHT ? this.direction = Directions.DOWN : this.direction = Directions.UP;
                break;
            case Directions.DOWN:
                move === Moves.TURN_RIGHT ? this.direction = Directions.LEFT : this.direction = Directions.RIGHT;
                break;
            case Directions.LEFT:
                move === Moves.TURN_RIGHT ? this.direction = Directions.UP : this.direction = Directions.DOWN;
                break;
        }
    }
}