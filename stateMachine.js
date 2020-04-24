const States = require("./states");
const Sender = require("./sender");
const net = require("net");

module.exports = class StateMachine {
    constructor(socket) {
        this.curr_state = States.AUTH_NAME;
        this.server_key = 54621;
        this.client_key = 45328;
        this.sender = new Sender(socket);
        this.hashed_name = 0;
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

    handleMessage(clientMessage) {
        //console.log(clientMessage.toString());

        switch (this.curr_state) {
            case "AUTH_NAME":
                if(clientMessage.length > 10) {
                    console.warn("Name too long");
                    this.sender.sendSyntaxErr();
                    return false;
                } else {
                    this.curr_state = States.AUTH_KEY;
                    this.hashed_name = this.getHashName(clientMessage);
                    console.log(this.hashed_name);
                    console.log((this.hashed_name + this.server_key) % 65536);
                    return this.sender.send((this.hashed_name + this.server_key) % 65536);
                }
            case "AUTH_KEY":
                if(!this.checkClientKeySyntax(clientMessage)) {
                    console.error("Key not a number")
                    this.sender.sendSyntaxErr();
                    return false;
                } else if(!this.checkClientKey(clientMessage)) {
                    console.error("Key not matching");
                    this.sender.sendLoginFailed();
                    return false;
                } else {
                    this.curr_state = States.MOVING;
                    return this.sender.sendOK();
                }
            case "MOVING":
                return true;
            case "PICKING":
                return true;
            case "RECHARGING":
                return false;
        }

        return false;
    }
}