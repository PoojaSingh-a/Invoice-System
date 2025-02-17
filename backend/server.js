const express = require('express');
const cors = require('cors');
const mysql = require("mysql2");
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

const app = express();
const SECRET_KEY = "key";

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

const db = mysql.createConnection({
    host:"localhost",
    user:"root",
    password:"",
    database:"invoicing_db"
})

db.connect(err => {
    if(err){
        console.error("Database connection failed."+err.message);
    }else{
        console.log("Connected to MySQL database.");
    }
});

app.get('/',(req,res)=>{
    res.send("Invoing system backend running");
})

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM bussinessuser_table WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, result) => { 
        if (err) {
            res.status(500).json({ error: "Database error" }); 
        } else if (result.length > 0) {
            const user = result[0];
            const token = jwt.sign({email:user.email,usertype: user.userType},SECRET_KEY, { expiresIn: '1h' });
            
            res.cookie('authToken',token,{
                httpOnly:true,
                secure:false,
                sameSite:'strict',
                maxAge:3600000
            })

            res.json({ msg: "Login successful", email: user.email, usertype: user.userType });
        } else {
            res.status(401).json({ err: "Invalid credentials" });  
        }
    });
});

app.get("/bussinessDashboard", (req, res) => {
    const token = req.cookies.authToken;
    if(!token) {
        return res.status(401).json({ error: "Unauthorized: No Token" });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        }

        const email = decoded.email;
        const query = "SELECT fullname FROM bussinessuser_table WHERE email = ?";

        db.query(query, [email], (err, result) => {
            if (err) {
                return res.status(500).json({ error: "Database error" });
            }
            if (result.length > 0) {
                console.log(result[0].fullname);
                res.json({ name: result[0].fullname });
            } else {
                res.status(404).json({ error: "User not found" });
            }
        });
    });
});


app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
  });
  