const mysql = require("mysql2");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "realEstates",
    port: 3310,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    acquireTimeout: 20000
});

db.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection error:", err.code);
    } else {
        console.log("Database connected successfully.");
        connection.release();
    }
});

module.exports = db;
