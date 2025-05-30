import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { SendIcon } from 'lucide-react';
import '../styles/Chat.scss';

const socket = io.connect("http://localhost:5000");

function Chat({ recipientID }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [socketID, setSocketID] = useState(null);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected with ID:", socket.id);
            setSocketID(socket.id);
        });
    
        return () => {
            socket.off("connect");
        };
    }, []);
    

    const sendMessages = () => {
        if (!socket.id || !recipientID) {
            console.error("Socket ID or recipient is not available yet");
            return;
        }
    
        const messageData = {
            message,
            sender: socket.id, 
            recipientID
        };
    
        socket.emit("send_private_message", messageData);
        setMessages((prevMessages) => [...prevMessages, messageData]);
    };
    

    return (
        <div className='chat-main-container'>
            <h2>Chat</h2>
            <div className='chat-container'>
                {messages.map((msg, index) => (
                    <p key={index} className={msg.sender === socketID ? "recv" : "send"}>
                        <strong>{msg.sender === socketID ? "You" : msg.sender}</strong>: {msg.message}
                    </p>
                ))}
            </div>

            <div className='snd-message-container'>
                <input placeholder='Enter your message' onChange={(e) => setMessage(e.target.value)} />
                <button onClick={sendMessages} disabled={!recipientID}><SendIcon size={20} /></button>
            </div>
        </div>
    );
}

export default Chat;
