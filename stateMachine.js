const States = require("./states");
const Sender = require("./sender");
const Mover = require("./mover");
const Moves = require("./moves");
const net = require("net");

module.exports = class StateMachine {
    constructor(_socket) {
        this.curr_state = States.AUTH_NAME;
        this.prev_state = States.AUTH_NAME;
        this.server_key = 54621;
        this.client_key = 45328;
        this.sender = new Sender(_socket);
        this.mover = new Mover();
        this.hashed_name = 0;
        this.socket = _socket;
    }

    getTimeout() {
        return (this.curr_state === States.RECHARGING ? 5 : 1) * 1000;
    }

    getHashName(name) {
        let sum = 0;
        for (let i = 0; i < name.length; i++)
            sum += name.charCodeAt(i);

        return (sum * 1000) % 65536;
    }

    checkClientKeySyntax(clientKey) {
        const re = /^\d{1,5}$/;
        return re.test(clientKey);
    }

    checkClientKey(clientKey) {
        const key = (this.client_key + this.hashed_name) % 65536;
        return clientKey === key.toString();
    }

    checkClientPosMsg(clientPos) {
        const re = /^OK -?(\d)+ -?(\d)+$/;
        return re.test(clientPos);
    }

    parsePosition(clientMsg) {
        const tokens = clientMsg.split(' ');
        return [parseInt(tokens[1]), parseInt(tokens[2])]
    }

    handleMessage(clientMessage) {
        if(clientMessage === "RECHARGING") {
            this.prev_state = this.curr_state;
            this.curr_state = States.RECHARGING;
            return true;
        }

        switch (this.curr_state) {
            case "AUTH_NAME":
                if(clientMessage.length > 10) {
                    console.warn("Name too long");
                    this.sender.sendSyntaxErr();
                    this.socket.end();
                    return false;
                } else {
                    this.curr_state = States.AUTH_KEY;
                    this.hashed_name = this.getHashName(clientMessage);
                    return this.sender.send((this.hashed_name + this.server_key) % 65536);
                }
            case "AUTH_KEY":
                if(!this.checkClientKeySyntax(clientMessage)) {
                    console.error("Key not a number")
                    this.sender.sendSyntaxErr();
                    this.socket.end();
                    return false;
                } else if(!this.checkClientKey(clientMessage)) {
                    console.error("Key not matching");
                    this.sender.sendLoginFailed();
                    this.socket.end();
                    return false;
                } else {
                    this.curr_state = States.MOVING;
                    return this.sender.sendOK() && this.sender.sendMove(Moves.MOVE);
                }
            case "MOVING":
                if(!this.checkClientPosMsg(clientMessage)) {
                    console.error("Wrong client position!");
                    this.sender.sendSyntaxErr();
                    this.socket.end();
                    return false;
                } else {
                    let [x, y] = this.parsePosition(clientMessage);
                    this.mover.updatePos(x, y);

                    if(this.mover.atStart) {
                        this.prev_state = this.curr_state;
                        this.curr_state = States.PICKING;
                        return this.sender.sendMove(Moves.PICK);
                    } else {
                        return this.sender.sendMove(this.mover.getMove());
                    }
                }
            case "PICKING":
                if(clientMessage !== "") {
                    this.sender.sendLogout();
                    this.socket.end();
                    return true;
                } else {
                    this.prev_state = this.curr_state;
                    this.curr_state = States.MOVING;
                    return this.sender.sendMove(this.mover.getMove());
                }
            case "RECHARGING":
                if(clientMessage !== "FULL POWER") {
                    this.sender.sendLogicErr();
                    this.socket.end();
                    return false;
                }
                this.curr_state = this.prev_state;
                return true;
        }

        return false;
    }
}