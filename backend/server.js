const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const sendEmail = require("./sendEmail");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const { google } = require("googleapis");

const app = express();
const SECRET_KEY = "key";

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "50mb" })); // increases the allowed payload size to 50MB for bigger PDFs.
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true })); //ensures that complex json objects are properly parsed.
app.use(express.json());
app.use(cookieParser());
app.use("/invoices", express.static(path.join(__dirname, "invoices"))); // Serve static files (PDFs)

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "invoicing_db",
});

db.connect((err) => {
  if (err) console.error("Database connection failed." + err.message);
  else console.log("Connected to MySQL database.");
});

app.get("/", (req, res) => {
  res.send("Invoing system backend running");
});

let token;
let email; //logged in user's email

app.post("/clientRegisteration", async (req, res) => {
  const { fullname, email, password, city } = req.body;

  const checkEmailQuery = "SELECT * FROM clientuser_table WHERE email = ?";
  db.query(checkEmailQuery, [email], async (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      return res
        .status(500)
        .json({ message: "Server error while checking email" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery = `INSERT INTO clientuser_table (fullname, email, password, city) VALUES (?, ?, ?, ?)`;

      db.query(
        insertQuery,
        [fullname, email, hashedPassword, city],
        (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ message: "Error inserting data" });
          }
          return res.status(200).json({ message: "Registration successful" });
        }
      );
    } catch (err) {
      console.error("Password hashing failed:", err);
      return res.status(500).json({ message: "Error processing registration" });
    }
  });
});

app.post("/businessRegisteration", async (req, res) => {
  const {
    fullname,
    email,
    password,
    city,
    phone,
    companyName,
    companyWork,
    revenue,
    currentMethod,
  } = req.body;

  const checkEmailQuery = "SELECT * FROM bussinessuser_table WHERE email = ?";
  db.query(checkEmailQuery, [email], async (err, result) => {
    if (err) {
      console.error("Error checking email:", err);
      return res
        .status(500)
        .json({ message: "Server error while checking email" });
    }

    if (result.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    try {
      //console.log("Password is : ", password); // Debugging
      const hashedPassword = await bcrypt.hash(password, 10);
      //console.log("Hashed password is : ", hashedPassword); // Debugging

      const insertQuery = `
        INSERT INTO bussinessuser_table
        (fullname, email, password, city, phone, companyName, companyDo, estRevenue, currMethod, userType)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      db.query(
        insertQuery,
        [
          fullname,
          email,
          hashedPassword,
          city,
          phone,
          companyName,
          companyWork,
          revenue,
          currentMethod,
          "business",
        ],
        (err, result) => {
          if (err) {
            console.error("Error inserting data:", err);
            return res.status(500).json({ message: "Error inserting data" });
          }
          return res.status(200).json({ message: "Registration successful" });
        }
      );
    } catch (err) {
      console.error("Password hashing failed:", err);
      return res.status(500).json({ message: "Error processing registration" });
    }
  });
});

// Business Login
app.post("/businessLogin", async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM bussinessuser_table WHERE email = ?";

  db.query(query, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length > 0) {
      const user = result[0];
      try {
        const passwordToCheck = password.trim(); // Trim the password to remove any extra spaces
       // console.log("Password is : ", passwordToCheck); // Debugging
        //console.log("From db password is : ", user.password); // Debugging
        const isPasswordValid = await bcrypt.compare(
          passwordToCheck,
          user.password
        ); // Await
       //console.log("Is password valid:", isPasswordValid); // Debugging

        if (!isPasswordValid) {
          return res.status(401).json({ err: "Invalid credentials" });
        }

        //Token generation
        const token1 = jwt.sign(
          { email: user.email, usertype: user.userType },
          SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.cookie("authToken", token1, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 3600000,
        });

        return res.json({
          msg: "Login successful",
          email: user.email,
          usertype: user.userType,
        });
      } catch (error) {
        console.error("Error during password comparison:", error);
        return res.status(500).json({ error: "Server error" });
      }
    } else {
      return res.status(401).json({ err: "Invalid credentials" });
    }
  });
});

app.post("/clientLogin", async (req, res) => {
  const { email, password } = req.body;
  const query = "SELECT * FROM clientuser_table WHERE email = ?";

  db.query(query, [email], async (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });

    if (result.length > 0) {
      const user = result[0];
      try {
        const passwordToCheck = password.trim(); // Trim the password to remove any extra spaces
        //console.log("Password is : ", passwordToCheck); // Debugging
        //console.log("From db password is : ", user.password); // Debugging
        const isPasswordValid = await bcrypt.compare(
          passwordToCheck,
          user.password
        ); // Await
        //console.log("Is password valid:", isPasswordValid); // Debugging

        if (!isPasswordValid) {
          return res.status(401).json({ err: "Invalid credentials" });
        }

        //Token generation
        const token2 = jwt.sign(
          { email: user.email, usertype: user.userType },
          SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.cookie("authToken", token2, {
          httpOnly: true,
          secure: false,
          sameSite: "strict",
          maxAge: 3600000,
        });

        return res.json({
          msg: "Login successful",
          email: user.email,
          usertype: user.userType,
        });
      } catch (error) {
        console.error("Error during password comparison:", error);
        return res.status(500).json({ error: "Server error" });
      }
    } else {
      return res.status(401).json({ err: "Invalid credentials" });
    }
  });
});

app.get("/check-auth", (req, res) => {
  token = req.cookies.authToken;
  if (!token) {
    return res
      .status(401)
      .json({ authenticated: false, error: "No token set" });
  }
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ authenticated: false, error: "Invalid token" });
    }
    res.json({ authenticated: true, usertype: decoded.userType });
  });
});

app.get("/bussinessDashboard", (req, res) => {
  token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Unauthorized: No Token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });

    email = decoded.email;
    const query =
      "SELECT fullname,email FROM bussinessuser_table WHERE email = ?";
    db.query(query, [email], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.length > 0) {
        res.json({ name: result[0].fullname, email: result[0].email });
      } else res.status(404).json({ error: "User not found" });
    });
  });
});

app.get("/clientDashboard", (req, res) => {
  token = req.cookies.authToken;
  if (!token) return res.status(401).json({ error: "Unauthorized: No Token" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err)
      return res.status(401).json({ error: "Unauthorized: Invalid Token" });

    email = decoded.email;
    const query = "SELECT fullname,email FROM clientuser_table WHERE email = ?";
    db.query(query, [email], (err, result) => {
      if (err) return res.status(500).json({ error: "Database error" });
      if (result.length > 0) {
        res.json({ name: result[0].fullname, email: result[0].email });
      } else res.status(404).json({ error: "User not found" });
    });
  });
});

app.get("/generateInvoice", (req, res) => {
  //token = req.cookies.authToken;
  if (!token) {
    return res.status(401).json({ error: "No user signed in!" });
  }
  //  jwt.verify(token,SECRET_KEY,(err,decoded)=>{
  //    if(err)
  //      return res.status(401).json({ error: "Unauthorized: Invalid Token" });

  /***for Biller's address */
  // email = decoded.email;
  const query =
    "SELECT fullname,email,companyName,phone,city from bussinessuser_table where email = ?";

  let clientData;
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "Business user not found" });
    const { fullname, email, companyName, phone, city } = result[0];
    // console.log("Company name is : ",companyName);

    /**For dropdown */
    const query2 = "SELECT * FROM businessclients_table WHERE companyName = ?";
    db.query(query2, [companyName], (err, clients) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Database error while fetching clients" });

      if (!clients || clients.length === 0) {
        //console.log("No clients found for company: ",companyName);
      }

      clientData = clients.map((client) => ({
        fullname: client.fullname,
        email: client.email,
      }));
      // console.log("Fetched clients : ",clientData);
      // res.json(clientData);
    });

    const first2Char = (companyName || "XX").substring(0, 2).toUpperCase();

    const prefix = `INV${first2Char}`;
    const query3 = `SELECT invoiceNumber from allinvoices_table WHERE invoiceNumber LIKE ? ORDER BY CAST(SUBSTRING(invoiceNumber,5+1+2) AS UNSIGNED) DESC LIMIT 1`;
    db.query(query3, [`${prefix}%`], (err, invoice) => {
      if (err) {
        return res
          .status(500)
          .json({ error: "Database error while fetching invoice number" });
      }
      let digitPart = 1;
      if (invoice.length > 0 && invoice[0].invoiceNumber) {
        digitPart = parseInt(invoice[0].invoiceNumber.substring(5)) + 1;
      }
      const newInvoiceNumber = `INV${first2Char}${String(digitPart).padStart(
        3,
        "0"
      )}`;

      //console.log("New invoice number is",newInvoiceNumber);
      /*  console.log({
                    name: fullname,
                    companyName: companyName,
                    email:email,
                    phone: phone,
                    city: city,
                    allClients: clientData,
                    invoiceNumber: newInvoiceNumber
                });      */
      res.json({
        name: fullname,
        email: email, // Use 'email' instead of 'bemail'
        companyName: companyName,
        phone: phone,
        city: city,
        allClients: clientData,
        invoiceNumber: newInvoiceNumber,
      });
    });
  });
  //  });
});

app.get("/getGST", async (req, res) => {
  const { description } = req.query;

  try {
    if (!description) {
      return res.status(400).json({ error: "Missing description parameter" });
    }

    //console.log("Received description:", description); // Debugging

    const query = "SELECT item_gst FROM invoiceitems_table WHERE item_desc = ?";

    // Use a Promise to handle the database query properly
    db.query(query, [description], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ error: "Database error while fetching GST" });
      }

      // console.log("Query result:", results); // Debugging

      if (results.length > 0) {
        const gst = results[0].item_gst;
        // console.log("GST from database:", gst);
        res.json({ gst });
      } else {
        // console.log("No GST found, returning 0");
        res.json({ gst: 0 });
      }
    });
  } catch (error) {
    console.error("Error fetching GST:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/saveInvoice", async (req, res) => {
  //console.log(res.status);
  const {
    name,
    companyName,
    bemail,
    phone,
    city,
    selectedClient,
    selectedEmail,
    issueDate,
    dueDate,
    invoiceNumber,
    lines, //iske ander desc of item,rate,qty,gst
    itemPriceTotal,
    gstTotal,
    grandTotal,
    status,
  } = req.body;

  const invoiceQuery =
    "INSERT INTO allinvoices_table (billedBy,billerCompany,billerEmail,billerPhone,billerCity,clientName,clientEmail,issueDate,dueDate,invoiceNumber,status) VALUES(?,?,?,?,?,?,?,?,?,?,?)";
  db.query(
    invoiceQuery,
    [
      name,
      companyName,
      bemail,
      phone,
      city,
      selectedClient,
      selectedEmail,
      issueDate,
      dueDate,
      invoiceNumber,
      status,
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting values in db.", err);
      }
      // const invoiceNumber = result.invoiceNumber;
      // console.log("Invoice number is : ",invoiceNumber);
      //console.log("Item to insert in item table are: ",lines[0].description,lines[0].qty,lines[0].gst);

      const itemQuery =
        "INSERT INTO invoiceSelectedItems_table (invoiceNumber,itemDesc,itemRate,itemQty,itemGST) VALUES ?";
      const itemValues = lines.map((item) => [
        invoiceNumber, // Correctly passing invoiceNumber
        item.description, // Accessing object properties correctly
        item.rate,
        item.qty,
        item.gst,
      ]);
      /* lines.map((item) => {
            console.log(item.description);
        });*/

      db.query(itemQuery, [itemValues], (err) => {
        if (err) console.error("Error inserting item values", err);
        res.status(200).json({ msg: "Invoice saved successfully." });
      });
    }
  );
});

app.post("/saveInvoiceChangesToDataBase", async (req, res) => {
  const {
    issueDate,
    dueDate,
    selectedInvoiceNumber,
    items, // Item details
    subTotal,
    gstTotal,
    grandTotal,
  } = req.body;
  //console.log(items);/
  const invoiceQuery =
    "UPDATE allinvoices_table SET issueDate = ?, dueDate = ? WHERE invoiceNumber = ?";
  db.query(
    invoiceQuery,
    [issueDate, dueDate, selectedInvoiceNumber],
    (err, result) => {
      if (err) {
        console.error("Error updating invoice details:", err);
        return res
          .status(500)
          .json({ error: "Failed to update invoice details" });
      }
      // Delete old items before inserting updated ones
      const deleteQuery =
        "DELETE FROM invoiceselecteditems_table WHERE invoiceNumber = ?";
      db.query(deleteQuery, [selectedInvoiceNumber], (err) => {
        if (err) {
          console.error("Error deleting old invoice items:", err);
          return res
            .status(500)
            .json({ error: "Failed to update invoice items" });
        }
        const insertQuery =
          "INSERT INTO invoiceselecteditems_table (invoiceNumber, itemDesc, itemRate, itemQty, itemGST) VALUES ?";
        const itemValues = items.map((item) => [
          selectedInvoiceNumber,
          item.itemDesc,
          item.itemRate,
          item.itemQty,
          item.itemGST,
        ]);
       // console.log(itemValues);
        db.query(insertQuery, [itemValues], (err) => {
          if (err) {
            console.error("Error inserting new invoice items:", err);
            return res
              .status(500)
              .json({ error: "Failed to insert updated items" });
          }
          res.status(200).json({ msg: "Invoice edited successfully." });
        });
      });
    }
  );
});

app.get("/recentInvoice", (req, res) => {
  const email = req.query.email;
 // console.log("The email is: ", email);
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const query = `
  SELECT * FROM allinvoices_table 
  WHERE billerEmail = ? 
  ORDER BY CAST(SUBSTRING(invoiceNumber, 6) AS UNSIGNED) DESC 
  LIMIT 1
`;

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching invoice:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(200).json({ invoice: null });
    }
    //console.log("Recent invoice is: ",result[0]);
    res.status(200).json({ invoice: result[0] });
  });
});

app.post("/logout", (req, res) => {
  res.clearCookie("authToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
  });
  res.status(200).json({ msg: "Logout successfull." });
});

app.get("/getInvoiceNumbers", (req, res) => {
  // console.log("Email issss : ",email);
  const query =
    "SELECT invoiceNumber from allinvoices_table WHERE billerEmail = ?";

  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "No invoices generated yet" });

    invoices = result.map((row) => ({
      invoiceNumber: row.invoiceNumber,
    }));

    res.json({ invoices });
    //console.log("FEtched invoice number s are : ",invoices);
  });
});

//this is for saved invoices page on the basis of status we are fetching in this and in above all inoivces are fetched.
app.get("/getSavedInvoiceNumbers", (req, res) => {
  const query =
    "SELECT invoiceNumber from allinvoices_table WHERE billerEmail = ? AND status = ?";
  db.query(query, [email, "saved"], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "No invoices generated yet" });

    invoices = result.map((row) => ({
      invoiceNumber: row.invoiceNumber,
    }));

    res.json({ invoices });
    //console.log("FEtched invoice number s are : ",invoices);
  });
});

app.get("/getEditInvoiceData", (req, res) => {
  const { invoiceNumber } = req.query;

  if (!invoiceNumber) {
    return res.status(400).json({ error: "Invoice number is required" });
  }

  const query1 = "SELECT * FROM allinvoices_table WHERE invoiceNumber = ?";
  const query2 =
    "SELECT * FROM invoiceselecteditems_table WHERE invoiceNumber = ?";

  db.query(query1, [invoiceNumber], (err, invoiceResult) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (invoiceResult.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }

    // Fetch items related to the invoice
    db.query(query2, [invoiceNumber], (err, itemsResult) => {
      if (err) {
        return res.status(500).json({ error: "Database error" });
      }

      res.json({
        invoice: invoiceResult[0], // Single invoice object
        items: itemsResult, // Array of selected items
      });
    });
  });
});

app.get("/allClientData", (req, res) => {
  //here we will get name of the bussiness later on
  const { companyName } = req.query;
  //console.log("Company name is backend is : ",companyName);
  const query = "SELECT * FROM businessclients_table WHERE companyName = ?";
  db.query(query, companyName, (err, result) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "No Client data found!" });
    }
    //console.log(result);
    res.json({ data: result });
  });
});

app.post("/createClient", async (req, res) => {
  try {
    const { fullname, email, companyName, phone } = req.body;
    const query =
      "INSERT INTO businessclients_table (fullname, email, companyName, phone) VALUES (?, ?, ?, ?)";
    const values = [fullname, email, companyName, phone];

    db.query(query, values, (err, result) => {
      if (err) {
        // console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(201).json({ message: "Client added successfully!" });
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/companyName", async (req, res) => {
  const { email } = req.query;
  const query = "SELECT companyName FROM bussinessuser_table WHERE email = ?";

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.status(200).json({ companyName: result[0].companyName });
    //console.log("Company name is: ", result[0].companyName);
  });
});

app.get("/allInvoicesCreated", (req, res) => {
  const email = req.query.email;
 // console.log("The email is: ", email);
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }
  const query = `SELECT * FROM allinvoices_table WHERE billerEmail = ?`;
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching invoices:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(200).json({ invoice: null });
    }
    //console.log(result);
    res.status(200).json({ data: result });
  });
});

app.post("/generateInvoicePDF", async (req, res) => {
  //console.log("Date coming in backend is : ",req.body.dueDate);
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    // Generate HTML for the invoice
    let itemsHtml = "";
    //console.log("Items are :", req.body.lines);
    req.body.lines.forEach((item) => {
      itemsHtml += ` <tr>
          <td>${item.description}</td>
          <td>${item.rate}</td>
          <td>${item.qty}</td>
          <td>${item.rate * item.qty}</td>
          <td>
            ${item.rate * item.qty + (item.rate * item.qty * item.gst) / 100}
          </td>
        </tr>`;
    });

    const content = `
             <!DOCTYPE html>
             <html lang="en">
             <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Invoice Form</title>
              <style>
                  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
  
               body {
                font-family: 'Poppins', sans-serif;
                background-color: #f8f9fa;
                margin: 0;
                padding: 20px;
              }
  
              .outer {
                display: flex;
                flex-direction: column;
                align-items: center;
              background: #fff;
              padding: 20px;
              max-width: 800px;
              margin: auto;
              border-radius: 10px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
  
          .headingDiv {
              text-align: center;
              width: 100%;
              padding-bottom: 10px;
          }
  
          .heading {
              font-size: 26px;
              font-weight: 600;
              color: #333;
          }
  
          hr {
              width: 100%;
              border: none;
              height: 2px;
              background: #ddd;
              margin: 10px 0;
          }
  
          .content {
              width: 100%;
              padding: 20px;
          }
  
          .section {
              background-color: #f1f1f1;
              padding: 15px;
              border-radius: 8px;
              margin-bottom: 15px;
          }
  
          .invoiceDetails2 {
              display: flex;
              flex-wrap: wrap;
              gap: 15px;
          }
  
          .invoiceDetails2 div {
              flex: 1;
              min-width: 150px;
          }
  
          p {
              margin: 5px 0;
          }
  
          input[type="date"] {
              border: 1px solid #ccc;
              padding: 6px;
              width: 100%;
              border-radius: 4px;
              background: white;
              font-size: 14px;
          }
  
          .table-container {
              margin-top: 20px;
              overflow-x: auto;
          }
  
          table {
              width: 100%;
              border-collapse: collapse;
              background: white;
          }
  
          th, td {
              padding: 10px;
              text-align: left;
              border: 1px solid #ddd;
          }
  
          th {
              background: #007bff;
              color: white;
          }
  
          .totalAmount {
              text-align: right;
              margin-top: 20px;
              font-size: 16px;
              font-weight: 600;
          }
      </style>
  </head>
  <body>
  
      <div class="outer">
          <div class="headingDiv">
              <h3 class="heading">Invoice Form</h3>
          </div>
          <hr />
  
          <div class="content">
              <!-- Sender Details -->
              <div class="section">
                  <p><b>Name:</b> ${req.body.name}</p>
                  <p><b>Company:</b> ${req.body.companyName}</p>
                  <p><b>Phone:</b> ${req.body.phone}</p>
                  <p><b>Address:</b> ${req.body.city}</p>
              </div>
  
              <!-- Invoice Details -->
              <div class="section">
                  <div>
                      <p><b>Billed to:</b> ${req.body.selectedClient}</p>
                      <p>${req.body.selectedEmail}</p>
                  </div>
                  <div class="invoiceDetails2">
                      <div>
                          <p><b>Issue Date:</b></p>
                          <input type="date" value=${req.body.issueDate} />
                      </div>
                      <div>
                          <p><b>Due Date:</b></p>
                          <input type="date" value=${req.body.dueDate} />
                      </div>
                      <div>
                          <p><b>Invoice Number:</b> ${req.body.invoiceNumber}</p>
                      </div>
                      <div>
                          <p><b>Total Amount:</b> ₹${req.body.grandTotal}</p>
                      </div>
                  </div>
              </div>
  
              <!-- Item Details -->
              <div class="table-container">
                  <p style="font-weight: bold;">Item List</p>
                  <table>
                      <thead>
                          <tr>
                              <th>Description</th>
                              <th>Rate (₹)</th>
                              <th>Qty</th>
                              <th>Line Total (₹)</th>
                              <th>After GST (₹)</th>
                          </tr>
                      </thead>
                      <tbody>
                          ${itemsHtml}
                      </tbody>
                  </table>
              </div>
  
              <!-- Total Amount -->
              <div class="totalAmount">
                  <p><b>GST Total:</b> ₹${req.body.gstTotal}</p>
                  <p><b>Grand Total:</b> ₹${req.body.grandTotal}</p>
              </div>
          </div>
      </div>
  </body>
  </html>`;

    await page.setContent(content);
    // Generate PDF Buffer
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();
    // Send the PDF Buffer as a response
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=invoice.pdf",
      "Content-Length": pdfBuffer.length,
    });
    res.end(pdfBuffer);

    //After sending PDF,creatr calendar event for reminder
    await createPaymentReminder(
      req.body.selectedClient,
      req.body.dueDate,
      req.body.grandTotal
    );
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
});

async function createPaymentReminder(clientName, dueDate, amount) {
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, "keys/service-account-key.json"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  const authClient = await auth.getClient();
  const calendar = google.calendar({ version: "v3", auth: authClient });
  const calendarId = "primary";
  const event = {
    summary: `Payment Reminder: ${clientName}`,
    description: `Payment of ₹{amount} is due.`,
    start: {
      dateTime: new Date(dueDate).toISOString(),
      timezone: "Asia/kolkata",
    },
    end: {
      dateTime: new Date(dueDate).toISOString(),
      timezone: "Asia/kolkata",
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 24 * 60 },
        { method: "popup", minutes: 10 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });
  //console.log('Event created: %s',response.data.htmlLink);
}

app.post("/sendInvoiceEmail", async (req, res) => {
  // console.log("Email sending request received!");
  const { senderEmail, recipientEmail, clientName, pdfBase64, calendarLink } =
    req.body;
  //console.log("Sender email id in backend is: ",senderEmail);
  //console.log("Selected email id in backend is: ",recipientEmail);
  try {
    await sendEmail(
      senderEmail,
      recipientEmail,
      clientName,
      pdfBase64,
      calendarLink
    );
    res.json({ success: true, message: "Invoice email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.get("/getAllInvoicesData", (req, res) => {
  const query = "SELECT * from allinvoices_table";
  db.query(query, (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (result.length === 0)
      return res.status(404).json({ error: "No invoices generated yet" });
    //console.log(result);
    res.json({ result });
  });
});

app.get("/getTrackInvoicesData", (req, res) => {
  const email = req.query.email;
  const query = "SELECT * from allinvoices_table WHERE billerEmail = ?";
  db.query(query, [email], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    //console.log(result);
    if (result.length === 0)
      return res.status(404).json({ error: "No invoices generated yet" });
    //console.log(result);
    res.json({ result });
  });
});

//report data
app.get("/getReportData", (req, res) => {
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: "No user is signed in!" });
  }

  const query1 =
    "SELECT COUNT(*) as totalInvoices FROM allinvoices_table WHERE billerEmail = ?";
  db.query(query1, [email], (err, result1) => {
    if (err) return res.status(500).json({ error: "Database error" });
    const noOfInvoices = result1[0].totalInvoices;

    const query2 =
      "SELECT COUNT(*) as totalInvoicesSent FROM allinvoices_table WHERE billerEmail = ? AND status = 'sent'";
    db.query(query2, [email], (err, result2) => {
      if (err) return res.status(500).json({ error: "Database error" });
      const noOfSentInvoices = result2[0].totalInvoicesSent;

      const query3 =
        "SELECT COUNT(*) as totalInvoiceSaved FROM allinvoices_table WHERE billerEmail = ? AND status = 'saved'";
      db.query(query3, [email], (err, result3) => {
        if (err) return res.status(500).json({ error: "Database error" });
        const noOfSavedInvoices = result3[0].totalInvoiceSaved;

        const query4 = `SELECT SUM(i.itemRate * i.itemQty + (i.itemRate * i.itemQty * i.itemGST / 100)) AS totalRevenue 
                        FROM invoiceselecteditems_table i 
                        JOIN allinvoices_table a 
                        ON i.invoiceNumber = a.invoiceNumber 
                        WHERE a.billerEmail = ?`;
        db.query(query4, [email], (err, result4) => {
          if (err) return res.status(500).json({ error: "Database error" });
          const totalRevenue = parseFloat(result4[0].totalRevenue) || 0;

          // Get company name from billerEmail
          const query5 = "SELECT billerCompany FROM allinvoices_table WHERE billerEmail = ? LIMIT 1";
          db.query(query5, [email], (err, result5) => {
            if (err || result5.length === 0) {
              return res.status(500).json({ error: "Could not fetch company name" });
            }
            const companyName = result5[0].billerCompany;

            //console.log("Company name is : ",companyName);

            const query6 =
              "SELECT COUNT(DISTINCT email) AS totalClients FROM businessclients_table WHERE companyName = ?";
            db.query(query6, [companyName], (err, result6) => {
              if (err) return res.status(500).json({ error: "Database error" });
              const totalClients = result6[0].totalClients;
             // console.log("Total clients are: ",totalClients);

              res.status(200).json({
                totalClients,
                totalInvoices: noOfInvoices,
                totalInvoicesSent: noOfSentInvoices,
                totalInvoicesSaved: noOfSavedInvoices,
                totalRevenue,
              });
            });
          });
        });
      });
    });
  });
});

app.get("/getTopClientAndMonthlyRevenue", (req, res) => {
  const email = req.query.email;
  const topClientsQuery = `
    SELECT i.clientName,
    SUM(s.itemRate * s.itemQty + (s.itemRate * s.itemQty * s.itemGST / 100)) AS totalRevenue
    FROM invoiceselecteditems_table s
    JOIN allinvoices_table i ON s.invoiceNumber = i.invoiceNumber
    WHERE i.billerEmail = ?
    GROUP BY i.clientName
    ORDER BY totalRevenue DESC
    LIMIT 2`;

  const monthlyRevenueQuery = `
    SELECT SUM(s.itemRate * s.itemQty + (s.itemRate * s.itemQty * s.itemGST / 100)) AS monthlyRevenue
    FROM invoiceselecteditems_table s
    JOIN allinvoices_table i ON s.invoiceNumber = i.invoiceNumber
    WHERE i.billerEmail = ? 
    AND MONTH(i.issueDate) = MONTH(CURRENT_DATE()) 
    AND YEAR(i.issueDate) = YEAR(CURRENT_DATE())`;
  db.query(topClientsQuery, [email], (err1, topClientsResult) => {
    if (err1) {
      console.error("Top clients query error:", err1);
      return res
        .status(500)
        .json({ error: "Database error in top clients query", details: err1 });
    }
    db.query(monthlyRevenueQuery, [email], (err2, monthlyRevenueResult) => {
      if (err2) {
        console.error("Monthly revenue query error:", err2);
        return res
          .status(500)
          .json({ error: "Database error in revenue query", details: err2 });
      }
      const monthlyRevenue = monthlyRevenueResult[0]?.monthlyRevenue || 0;
      // console.log("Top clients: ", topClientsResult);
      //console.log("Monthly revenue: ", monthlyRevenue);
      return res.status(200).json({
        topClients: topClientsResult,
        currentMonthRevenue: monthlyRevenue,
      });
    });
  });
});

app.post("/updateClient", (req, res) => {
  const { fullname, email, phone } = req.body;
  const query = `UPDATE businessclients_table SET fullname = ?, email = ?, phone = ? WHERE email = ?`;

  db.query(query, [fullname, email, phone, email], (err, result) => {
    if (err) {
      console.error("Error updating client:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: "Client not found" });
    }
    res.status(200).json({ message: "Client updated successfully" });
  });
});

app.get("/getClientInvoices", (req, res) => {
  const email = req.query.email;
  const query = "SELECT * FROM allinvoices_table WHERE clientEmail = ?";
  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching invoices:", err);
      return res.status(500).json({ error: "Failed to fetch invoices" });
    }
    //console.log("Invoices fetched:", result);
    return res.json(result);
  });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
