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
        socket.setTimeout(stateMachine.getTimeout());

        clientMessage.push(...data);
        console.log(`/////////////Client ${clientAddress}: ${data} (buffer)/////////////`);
        let currChar, prevChar;

            for(let j = 0; j < clientMessage.length; j++) {
                if(j >= 1)
                    prevChar = currChar;

                currChar = clientMessage[j];

                if(prevChar === 7 && currChar === 8) {
                    const msgArr = clientMessage.splice(0, j - 1);

                    let msg = '';

                    for(let i = 0; i < msgArr.length; i++)
                        msg += String.fromCharCode(msgArr[i]);

                    clientMessage.splice(0, 2);
                    j = 0;
                    stateMachine.handleMessage(msg);
                } else if(j === 11 && stateMachine.curr_state === "AUTH_NAME") {
                    stateMachine.sender.sendSyntaxErr();
                    socket.end();
                } else if(j === 99 && stateMachine.curr_state === "PICKING") {
                    stateMachine.sender.sendSyntaxErr();
                    socket.end();
                } else if(j === 11 && stateMachine.curr_state === "MOVING") {
                    stateMachine.sender.sendSyntaxErr();
                    socket.end();
                }
            }

            /*if(clientMessage.includes(7) && clientMessage.includes(8)) {
                if(clientMessage.indexOf(7) === clientMessage.indexOf(8) - 1) {
                    const msgArr = clientMessage.splice(0, clientMessage.indexOf(7));
                    //console.log("msgArr: " + msgArr);
                    let msg = '';

                    for(let i = 0; i < msgArr.length; i++)
                        msg += String.fromCharCode(msgArr[i]);

                    clientMessage.splice(0, 2);

                    stateMachine.handleMessage(msg);
                }
            }*/
    });

    socket.on('timeout', () => {
        console.log('socket timeout');
        socket.end();
    })

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