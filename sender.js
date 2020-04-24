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


}