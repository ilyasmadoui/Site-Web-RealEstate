module.exports = (io) => {
    let onlineUsers = []; 

    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        // Make the user join their own room (ensures private messages work)
        socket.join(socket.id);
        onlineUsers.push(socket.id);

        // Send updated user list to all clients
        io.emit("online_users", onlineUsers);

        // Handle private messages
        socket.on("send_private_message", (data) => {
            console.log(`Private message from ${data.sender} to ${data.recipient}: ${data.message}`);

            // Ensure recipient exists before sending message
            if (onlineUsers.includes(data.recipient)) {
                io.to(data.recipient).emit("receive_message", data);
            } else {
                console.log(`Recipient ${data.recipient} is offline or not connected.`);
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            onlineUsers = onlineUsers.filter((id) => id !== socket.id);
            
            // Update the user list for all clients
            io.emit("online_users", onlineUsers);
        });
    });
};
