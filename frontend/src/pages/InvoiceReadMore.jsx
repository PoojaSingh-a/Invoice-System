import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams } from "react-router-dom";

const InvoiceReadMore = () => {
  const { invoiceNumber } = useParams();
  const [lines, setLines] = useState([]);
  //details of user
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [bemail, setBemail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  //In items all the items that are present in the selected invoice
  const [items, setItems] = useState([]);
  //Client that is associated with the invoice number selected 
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [issueDate, setIssueDate] = useState(null);
  const [dueDate, setdueDate] = useState(null);

  //runs after every render
  useEffect(() => {
    //will run only at initial render[] will not run after that
    const fetchInvoicesNumber = async () => {
      try {
        const response = await fetch("http://localhost:5000/getInvoiceNumbers", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        // console.log("these invoices comes from backend", data);
        if (response.ok) {
          setInvoiceNumbers(data.invoices);
        }
        else {
          console.log("Error: ", data.error);
        }
      }
      catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch("http://localhost:5000/generateInvoice", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        //console.log("this comes from backend", data)
        if (response.ok) {
          setName(data.name);
          setCompanyName(data.companyName);
          setBemail(data.email);
          setPhone(data.phone);
          setCity(data.city);
        }
        else {
          console.log("Error: ", data.error);
        }
      }
      catch (error) {
        console.error("Error fetching user data: ", error);
      }
    }
    fetchInvoicesNumber();
    fetchUserData();
  }, []);

  //fetch all corrsponding details related to that invoice number
  const handleInvoiceChange = async (e) => {
    if (!invoiceNumber) {
      console.error("Invoice number is required");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/getEditInvoiceData?invoiceNumber=${invoiceNumber}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      console.log("Fetched Data: ", data);

      if (response.ok) {
        setClientName(data.invoice.clientName);
        setClientEmail(data.invoice.clientEmail);
        setIssueDate(data.invoice.issueDate ? new Date(data.invoice.issueDate).toLocaleDateString('en-CA') : "");
        setdueDate(data.invoice.dueDate ? new Date(data.invoice.dueDate).toLocaleDateString('en-CA') : "");

        setItems(data.items || []); //all items in here 
      } else {
        console.log("Error: ", data.error);
      }
    } catch (error) {
      console.error("Error fetching invoice data: ", error);
    }
    console.log("Issue date : ", issueDate);
    console.log("due date : ", dueDate);
  };
  handleInvoiceChange();
  //Calculate total for every line and all
  const calculateTotals = () => {
    let subTotal = 0;
    let gstTotal = 0;
    items.forEach(item => {
      const lineTotal = item.itemRate * item.itemQty;
      subTotal += lineTotal;
      gstTotal += lineTotal * (item.itemGST / 100);
    });
    const grandTotal = subTotal + gstTotal;
    return { subTotal, gstTotal, grandTotal };
  };
  const { subTotal, gstTotal, grandTotal } = calculateTotals();

  /**Fetch GST from db*/
  const fetchGST = async (description, index, isItem) => {
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
        if (isItem) {
          setItems(prevItems =>
            prevItems.map((item, i) =>
              i === index ? { ...item, itemGST: data.gst } : item
            ));
        } else {
          setLines(prevLines =>
            prevLines.map((line, i) =>
              i === index ? { ...line, gst: data.gst } : line
            ));
        }
      } else {
        console.error("Error fetching GST: ", data.error);
      }
    } catch (error) {
      console.error("Error fetching GST: ", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-l from-blue-100 to-blue-300 relative">
      <div className="w-2/3 flex flex-col">
        <div className='flex justify-between'>
          <h3 className='text-3xl font-bold text-blue-700 mt-2'>Invoice</h3>
          <div className='flex gap-4'>
            <a href="#" className='mt-4 mr-3 text-red-600 underline' onClick={() => window.history.back()}>Cancel</a>
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
                <p className='mt-2'>{clientName}</p>
                <p className='mt-2'>{clientEmail}</p>
              </div>
            </div>
            <div className='flex flex-col w-1/4'>
              <div className='text-gray-700'>Date of issue</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" value={issueDate}/>
              <div className='text-gray-700 mt-4'>Due Date</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" value={dueDate}/>
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-gray-700 mt-6'>Invoice number</div>
              <div className='mt-2 bg-zinc-200 p-2 rounded w-32 text-center text-gray-600'>{invoiceNumber}</div>
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-2xl font-bold mt-6'>Total Amount</div>
              <div className='mt-3 text-2xl text-green-700 font-semibold'>₹ {grandTotal.toFixed(2)}</div>
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

          {items.length > 0 ? (
            items.map((item, index1) => (
              <div key={index1} className='flex text-zinc-500 mt-2'>
                <input className="bg-zinc-200 p-2 rounded w-2/5" type="text" placeholder={item.itemDesc} readOnly/>
                <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder={item.itemRate} readOnly/>
                <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder={item.itemQty} readOnly/>
                <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="text" value={(item.itemRate * item.itemQty).toFixed(2)} readOnly />
                <input placeholder='Adding GST' className='bg-zinc-200 p-2 rounded w-1/6 ml-4'
                  value={((item.itemRate * item.itemQty) + ((item.itemRate * item.itemQty) * item.itemGST) / 100 || 0).toFixed(2)}
                  readOnly
                />

              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 mt-2">No items available</p>
          )}

          <div className='flex flex-col items-end mt-6'>
            <div className='flex justify-between w-1/4'>
              <div className='font-semibold'>Subtotal</div>
              <div>₹ {subTotal.toFixed(2)}</div>
            </div>
            <div className='flex justify-between w-1/4 mt-2'>
              <div className='font-semibold'>GST Total</div>
              <div>₹ {gstTotal.toFixed(2)}</div>
            </div>
            <hr className='w-1/4 my-2 border-gray-400' />
            <div className='flex justify-between w-1/4'>
              <div className='font-bold'>Grand Total</div>
              <div className='font-bold'>₹ {grandTotal.toFixed(2)}</div>
            </div>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default InvoiceReadMore;
