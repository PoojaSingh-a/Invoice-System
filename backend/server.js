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
    if(err)
        console.error("Database connection failed."+err.message);
    else
        console.log("Connected to MySQL database.");
});

app.get('/',(req,res)=>{
    res.send("Invoing system backend running");
})

app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM bussinessuser_table WHERE email = ? AND password = ?";

    db.query(query, [email, password], (err, result) => { 
        if (err) 
            res.status(500).json({ error: "Database error" }); 
        else if (result.length > 0) {
            const user = result[0];
            /**Cookie generation */
            const token = jwt.sign({email:user.email,usertype: user.userType},SECRET_KEY, { expiresIn: '1h' });
            res.cookie('authToken',token,{
                httpOnly:true,
                secure:false,
                sameSite:'strict',
                maxAge:3600000
            })

            res.json({ msg: "Login successful", email: user.email, usertype: user.userType });
        } 
        else 
            res.status(401).json({ err: "Invalid credentials" });  
    });
});

app.get("/bussinessDashboard", (req, res) => {
    const token = req.cookies.authToken;
    if(!token) 
        return res.status(401).json({ error: "Unauthorized: No Token" });
    

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) 
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });
        
        const email = decoded.email;
        const query = "SELECT fullname FROM bussinessuser_table WHERE email = ?";

        db.query(query, [email], (err, result) => {
            if (err) 
                return res.status(500).json({ error: "Database error" });
            if (result.length > 0) {
             //   console.log(result[0].fullname);
                res.json({ name: result[0].fullname });
            } else 
                res.status(404).json({ error: "User not found" });
        });
    });
});

app.get("/generateInvoice",(req,res)=>{
    const token = req.cookies.authToken;
    if(!token){
        return res.status(401).json({error: "No user signed in!"});
    }
    jwt.verify(token,SECRET_KEY,(err,decoded)=>{
        if(err)
            return res.status(401).json({ error: "Unauthorized: Invalid Token" });

        /***for Biller's address */
        const email = decoded.email;
        const query = "SELECT fullname,companyName,phone,city from bussinessuser_table where email = ?";

        let clientNames;
        db.query(query,[email],(err,result)=>{
            if (err) 
                return res.status(500).json({ error: "Database error" });
            if(result.length === 0)
                return res.status(404).json({error:"Business user not found"});

            const {fullname,companyName,phone,city} = result[0];
           // console.log("Company name is : ",companyName);

            /**For dropdown */
            const query2 = "SELECT fullname FROM businessclients_table WHERE companyName = ?";
            db.query(query2,[companyName],(err,clients)=>{
                if(err)
                    return res.status(500).json({error:"Database error while fetching clients"});
                
                clientNames = clients.map(client => client.fullname);
          });
            const query3 = "SELECT invoiceNumber FROM allInvoices_table ORDER BY CAST(SUBSTRING(invoiceNumber, 6) AS UNSIGNED) DESC LIMIT 1";
            db.query(query3,[companyName],(err,invoice)=>{
                if(err)
                    return res.status(500).json({error:"Database error while fetching invoice number"});
                //console.log("Invoice number is: ",invoice);

                let newInvoiceNumber = "INV";
                const first2Char = companyName.substring(0,2);
                newInvoiceNumber = newInvoiceNumber + first2Char;
                const digitPart = parseInt(invoice[0].invoiceNumber.substring(5)) + 1;
                newInvoiceNumber = newInvoiceNumber + digitPart;
                newInvoiceNumber = newInvoiceNumber.toUpperCase();
                //console.log("New invoice number is",newInvoiceNumber);
                res.json({
                    name:fullname,
                    companyName:companyName,
                    phone:phone,
                    city:city,
                    allClients:clientNames,
                    invoiceNumber:newInvoiceNumber,
                });
            });
        });
    });
});

app.get("/getGST", async (req, res) => {
    const { description } = req.query;

    try {
        if (!description) {
            return res.status(400).json({ error: "Missing description parameter" });
        }

        console.log("Received description:", description); // Debugging

        const query = "SELECT item_gst FROM invoiceitems_table WHERE item_desc = ?";
        
        // Use a Promise to handle the database query properly
        db.query(query, [description], (err, results) => {
            if (err) {
                console.error("Database error:", err);
                return res.status(500).json({ error: "Database error while fetching GST" });
            }

            console.log("Query result:", results); // Debugging

            if (results.length > 0) {
                const gst = results[0].item_gst;
                console.log("GST from database:", gst);
                res.json({ gst });
            } else {
                console.log("No GST found, returning 0");
                res.json({ gst: 0 });
            }
        });

    } catch (error) {
        console.error("Error fetching GST:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


app.post("/logout",(req,res)=> {
    res.clearCookie('authToken',{
        httpOnly:true,
        sameSite:"strict",
        secure:false
    });
    res.status(200).json({msg:"Logout succesaful"});
});

app.listen(5000, () => {
    console.log("Server running on http://localhost:5000");
    });
  