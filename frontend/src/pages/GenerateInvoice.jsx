import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';

const GenerateInvoice = () => {
  const [lines, setLines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);

  /** For Add task*/
  const addLine = () => {
      setLines([...lines, { description: '', rate: '', qty: '', gst: 0 }]);
  };

  /**For getting details of the person making invoice from db */
  const [name,setName] = useState('');
  const [companyName,setCompanyName] = useState('');
  const [phone,setPhone] = useState('');
  const [city,setCity] = useState('');
  const [allClients,setAllClientName] = useState([]);
  const [invoiceNumber,setInvoiceNumber] = useState('');

  useEffect(()=>{
    const fetchUserData = async()=> {
      try{
        const response = await fetch("http://localhost:5000/generateInvoice",{
          method:"GET",
          credentials:"include",
        });
        const data = await response.json();
        console.log("this comes from backend",data)
        if(response.ok){
          setName(data.name);
          setCompanyName(data.companyName);
          setPhone(data.phone);
          setCity(data.city);
          setAllClientName(data.allClients);
          setInvoiceNumber(data.invoiceNumber);
        }
        else{
          console.log("Error: ",data.error);
        }
      }
      catch(error){
        console.error("Error fetching user data: ",error);
      }
    }
    fetchUserData();
  },[]);

  /** For the person for whom invoice is being made */
  const handleClientSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;

    setClientDetails({ name, phone, address });
    setShowModal(false);
  };

  /**For Issue Date and Due Date */
  const [issueDate,setIssueDate] = useState("");
  const [dueDate,setDueDate] = useState("");

  useEffect(()=>{
    const currentDate = new Date();
    const formattedIssueDate = currentDate.toISOString().split("T")[0];
    setIssueDate(formattedIssueDate);

    const nextMonthDate = new Date(currentDate);
    nextMonthDate.setMonth(currentDate.getMonth() + 1);
    const formattedDueDate = nextMonthDate.toISOString().split("T")[0];

    setDueDate(formattedDueDate);
  },[]);

  /**For Calculation of GST*/
  const handleLineChange  = (index,field,value)=>{
    setLines(prevLines => 
      prevLines.map((line,i)=>
      i === index ? {...line,[field]: value}:line
      )
    )
  }

  const [gstValue,setgstValue] = useState([]);

  const fetchGST = async(description,index)=>{
    if(!description)
        return;
    try{
      console.log("Got GST");
      const response = await fetch(`http://localhost:5000/getGST?description=${encodeURIComponent(description)}`,{
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();
      if(response.ok){
        //setgstValue(data.gst);
        console.log("GST Value : ",data.gst);
        setLines(prevLines => 
          prevLines.map((line,i)=>
            i === index ? {...line,gst:data.gst}:line
          )
        );
      }
      else{
        console.error("Error fetching GST: ",data.error);
      }
    }
    catch(error){
      console.error("Error fetching GST : ",error);
    }
  };

  const [itemPriceTotal,setItemPriceTotal] = useState();
  const [gstTotal,setGstTotal] = useState();
  const [grandTotal,setGrandTotal] = useState();

  useEffect(() => {
    let totalItemPrice = 0;
    let totalGST = 0;

    lines.forEach(line=>{
      const itemTotal = (line.rate * line.qty);
      const gstAmount = (itemTotal * line.gst)/100;
      totalItemPrice += itemTotal;
      totalGST += gstAmount;
    });

    setItemPriceTotal(totalItemPrice);
    setGstTotal(totalGST);
    setGrandTotal(totalItemPrice + totalGST);
  },[lines]);


  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-l from-blue-100 to-blue-300 relative">
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
            <h3 className="text-xl font-bold mb-4">Create New Client</h3>
            <form onSubmit={handleClientSubmit} className="flex flex-col gap-3">
              <input className="border p-2 rounded" name="name" placeholder="Client Name" required />
              <input className="border p-2 rounded" name="name" placeholder="Company" required />
              <input className="border p-2 rounded" name="name" placeholder="Email" required />
              <input className="border p-2 rounded" name="phone" placeholder="Phone Number" required />
              <button type="submit" className="bg-blue-600 text-white p-2 rounded">Save Client</button>
              <button type="button" className="text-red-500 mt-2" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}

      <div className={`w-2/3 flex flex-col ${showModal ? 'blur-sm' : ''}`}>
        <div className='flex justify-between'>
          <h3 className='text-3xl font-bold text-blue-700 mt-2'>New Invoice</h3>
          <div className='flex gap-4'>
            <a href="#" className='mt-4 mr-3 text-red-600 underline' onClick={() => window.history.back()}>Cancel</a>
            <button className='pt-1 pb-1 pr-4 pl-4 bg-blue-600 text-white mt-2 rounded'>Save</button>
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
                <select name="" id="" className='p-1 w-40 rounded border border-2'>
                  <option value="" >Select a Client</option>
                  {allClients.map((client, index) => (
                <option key={index} value={client}>{client}</option>
            ))}
                </select>
              </div>
              {!clientDetails && (
                <button
                  type="button"
                  className='text-blue-400 mt-5 text-base text-start hover:text-blue-600'
                  onClick={() => setShowModal(true)}
                >
                  + Create New Client
                </button>
              )}
            </div>
            <div className='flex flex-col w-1/4'>
              <div className='text-gray-700'>Date of issue</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" value={issueDate} onChange={(e)=> setToday(e.target.value)}/>
              <div className='text-gray-700 mt-4'>Due Date</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" value={dueDate} onChange={(e)=> setDueDate(e.target.value)} />
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-gray-700 mt-6'>Invoice number</div>
              <div className='mt-2 bg-zinc-200 p-2 rounded w-32 text-center text-gray-600'>{invoiceNumber}</div>
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-2xl font-bold mt-6'>Total Amount</div>
              <div className='mt-3 text-2xl text-green-700 font-semibold'>{grandTotal}</div>
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
              <input
        className="bg-zinc-200 p-2 rounded w-2/5"
        type="text"
        placeholder="Description"
        onChange={(e) => {
          const value = e.target.value;
          handleLineChange(index, "description", value);
        }}
        onBlur={(e) =>{
          fetchGST(e.target.value,index); // Fetch GST
        }
        }
      />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder="Rate" onChange={(e) => handleLineChange(index,"rate",e.target.value)} />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder="Qty" onChange={(e) => handleLineChange(index,"qty",e.target.value)} />
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
              <div className='font-semibold'>Subtotal:</div>
              <div>{itemPriceTotal}</div>
            </div>
            <div className='flex justify-between w-1/4 mt-2'>
              <div className='font-semibold'>Tax:</div>
              <div>{gstTotal}</div>
            </div>
            <hr className='w-1/4 my-2 border-gray-400' />
            <div className='flex justify-between w-1/4'>
              <div className='font-bold'>Total:</div>
              <div className='font-bold'>{grandTotal}</div>
            </div>
          </div>
          <div className='flex justify-end'>
            <button className='bg-blue-600 mt-5 w-40 p-3 font-bold text-white rounded hover:bg-blue-700 transition duration-300'>Send to Client</button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default GenerateInvoice;
