import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import { ToastContainer, toast } from "react-toastify";
import NewClientForm from '../components/NewClientForm';
import "react-toastify/dist/ReactToastify.css";

const GenerateInvoice = () => {
  const [isFormOpen, setIsFormOpen] = useState(false); //State to toggle form
  const [lines, setLines] = useState([]);
  //const [clientDetails, setClientDetails] = useState(null); //all clients of the company
  const [allClients, setClients] = useState([]);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [bemail, setBemail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [allClientsName, setAllClientName] = useState([]);
  const [allClientsEmail, setAllClientEmail] = useState([]);
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [itemPriceTotal, setItemPriceTotal] = useState();
  const [gstTotal, setGstTotal] = useState();
  const [grandTotal, setGrandTotal] = useState();

  /** For Add items in invoice*/
  const addLine = () => {
    setLines([...lines, { description: '', rate: '', qty: '', gst: 0 }]);
  };

  /**For getting details of the person making invoice from db */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/generateInvoice", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        // console.log("this comes from backend", data)
        if (response.ok) {
          setName(data.name);
          setCompanyName(data.companyName);
          setBemail(data.email);
          //console.log("Emasillllll ",bemail);
          setPhone(data.phone);
          setCity(data.city);
          setClients(data.allClients);
          setAllClientName(data.allClients.map(client => client.fullname));
          setAllClientEmail(data.allClients.map(client => client.email));
          setInvoiceNumber(data.invoiceNumber);
        }
        else {
          console.log("Error: ", data.error);
        }
      }
      catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }
    fetchUserData();
  }, []);

  /**For Issue Date and Due Date */
  useEffect(() => {
    const currentDate = new Date();
    const formattedIssueDate = currentDate.toISOString().split("T")[0];
    setIssueDate(formattedIssueDate);
    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(currentDate.getMonth() + 1);
    const formattedDueDate = nextMonthDate.toISOString().split("T")[0];
    setDueDate(formattedDueDate);
  }, []);

  /**For Calculation of GST*/
  const handleLineChange = (index, field, value) => {
    setLines(prevLines =>
      prevLines.map((line, i) =>
        i === index ? { ...line, [field]: value } : line
      )
    )
  }

  const fetchGST = async (description, index) => {
    if (!description)
      return;
    try {
      console.log("Got GST");
      const response = await fetch(`http://localhost:5000/getGST?description=${encodeURIComponent(description)}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        //setgstValue(data.gst);
        console.log("GST Value : ", data.gst);
        setLines(prevLines =>
          prevLines.map((line, i) =>
            i === index ? { ...line, gst: data.gst } : line
          )
        );
      }
      else {
        console.error("Error fetching GST: ", data.error);
      }
    }
    catch (error) {
      console.error("Error fetching GST : ", error);
    }
  };

  useEffect(() => {
    let totalItemPrice = 0;
    let totalGST = 0;
    lines.forEach(line => {
      const itemTotal = (line.rate * line.qty);
      const gstAmount = (itemTotal * line.gst) / 100;
      totalItemPrice += itemTotal;
      totalGST += gstAmount;
    });
    setItemPriceTotal(totalItemPrice);
    setGstTotal(totalGST);
    setGrandTotal(totalItemPrice + totalGST);
  }, [lines]);

  const [selectedClient, setSelectedClient] = useState();
  const [selectedEmail, setSelectedEmail] = useState();

  const handleClientChnage = (e) => {
    const clientName = e.target.value;
    setSelectedClient(clientName);
    const selectedClientData = allClients.find(client => client.fullname === clientName);
    if (selectedClientData) {
      setSelectedEmail(selectedClientData.email);
    }
  };

  // Use useEffect to log the updated values
  useEffect(() => {
    //console.log("Selected client is : ", selectedClient, " ", selectedEmail);
  }, [selectedClient, selectedEmail]);

  const saveInvoiceToDataBase = async (statusValue) => {
    let status;
    const invoiceData = {
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
      lines, //iske ander desc of item,rate,qty 
      itemPriceTotal,
      gstTotal,
      grandTotal,
      status:statusValue,
    };
    console.log("This data is going to be saveddddd",invoiceData);
    try {
      const response = await fetch('http://localhost:5000/saveInvoice', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Invoice saved successfully.");
        setSelectedClient("");
        setSelectedEmail("");
        setLines([]);
        setItemPriceTotal(0);
        setGrandTotal(0);
        setInvoiceNumber("");
        setTimeout(() => {
          //navigate("/");
        }, 500);
      }
      else {
        alert(`Error: ${data.error}`);
      }
    }
    catch (error) {
      console.error("Error saving invoice:", error);
      alert("Failed to save invoice.");
    }
    //clear all input 

  };

  const deleteItem = (index) => {
    setLines(prevLines => prevLines.filter((_, i) => i !== index));
  };

  const createICSFileContent = (eventTitle, startDateTime, endDateTime, description) => {
    const uid = `${Date.now()}@mycalendar.com`; // generate unique ID
    const dtstamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'; // format DTSTAMP

    return `
  BEGIN:VCALENDAR
  VERSION:2.0
  PRODID:-//My App//EN
  CALSCALE:GREGORIAN
  BEGIN:VEVENT
  UID:${uid}
  DTSTAMP:${dtstamp}
  SUMMARY:${eventTitle}
  DESCRIPTION:${description}
  DTSTART:${startDateTime}
  DTEND:${endDateTime}
  END:VEVENT
  END:VCALENDAR
    `.trim();
  };

  function formatDateForICS(date) {
    const d = new Date(date + 'T00:00:00Z'); 
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  const sendInvoiceEmail = async (event) => {
    event.preventDefault();
    const name = selectedClient.replace(/\s+/g, "").toLowerCase();
    const email = name + "@resend.dev"; // Dummy email, replace later.
    //console.log("Due date is:", dueDate);
    console.log("In Lines is: ",lines);
    try {
      // Step 1: Generate Invoice PDF
      const pdfResponse = await fetch("http://localhost:5000/generateInvoicePDF", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines, name, companyName, bemail, phone, city, selectedClient, selectedEmail,
          issueDate, dueDate, invoiceNumber, itemPriceTotal, gstTotal, grandTotal,
        }),
      });
      if (!pdfResponse.ok) {
        throw new Error("Failed to generate invoice PDF.");
      }
      // Convert response into a Blob
      const pdfBlob = await pdfResponse.blob();
      // Open the PDF in a new tab
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, "_blank");
      // Prepare Base64 of PDF
      const pdfBase64 = await blobToBase64(pdfBlob);
      //Create google cal. link
      const eventTitle = encodeURIComponent("Invoice due reminder");
      const eventDescription = encodeURIComponent("Reminder  to pay invoice before due date");
      const startDateTime = formatDateForICS(issueDate);
      const endDateTime = formatDateForICS(dueDate);
      //console.log("in string format: ",startDateTime);
      const googleCalendarLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&&dates=${startDateTime}/${endDateTime}&details=${eventDescription}`;
      //console.log("Calendar link : ",googleCalendarLink);
      //console.log("Selected email address is : ",selectedEmail);
      const emailResponse = await fetch("http://localhost:5000/sendInvoiceEmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: email,
          recipientEmail: selectedEmail,
          clientName: selectedClient,
          pdfBase64: pdfBase64,
          calendarLink: googleCalendarLink,
        }),
      });
      const emailResult = await emailResponse.json();
      if (emailResult.success) {
        alert("Invoice sent successfully!");
      } else {
        alert("Failed to send invoice email.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong!");
    }
  };

  // Helper function to convert Blob to Base64
  const blobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleSendToClient = async(e) => {
    e.preventDefault();
    await saveInvoiceToDataBase("sent");
    await sendInvoiceEmail(e);
  }

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-l from-blue-100 to-blue-300 relative">
      <div className={`w-2/3 flex flex-col`}>
        <div className='flex justify-between'>
          <h3 className='text-3xl font-bold text-blue-700 mt-2'>New Invoice</h3>
          <div className='flex gap-4'>
            <a href="#" className='mt-4 mr-3 text-red-600 underline' onClick={() => window.history.back()}>Cancel</a>
            <button className='pt-1 pb-1 pr-4 pl-4 bg-blue-600 text-white mt-2 rounded' onClick={() => {saveInvoiceToDataBase("saved")}}>Save</button>
          </div>
        </div>
        <form action="" className='mt-4 mb-7 bg-white p-6 rounded shadow-lg'>
          <div className='flex flex-col bg-zinc-100 p-3 rounded'>
            <p className='mt-2'><strong>Name:  {name ? `${name}` : "Loading..."}</strong></p>
            <p className='mt-2'><strong>Company Name:  {companyName ? `${companyName}` : "Loading..."}</strong></p>
            <p className='mt-2'><strong>Phone: {phone ? `${phone}` : "Loading..."}</strong></p>
            <p className='mt-2'><strong>Address: {city ? `${city}` : "Loading..."}</strong></p>
          </div>
          <div className='flex gap-20 mt-6'>
            <div className='flex flex-col w-1/4'>
              <div className='font-bold'>Billed to</div>
              <div className='mt-2'>
                <select className='p-1 w-40 rounded border-2' onChange={handleClientChnage} value={selectedClient}>
                  <option value="" >Select a Client</option>
                  {allClients.map((client, index) => (
                    <option key={index} value={client.fullname}>{client.fullname}</option>
                  ))}
                </select>
              </div>
              <button type="button" className='text-blue-400 mt-5 text-base text-start hover:text-blue-600' onClick={() => setIsFormOpen(true)} >
                + Create New Client
              </button>
            </div>
            <div className='flex flex-col w-1/4'>
              <div className='text-gray-700'>Date of issue</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" value={issueDate} onChange={(e) => setToday(e.target.value)} />
              <div className='text-gray-700 mt-4'>Due Date</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-gray-700 mt-6'>Invoice number</div>
              <div className='mt-2 bg-zinc-200 p-2 rounded w-32 text-center text-gray-600'>{invoiceNumber}</div>
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-2xl font-bold mt-6'>Total Amount</div>
              <div className='mt-3 text-2xl text-green-700 font-semibold'>₹ {grandTotal}</div>
            </div>
          </div>
          <hr className='mt-5 border-gray-400' />
          <div className='flex text-zinc-600 mt-2 mb-4 font-semibold'>
            <div className='w-1/2'>Description</div>
            <div className='w-1/6'>Rate</div>
            <div className='w-1/6'>Qty</div>
            <div className='w-1/6 text-center'>Line Total</div>
            <div className='w-1/6 text-center'>After GST</div>
          </div>
          {lines.map((line, index) => (
            <div key={index} className='flex text-zinc-500 mt-2'>
              <i className='bi bi-trash text-red-500 cursor-pointer mr-2 mt-2' onClick={() => deleteItem(index)}></i>
              <input className="bg-zinc-200 p-2 rounded w-2/5" type="text" placeholder="Description"
                onChange={(e) => {
                  const value = e.target.value;
                  handleLineChange(index, "description", value);
                }}
                onBlur={(e) => {
                  fetchGST(e.target.value, index); // Fetch GST
                }
                } />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder="Rate" onChange={(e) => handleLineChange(index, "rate", e.target.value)} />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder="Qty" onChange={(e) => handleLineChange(index, "qty", e.target.value)} />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="text" placeholder="Line Total" value={line.rate * line.qty || 0} readOnly />
              <input placeholder='Adding GST' className='bg-zinc-200 p-2 rounded w-1/6 ml-4' value={(line.rate * line.qty) + ((line.rate * line.qty) * line.gst) / 100 || 0}
              />
            </div>
          ))}
          <div className='mt-3 w-full border-dashed border-2 border-blue-500 rounded p-3 text-center cursor-pointer hover:bg-blue-100' onClick={addLine}>
            + Add a Line
          </div>
          <div className='flex flex-col items-end mt-6'>
            <div className='flex justify-between w-1/4'>
              <div className='font-semibold'>Subtotal</div>
              <div>₹ {itemPriceTotal}</div>
            </div>
            <div className='flex justify-between w-1/4 mt-2'>
              <div className='font-semibold'>GST Total</div>
              <div>₹ {gstTotal}</div>
            </div>
            <hr className='w-1/4 my-2 border-gray-400' />
            <div className='flex justify-between w-1/4'>
              <div className='font-bold'>Grand Total</div>
              <div className='font-bold'>₹ {grandTotal}</div>
            </div>
          </div>
          <div className='flex justify-end'>
            <button className='bg-blue-600 mt-5 w-40 p-3 font-bold text-white rounded hover:bg-blue-700 transition duration-300' onClick={handleSendToClient}>Send to Client</button>
          </div>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
      {isFormOpen && <NewClientForm onClose={() => setIsFormOpen(false)} companyName={companyName} />}
    </div>
  );
};

export default GenerateInvoice;