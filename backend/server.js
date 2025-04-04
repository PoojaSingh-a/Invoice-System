const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const sendEmail = require("./sendEmail");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

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

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const query =
    "SELECT * FROM bussinessuser_table WHERE email = ? AND password = ?";

  db.query(query, [email, password], (err, result) => {
    if (err) res.status(500).json({ error: "Database error" });
    else if (result.length > 0) {
      const user = result[0];
      /**Cookie generation */
      const token = jwt.sign(
        { email: user.email, usertype: user.userType },
        SECRET_KEY,
        { expiresIn: "1h" }
      );
      res.cookie("authToken", token, {
        httpOnly: true,
        secure: false,
        sameSite: "strict",
        maxAge: 3600000,
      });

      res.json({
        msg: "Login successful",
        email: user.email,
        usertype: user.userType,
      });
    } else res.status(401).json({ err: "Invalid credentials" });
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
        //   console.log(result[0].fullname);
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

    const query3 =
      "SELECT invoiceNumber FROM allInvoices_table ORDER BY CAST(SUBSTRING(invoiceNumber, 6) AS UNSIGNED) DESC LIMIT 1";
    db.query(query3, [companyName], (err, invoice) => {
      if (err)
        return res
          .status(500)
          .json({ error: "Database error while fetching invoice number" });
      //console.log("Invoice number is: ",invoice);

      let newInvoiceNumber = "INV";
      const first2Char = companyName.substring(0, 2);
      newInvoiceNumber = newInvoiceNumber + first2Char;
      const digitPart = parseInt(invoice[0].invoiceNumber.substring(5)) + 1;
      newInvoiceNumber = newInvoiceNumber + digitPart;
      newInvoiceNumber = newInvoiceNumber.toUpperCase();
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
  } = req.body;

  const invoiceQuery =
    "INSERT INTO allinvoices_table (billedBy,billerCompany,billerEmail,billerPhone,billerCity,clientName,clientEmail,issueDate,dueDate,invoiceNumber) VALUES(?,?,?,?,?,?,?,?,?,?)";
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
        console.log(itemValues);
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
  //console.log("The email is: ",email)
  if (!email) {
    return res.status(400).json({ error: "email is required" });
  }

  const query = `SELECT * FROM allinvoices_table WHERE billerEmail = ? ORDER BY issueDate DESC LIMIT 1`;

  db.query(query, [email], (err, result) => {
    if (err) {
      console.error("Error fetching invoice:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (result.length === 0) {
      return res.status(200).json({ invoice: null });
    }

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
  console.log("The email is: ", email);
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
    console.log(result);
    res.status(200).json({ data: result });
  });
});

app.post("/generateInvoicePDF", async (req, res) => {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Generate HTML for the invoice
    let itemsHtml = "";
    req.body.lines.forEach((item) => {
      itemsHtml += (
       ` <tr>
          <td>${item.description}</td>
          <td>${item.rate}</td>
          <td>${item.qty}</td>
          <td>${item.rate * item.qty}</td>
          <td>
            ${item.rate * item.qty + (item.rate * item.qty * item.gst) / 100}
          </td>
        </tr>`
      );
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
                          <input type="date" value=${req.body.dueDate}/>
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
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
});

app.post("/sendInvoiceEmail", async (req, res) => {
  console.log("Email sending request received!");
  const { senderEmail, recipientEmail, clientName, pdfBase64 } = req.body;

  try {
    await sendEmail(senderEmail, recipientEmail, clientName, pdfBase64);
    res.json({ success: true, message: "Invoice email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
