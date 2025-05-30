const express = require("express");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs"); 
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const db = require("../db");
const multer = require("multer");
const activeTokens = new Set();


dotenv.config();
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, 
});

// REGISTER ROUTE
    router.post("/register", upload.single("image"), (req, res) => {
    const { email, password, fullName, phoneNum } = req.body;
    const imagePath = req.file ? `uploads/${req.file.filename}` : null;

    if (!email || !password || !fullName || !phoneNum) {
        return res.status(400).json({ error: "All fields are required" });
    }

    const userID = uuidv4();
    const saltRounds = 10;

    const checkEmailQuery = "SELECT id FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ error: "Email already in use" });
        }

        // Hash password
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
            if (err) {
                console.error("Password hashing error:", err);
                return res.status(500).json({ error: "Error hashing password" });
            }

            // Insert new user
            const insertQuery = "INSERT INTO users (id, email, pass, fullName, phoneNum, image) VALUES (?, ?, ?, ?, ?, ?)";
            db.query(insertQuery, [userID, email, hashedPassword, fullName, phoneNum, imagePath], (err) => {
                if (err) {
                    console.error("Error inserting user:", err);
                    return res.status(500).json({ error: "Error creating user" });
                }

                res.status(201).json({ message: "User registered successfully", userID });
            });
        });
    });
    });


// LOGIN ROUTE
    router.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    const selectQuery = "SELECT id, pass, role FROM users WHERE email = ?";
    db.query(selectQuery, [email], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = results[0];

        // Compare provided password with stored hashed passwordz
        bcrypt.compare(password, user.pass, (err, isMatch) => {
            if (err) {
                console.error("Error comparing password:", err);
                return res.status(500).json({ error: "Error processing password" });
            }

            if (!isMatch) {
                console.warn("Invalid login attempt for email:", email);
                return res.status(401).json({ error: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { userID: user.id, email, role: user.role, jti: uuidv4() }, 
                process.env.JWT_SECRET, 
                { expiresIn: "1h" }
            );

            // Store the token in active sessions
            activeTokens.add(token);

            res.status(200).json({ message: "Login successful", token, userID: user.id, role: user.role  });
        });
    });
    });

        // Middleware pour vérifier le token JWT
    const authenticateToken = (req, res, next) => {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "Accès non autorisé, token manquant" });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({ error: "Token invalide ou expiré" });
            }
            req.user = user; // Stocke l'utilisateur dans la requête
            next();
        });
    };

    

// GET PROFILE ROUTE
    router.get("/profile/:id", (req, res) => {
    const userID = req.params.id;

    const selectQuery = "SELECT id, email, fullName, phoneNum, image FROM users WHERE id = ?";
    db.query(selectQuery, [userID], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        let user = results[0];
        if (user.image) {
            user.image = `http://localhost:5000/${user.image}`;
        }

        res.status(200).json({ user });
    });
    });
//update Profile
    router.put("/profile/:id", upload.single("image"), (req, res) => {
        const userID = req.params.id;
        const { fullName, email, phoneNum } = req.body;
        let imagePath = req.file ? req.file.path : null;
    
        const updateQuery = "UPDATE users SET fullName = ?, email = ?, phoneNum = ?, image = ? WHERE id = ?";
        db.query(updateQuery, [fullName, email, phoneNum, imagePath, userID], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error" });
            }
    
            const selectQuery = "SELECT id, email, fullName, phoneNum, image FROM users WHERE id = ?";
            db.query(selectQuery, [userID], (err, results) => {
                if (err) {
                    console.error("Database error:", err);
                    return res.status(500).json({ error: "Database error" });
                }
    
                if (results.length === 0) {
                    return res.status(404).json({ error: "User not found" });
                }
    
                let user = results[0];
                if (user.image) {
                    user.image = `http://localhost:5000/${user.image}`;
                }
    
                res.status(200).json({ user });
            });
        });
    });
    

    router.post('/navbarInfo', (req, res) => { 
    const { userID } = req.body; // Ensure correct variable

    if (!userID) return res.status(400).json({ error: "userID is required" });

    const query = "SELECT id, image FROM users WHERE id = ?";
    db.query(query, [userID], (err, result) => { // Fix variable usage
        if (err) return res.status(500).json({ error: err });

        if (result.length === 0) return res.status(404).json({ error: "User not found" });

        let user = result[0];
        if (user.image) {
            user.image = `http://localhost:5000/${user.image}`;
        }
        return res.status(200).json({ user });
    });
    });

    router.post("/create", upload.array("images", 4), (req, res) => {
        const { ownerID, phoneNum, email, state, municipality, street, width, height, price, type_product } = req.body;
        const postID = uuidv4();
        const imagePaths = req.files.map((file) => file.filename);
        const status = "pending"; // Ajout du statut par défaut
    
        // Vérification des champs obligatoires
        if (!ownerID || !phoneNum || !email || !state || !municipality || !street || !width || !height || !price || !type_product) {
            return res.status(400).json({ error: "All fields are required" });
        }
    
        // Vérification du type de produit
        const validTypes = ["Land", "House", "Company", "Other"];
        if (!validTypes.includes(type_product)) {
            return res.status(400).json({ error: "Invalid type_product. Accepted values: Land, House, Company, Other" });
        }
    
        const ownerityID = uuidv4();
        // Insérer les données du propriétaire
        const insertOwnerData = "INSERT INTO owner (id,ownerID, phoneNum, email) VALUES (? ,?, ?, ?)";
        db.query(insertOwnerData, [ownerityID,ownerID, phoneNum, email], (err) => {
            if (err) {
                console.error("Error inserting owner:", err);
                return res.status(500).json({ error: "Server error" });
            }
    
            // Insérer les données du post avec status = "pending"
            const insertPostData = `
                INSERT INTO posts (postID, ownerID, price, state, Muniplicyt, street, width, height, type_product, status, created_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `;
            db.query(insertPostData, [postID, ownerID, price, state, municipality, street, width, height, type_product, status], (err) => {
                if (err) {
                    console.error("Error inserting post:", err);
                    return res.status(500).json({ error: "Server error" });
                }
    
                const postPicID = uuidv4();
                // Insérer les images
                const insertPicsData = "INSERT INTO posts_pics (id, postID, pic1, pic2, pic3, pic4) VALUES (?, ?, ?, ?, ?, ?)";
                db.query(insertPicsData, [postPicID, postID, imagePaths[0] || null, imagePaths[1] || null, imagePaths[2] || null, imagePaths[3] || null], (err) => {
                    if (err) {
                        console.error("Error inserting images:", err);
                        return res.status(500).json({ error: "Server error" });
                    }
    
                    res.status(201).json({ message: "Post created successfully with status pending", postID });
                });
            });
        });
    });
    

    router.get("/posts", (req, res) => {
        const selectQuery = `
            SELECT p.postID, p.price, p.state, p.Muniplicyt, p.street, p.type_product, pp.pic1,
            DATE_FORMAT(p.created_at, '%Y-%m-%d') AS created_at 
            FROM posts p 
            INNER JOIN posts_pics pp ON p.postID = pp.postID 
            WHERE p.ownerID = ? and p.status = 'Accepted'
        `;
    
        const { ownerID } = req.query;
    
        if (!ownerID) {
            return res.status(400).json({ error: "Missing ownerID" });
        }
    
        db.query(selectQuery, [ownerID], (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (result.length === 0) {
                return res.status(404).json({ error: "No posts found for this owner" });
            }
    
            const data = result.map(post => ({
                ...post,
                created_at: post.created_at || null,  
                pic1: post.pic1 ? `http://localhost:5000/uploads/${post.pic1}` : null
            }));
    
            return res.status(200).json({ data });
        });
    });
    

    router.post("/all-posts", (req, res) => {
        const { userID } = req.body; // Extract userID from request body
      
        if (!userID) {
          return res.status(400).json({ error: "User ID is required" });
        }
      
        const selectQuery = `
          SELECT p.postID, p.price, p.state, p.type_product, p.Muniplicyt, p.street, p.created_at,p.status, pp.pic1 
          FROM posts p 
          INNER JOIN posts_pics pp ON p.postID = pp.postID
          WHERE p.ownerID != ? and p.status = 'Accepted'`;
      
        db.query(selectQuery, [userID], (err, result) => {
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
      
          if (result.length === 0) {
            return res.status(404).json({ error: "No posts found" });
          }
      
          const data = result.map(post => ({
            ...post,
            pic1: post.pic1 ? `http://localhost:5000/uploads/${post.pic1}` : null,
            created_at: post.created_at ? new Date(post.created_at).toISOString() : null
          }));
    
          return res.status(200).json({ data });
        });
      });    
    

      router.post("/all-posts-request", (req, res) => {
        const { userID } = req.body; // Extract userID from request body
      
        if (!userID) {
          return res.status(400).json({ error: "User ID is required" });
        }
      
        const selectQuery = `
            SELECT p.postID, p.price, p.state, p.Muniplicyt, p.street, p.created_at, p.status, pp.pic1 
            FROM posts p 
            INNER JOIN posts_pics pp ON p.postID = pp.postID
            WHERE p.ownerID != ? AND p.status = 'pending'`; // Filtering only pending posts

        db.query(selectQuery, [userID], (err, result) => { // Fixed misplaced comma
          if (err) {
            console.error("Database query error:", err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
      
          if (result.length === 0) {
            return res.status(404).json({ error: "No posts found" });
          }
      
          const data = result.map(post => ({
            ...post,
            pic1: post.pic1 ? `http://localhost:5000/uploads/${post.pic1}` : null,
            created_at: post.created_at ? new Date(post.created_at).toISOString() : null
          }));
    
          return res.status(200).json({ data });
        });
      });    


      router.post("/all-posts-Day", (req, res) => {
        const { userID } = req.body;
    
        if (!userID) {
            return res.status(400).json({ error: "User ID is required" });
        }
    
        const selectQuery = `
            SELECT p.postID, p.created_at
            FROM posts p 
            WHERE p.ownerID != ?`;
    
        db.query(selectQuery, [userID], (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (result.length === 0) {
                return res.status(404).json({ error: "No posts found" });
            }
    
            console.log("Raw query result:", result);
    
            const daysCount = {
                Monday: 0, Tuesday: 0, Wednesday: 0, Thursday: 0,
                Friday: 0, Saturday: 0, Sunday: 0
            };
    
            result.forEach(post => {
                if (post.created_at) {
                    const day = new Date(post.created_at).toLocaleString('en-US', { weekday: 'long' });
                    if (daysCount[day] !== undefined) {
                        daysCount[day] += 1;
                    }
                }
            });
    
            console.log("Processed days count:", daysCount);
    
            return res.status(200).json({
                labels: Object.keys(daysCount),
                data: Object.values(daysCount)
            });
        });
    });

    router.post("/all-posts-Month", (req, res) => {
        const { userID } = req.body;
    
        if (!userID) {
            return res.status(400).json({ error: "User ID is required" });
        }
    
        const selectQuery = `
            SELECT p.postID, p.created_at
            FROM posts p 
            WHERE p.ownerID != ?`;
    
        db.query(selectQuery, [userID], (err, result) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (result.length === 0) {
                return res.status(404).json({ error: "No posts found" });
            }
    
            console.log("Raw query result:", result);
    
            const monthsCount = {
                Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
                Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
            };
    
            result.forEach(post => {
                if (post.created_at) {
                    const month = new Date(post.created_at).toLocaleString('en-US', { month: 'short' });
                    if (monthsCount[month] !== undefined) {
                        monthsCount[month] += 1;
                    }
                }
            });
    
            console.log("Processed months count:", monthsCount);
    
            return res.status(200).json({
                labels: Object.keys(monthsCount),
                data: Object.values(monthsCount)
            });
        });
    });
    

    router.post("/update-post-status", (req, res) => {
        const { postID, status } = req.body;

        if (!postID || !status) {
            return res.status(400).json({ error: "Post ID et statut sont requis" });
        }

        const updateQuery = `UPDATE posts SET status = ? WHERE postID = ?`;

        db.query(updateQuery, [status, postID], (err, result) => {
            if (err) {
                console.error("Erreur lors de la mise à jour du statut:", err);
                return res.status(500).json({ error: "Erreur interne du serveur" });
            }

            return res.status(200).json({ message: "Statut mis à jour avec succès" });
        });
    });


    // Route pour récupérer le nombre de posts en attente
    router.get("/pending-posts-count", (req, res) => {
        const query = `SELECT COUNT(*) AS pendingCount FROM posts WHERE status = 'pending'`;

        db.query(query, (err, result) => {
            if (err) {
                console.error("Erreur lors de la récupération du nombre de posts en attente:", err);
                return res.status(500).json({ error: "Erreur interne du serveur" });
            }

            console.log("Résultat de la requête:", result); // Affiche le résultat dans la console

            return res.status(200).json({ pendingCount: result[0].pendingCount });
        });
    });

    router.get("/accepted-posts-count", (req, res) => {
        const query = `SELECT COUNT(*) AS acceptedCount FROM posts WHERE status = 'Accepted'`;
    
        db.query(query, (err, result) => {
            if (err) {
                console.error("Erreur lors de la récupération du nombre de posts acceptés:", err);
                return res.status(500).json({ error: "Erreur interne du serveur" });
            }
    
            console.log("Résultat de la requête:", result); // Affiche le résultat dans la console
    
            return res.status(200).json({ acceptedCount: result[0].acceptedCount });
        });
    });

    router.get("/rejected-posts-count", (req, res) => {
        const query = `SELECT COUNT(*) AS rejectedCount FROM posts WHERE status = 'Rejected'`;
    
        db.query(query, (err, result) => {
            if (err) {
                console.error("Erreur lors de la récupération du nombre de posts refusés:", err);
                return res.status(500).json({ error: "Erreur interne du serveur" });
            }
    
            console.log("Résultat de la requête:", result); // Affiche le résultat dans la console
    
            return res.status(200).json({ rejectedCount: result[0].rejectedCount });
        });
    });
    

    router.get("/post/:postID", (req, res) => {
        const { postID } = req.params;
    
        const ownerDataQuery = `
            SELECT 
                o.phoneNum, o.email, u.fullName, u.image AS userImage, 
                pp.pic1, pp.pic2, pp.pic3, pp.pic4, p.*
            FROM posts p
            INNER JOIN owner o ON p.ownerID = o.ownerID
            INNER JOIN users u ON p.ownerID = u.id 
            INNER JOIN posts_pics pp ON p.postID = pp.postID
            WHERE p.postID = ?;
        `;
    
        db.query(ownerDataQuery, [postID], (err, results) => {
            if (err) {
                console.error("Database query error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (results.length === 0) {
                return res.status(404).json({ message: "Post not found" });
            }
    
            const post = results[0];
            const baseUrl = "http://localhost:5000/uploads/";
            const imageUrl = "http://localhost:5000/";
            const images = [post.pic1, post.pic2, post.pic3, post.pic4]
                .filter(pic => pic)
                .map(pic => `${baseUrl}${pic}`);
    
            // Construct full URL for user image
            const userImage = post.userImage ? `${imageUrl}${post.userImage}` : null;
    
            res.status(200).json({
                ...post,
                images,
                userImage 
            });
        });
    });
        
    

    // Update Request
    router.put("/update/:postID", upload.array("images", 4), (req, res) => {
    const { postID } = req.params; 
    const { ownerID, phoneNum, email, state, municipality, street, width, height, price } = req.body;
    const imagePaths = req.files.map((file) => file.filename);

    // Update owner data if provided
    if (ownerID || phoneNum || email) {
        const updateOwnerData = "UPDATE owner SET phoneNum = COALESCE(?, phoneNum), email = COALESCE(?, email) WHERE ownerID = ?";
        db.query(updateOwnerData, [phoneNum, email, ownerID], (err) => {
            if (err) return res.status(500).json({ error: "Server error updating owner" });
        });
    }

    // Update post data
    const updatePostData = "UPDATE posts SET price = COALESCE(?, price), state = COALESCE(?, state), Muniplicyt = COALESCE(?, Muniplicyt), street = COALESCE(?, street), width = COALESCE(?, width), height = COALESCE(?, height) WHERE postID = ?";
    db.query(updatePostData, [price, state, municipality, street, width, height, postID], (err) => {
        if (err) return res.status(500).json({ error: "Server error updating post" });
    });

    // Update images if new ones are uploaded
    if (imagePaths.length > 0) {
        const updatePicsData = "UPDATE posts_pics SET pic1 = COALESCE(?, pic1), pic2 = COALESCE(?, pic2), pic3 = COALESCE(?, pic3), pic4 = COALESCE(?, pic4) WHERE postID = ?";
        db.query(updatePicsData, [...imagePaths, postID], (err) => {
            if (err) return res.status(500).json({ error: "Server error updating images" });
        });
    }

    res.status(200).json({ message: "Post updated successfully" });
    });

    // Delete Request
    router.delete("/delete/:postID", (req, res) => {
        const { postID } = req.params;
        
        // Supprimer les images
        const deleteImagesQuery = "DELETE FROM posts_pics WHERE postID = ?";
        db.query(deleteImagesQuery, [postID], (err) => {
            if (err) return res.status(500).json({ error: "Server error deleting images" });
    
            // Supprimer le post
            const deletePostQuery = "DELETE FROM posts WHERE postID = ?";
            db.query(deletePostQuery, [postID], (err) => {
                if (err) return res.status(500).json({ error: "Server error deleting post" });
    
                res.status(200).json({ message: "Post deleted successfully" });
            });
        });
    });

    //page setting
    router.put("/owner/:ownerID", (req, res) => {
        const { ownerID } = req.params;
        const { fullName, email, phoneNum, image } = req.body;
    
        if (!fullName || !email || !phoneNum) {
            return res.status(400).json({ error: "All fields are required" });
        }
    
        const updateQuery = `
            UPDATE owner 
            SET fullName = ?, email = ?, phoneNum = ?, image = ? 
            WHERE ownerID = ?
        `;
    
        db.query(updateQuery, [fullName, email, phoneNum, image, ownerID], (err, result) => {
            if (err) {
                console.error("Database update error:", err);
                return res.status(500).json({ error: "Internal Server Error" });
            }
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Owner not found" });
            }
    
            // Fetch updated owner data
            const selectQuery = "SELECT fullName, email, phoneNum, image FROM owner WHERE ownerID = ?";
            db.query(selectQuery, [ownerID], (err, results) => {
                if (err) {
                    console.error("Database fetch error:", err);
                    return res.status(500).json({ error: "Internal Server Error" });
                }
    
                const owner = results[0];
                if (owner.image) {
                    owner.image = `http://localhost:5000/uploads/${owner.image}`;
                }
    
                res.status(200).json({ message: "Owner information updated successfully", owner });
            });
        });
    });

    router.post("/addNotif", (req,res)=>{
            const {senderID, receiverD, context} = req.body;

            const insertQuery = "INSERT INTO Notifs (idNotif, idSender, idReciever, Context) VALUES (?, ? ,? ,?)"; 
            const NotifID = uuidv4();
            
            db.query(insertQuery, [NotifID, senderID, receiverD, context], (err, result)=>{
                if (err) return res.status(500).json({Error : err})

                    return res.status(200).json({Message : result, NotifID});
            });
    })

    router.get("/getNotifs/:userID", (req, res) => {
        const { userID } = req.params;
    
        const selectNotifQuery = `
            SELECT n.idNotif, n.idSender, n.Context, u.FullName, u.id, u.image
            FROM Notifs n 
            INNER JOIN Users u ON n.idSender = u.id
            WHERE n.idReciever = ?
        `;
    
        const baseImageUrl = "http://localhost:5000/";
    
        db.query(selectNotifQuery, [userID], (err, result) => {
            if (err) {
                console.error("Error fetching notifications:", err);
                return res.status(500).json({ error: "Server error" });
            }
    
            if (result.length === 0) {
                return res.status(404).json({ message: "No notifications found" });
            }
    
            const notifications = result.map((notif) => ({
                ...notif,
                image: notif.image ? baseImageUrl + notif.image : null,
            }));
    
            res.status(200).json(notifications);
        });
    });

    router.delete("/delNotif/:notifID", (req, res) => {
        console.log("Received request to delete notif with ID:", req.params.notifID);
    
        const delQuery = "DELETE FROM Notifs WHERE idNotif = ?";
        const { notifID } = req.params;
    
        db.query(delQuery, [notifID], (err, result) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Server Error" });
            }
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Notification not found" });
            }
    
            res.status(200).json({ message: "Notification Deleted Successfully" });
        });
    });
    
    router.post("/replyNotif", (req, res) => {
        console.log("Received replyNotif request:", req.body);
    
        const { notifID, senderID, receiverID, message } = req.body;
    
        if (!notifID || !senderID || !receiverID || !message) {
            console.error("Missing required fields:", { notifID, senderID, receiverID, message });
            return res.status(400).json({ error: "Missing required fields" });
        }
    
        console.log("Processing replyNotif for notifID:", notifID);
    
        const deleteQuery = "DELETE FROM Notifs WHERE idNotif = ?";
        db.query(deleteQuery, [notifID.trim()], (err, deleteResult) => {
            if (err) {
                console.error("Database error (DELETE):", err);
                return res.status(500).json({ error: "Server Error" });
            }
    
            if (deleteResult.affectedRows === 0) {
                console.error("Notification not found in DB:", notifID);
                return res.status(404).json({ error: "Notification not found" });
            }
    
            console.log("Notification deleted, inserting reply...");
            const newNotifID = uuidv4(); // Use different variable name
            const insertQuery = "INSERT INTO Notifs (idNotif, idSender, idReciever, Context) VALUES (?, ?, ?, ?)";
            db.query(insertQuery, [newNotifID, senderID, receiverID, message], (err, insertResult) => {
                if (err) {
                    console.error("Database error (INSERT):", err);
                    return res.status(500).json({ error: "Server Error" });
                }
    
                res.status(200).json({ message: "Reply sent successfully!" });
            });
        });
    });


    router.post("/insertToFavorite", (req, res) => {
        const insertQuery = "INSERT INTO favorite (idFavorite, idUser, idPost) VALUES (?, ?, ?)";
        
        const { userID, postID } = req.body;
        if (!userID || !postID) {
            return res.status(400).json({ Message: "Invalid data" });
        }
    
        const favoriteID = uuidv4();
    
        db.query(insertQuery, [favoriteID, userID, postID], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ Error: "Database error" });
            }
    
            res.status(200).json({ Message: "Post added to favorites" });
        });
    });


    router.delete("/deleteFromFavorite", (req, res) => {
        const deleteQuery = "DELETE FROM favorite WHERE idUser = ? AND idPost = ?";
    
        const { userID, postID } = req.body;
    
        db.query(deleteQuery, [userID, postID], (err, result) => {
            if (err) return res.status(500).json({ Error: err });
    
            if (result.affectedRows === 0) {
                return res.status(404).json({ Message: "Post not found in favorites" });
            }
    
            res.status(200).json({ Message: "Post removed from favorites" });
        });
    });
    

    router.get("/getFavorites/:userID", (req, res) => {
        const selectQuery = "SELECT idPost FROM favorite WHERE idUser = ?";
    
        const { userID } = req.params;
        db.query(selectQuery, [userID], (err, result) => {
            if (err) return res.status(500).json({ err });
    
            if (result.length === 0) {
                return res.status(200).json({ data: [] });
            }
    
            const favoritePostIDs = result.map(row => row.idPost); 
            res.status(200).json({ data: favoritePostIDs });
        });
    });
    

    router.get("/favsPosts/:userID", (req, res) => {
        const selectQuery = `
          SELECT p.postID, p.price, p.state, p.Muniplicyt, p.street, p.created_at, pp.pic1
          FROM posts p
          INNER JOIN favorite f ON p.postID = f.idPost
          INNER JOIN posts_pics pp ON p.postID = pp.postID
          WHERE f.idUser = ? AND p.ownerID != ?;`;
    
        const { userID } = req.params;
    
        console.log("Fetching favorite posts for userID:", userID);
    
        if (!userID) {
            return res.status(400).json({ Error: "Invalid userID parameter" });
        }
    
        db.query(selectQuery, [userID, userID], (err, result) => {
            if (err) {
                console.error("Database Error:", err);
                return res.status(500).json({ Error: "Database error", Details: err.message });
            }
    
            if (result.length === 0) {
                return res.status(404).json({ Message: "No favorite posts found", data: [] });
            }
    
            const data = result.map(post => ({
                ...post,
                pic1: post.pic1 ? `http://localhost:5000/uploads/${post.pic1}` : null,
                created_at: post.created_at ? new Date(post.created_at).toISOString() : null
            }));
    
            res.status(200).json({ data });
        });
    });
    
    
    
      router.post("/logout", authenticateToken, (req, res) => {
        const token = req.headers.authorization?.split(" ")[1];
    
        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }
    
        if (activeTokens.has(token)) {
            activeTokens.delete(token); 
            return res.json({ message: "Logout successful" });
        } else {
            return res.status(400).json({ message: "Token not found in active sessions" });
        }
    });
    
      
    
module.exports = router;
