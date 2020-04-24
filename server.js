const net = require('net');
const StateMachine = require('./stateMachine');

let sockets = [];

const server = net.createServer();
server.listen(3999);

server.on('connection', (socket) => {
    const clientAddress = `${socket.remotePort}`;
    console.log(`new client connected: ${clientAddress}`);
    sockets.push(socket);

    let clientMessage = [];
    const stateMachine = new StateMachine(socket);

    socket.on('data', data => {
        clientMessage.push(...data);
        console.log(`Client ${clientAddress}: ${data} (buffer)`);
        console.log(`Client ${clientAddress}: ${clientMessage} (string)`);

        if(clientMessage.includes(7) && clientMessage.includes(8)) {
            if(clientMessage.indexOf(7) === clientMessage.indexOf(8) - 1) {
                const msgArr = clientMessage.splice(0, clientMessage.indexOf(7));
                console.log("msgArr" + msgArr);
                let msg = '';

                for(let i = 0; i < msgArr.length; i++)
                    msg += String.fromCharCode(msgArr[i]);

                clientMessage.splice(0, 2);

                stateMachine.handleMessage(msg);
            }
        }
    });

    socket.on('close', () => {
        let index = sockets.findIndex( sct => {
            return sct.remoteAddress === socket.remoteAddress && sct.remotePort === socket.remotePort;
        })
        if (index !== -1) sockets.splice(index, 1);

        console.log(`Connection closed: ${clientAddress}`);
    });

    socket.on('error', (err) => {
        console.log(`Error occurred in ${clientAddress}: ${err.message}`);
    });
});