const Moves = require("./moves");

module.exports = class Sender {
    constructor(_socket) {
        this.socket = _socket;
        this.suffix = "\u0007\b"
    }

    send(message) {
        console.log(`Sender sending: ${message}`);
        //console.log(this.socket);
        return this.socket.write(message.toString() + this.suffix);
    }

    sendOK() {
        this.send("200 OK");
        return true;
    }

    sendLoginFailed() {
        return this.send("300 LOGIN FAILED");
    }

    sendSyntaxErr() {
        return this.send("301 SYNTAX ERROR");
    }

    sendLogicErr() {
        return this.send("302 LOGIC ERROR");
    }

    sendLogout() {
        return this.send("106 LOGOUT");
    }

    sendMove(move) {
        switch (move) {
            case Moves.MOVE:
                this.send("102 MOVE");
                break;
            case Moves.TURN_LEFT:
                this.send("103 TURN LEFT");
                break;
            case Moves.TURN_RIGHT:
                this.send("104 TURN RIGHT");
                break;
            case Moves.PICK:
                this.send("105 GET MESSAGE");
                break;
        }
        return true;
    }


}