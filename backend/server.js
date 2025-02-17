const express = require('express');
const cors = require('cors');
const mysql = require("mysql2")
const session = require('express-session');

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
}));

app.use(express.json());

app.use(session({
    secret: 'key',
    resave:false,
    saveUninitialized:true,
    cookie:{secure:false}
}));

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
    const query = "SELECT * FROM user WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, result) => { 
        if (err) {
            res.status(500).json({ error: "Database error" }); 
        } else if (result.length > 0) {
            const user = result[0];
            req.session.userEmail = user.email;
            req.session.usertype = user.usertype;
            res.json({ msg: "Login successful",email: user.email,usertype: user.usertype }); 
        } else {
            res.status(401).json({ err: "Invalid credentials" });  
        }
    });
});

app.get("/bussinessDashboard", (req, res) => {
    if (req.session.userEmail) {
        res.json({email: req.session.userEmail});
    } else {
        res.status(401).json({ error: "Unauthorized access" });
    }
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
  });
  