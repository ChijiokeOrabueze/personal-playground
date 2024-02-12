import React, { useEffect, useState } from 'react';
import './App.css';
import io from 'socket.io-client';

function App() {
    const [socket, setSocket] = useState<any>(null);

    useEffect(() => {
        const socketInstance = io('https://api.staging.caresaas.co.uk');
        setSocket(socketInstance);

        console.log({ socketInstance });
        // listen for events emitted by the server

        socketInstance.on('connect', () => {
            console.log('Connected to server');

            //shortCode:carehomeId:userId
            socketInstance.emit('join', 'FKRC:2:14');
        });

        //shortCode:carehomeId:userId
        socketInstance.emit('join', 'FKRC:2:14');

        socketInstance.on('moo', (data) => {
            console.log(`Received message: ${data.action}`);
        });

        socketInstance.on('task', (data) => {
            console.log(`Received task message: ${data.action}`);
        });

        socketInstance.on('medication', (data) => {
            console.log(`Received med message: ${data.action}`);
        });

        return () => {
            if (socketInstance) {
                socketInstance.disconnect();
            }
        };
    }, []);
    return (
        <div id='swagger-ui'></div>
        // <div className="App">

        //   <a href="http://localhost:8010/api/v1/auth/google">Login With Google</a>

        // </div>
    );
}

export default App;
