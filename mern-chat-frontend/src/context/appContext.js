////        WebSockets  varijanta 1

import React from "react";

export const AppContext = React.createContext();

export const socket = function createSocket() {
    const ws = new WebSocket(process.env.REACT_APP_WS_URL);

    ws.sendMsg = (type, payload) => {
        const send = () => ws.send(JSON.stringify({ type, payload }));
        if (ws.readyState === WebSocket.OPEN) {
            send();
        } else {
            ws.addEventListener("open", send, { once: true });
        }
    };

    return ws;
}()




// //////        WebSockets  varijanta 2

// import React from "react";
// export const AppContext = React.createContext();
// export const socket = new WebSocket(process.env.REACT_APP_WS_URL);

// socket.sendMsg = (type, payload) => {
//     socket.send(JSON.stringify({ type, payload }));
// };




//////// Socket.IO

// import { io } from "socket.io-client";
// import React from "react";

// export const socket = io(process.env.REACT_APP_URL);
// // app context
// export const AppContext = React.createContext();


