import React, { useState } from 'react';
import Footer from '../components/Footer';

const GenerateInvoice = () => {
  const [lines, setLines] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);

  const addLine = () => {
    setLines([...lines, { description: '', rate: '', qty: '' }]);
  };

  const handleClientSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const phone = e.target.phone.value;
    const address = e.target.address.value;

    setClientDetails({ name, phone, address });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gradient-to-l from-blue-100 to-blue-300 relative">
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg relative w-96">
            <h3 className="text-xl font-bold mb-4">Create New Client</h3>
            <form onSubmit={handleClientSubmit} className="flex flex-col gap-3">
              <input className="border p-2 rounded" name="name" placeholder="Client Name" required />
              <input className="border p-2 rounded" name="phone" placeholder="Phone Number" required />
              <input className="border p-2 rounded" name="address" placeholder="Address" required />
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
            <a href="#" className='mt-4 mr-3 text-red-600 underline'>Cancel</a>
            <button className='pt-1 pb-1 pr-4 pl-4 bg-blue-600 text-white mt-2 rounded'>Save</button>
          </div>
        </div>
        <form action="" className='mt-4 mb-7 bg-white p-6 rounded shadow-lg'>
          <div className='flex flex-col bg-zinc-100 p-3 rounded'>
            <p className='mt-2'><strong>Name:</strong> {clientDetails?.name || 'Fetching from DB...'}</p>
            <p className='mt-2'><strong>Phone:</strong> {clientDetails?.phone || 'Fetching from DB...'}</p>
            <p className='mt-2'><strong>Address:</strong> {clientDetails?.address || 'Fetching from DB...'}</p>
          </div>

          <div className='flex gap-20 mt-6'>
            <div className='flex flex-col w-1/4'>
              <div className='font-bold'>Billed to</div>
              {!clientDetails && (
                <button
                  type="button"
                  className='text-blue-400 mt-5 underline hover:text-blue-600'
                  onClick={() => setShowModal(true)}
                >
                  + Create a Client
                </button>
              )}
            </div>
            <div className='flex flex-col w-1/4'>
              <div className='text-gray-700'>Date of issue</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" />
              <div className='text-gray-700 mt-4'>Due Date</div>
              <input className='bg-zinc-200 p-2 rounded mt-2' type="date" />
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-gray-700 mt-6'>Invoice number</div>
              <div className='mt-2 bg-zinc-200 p-2 rounded w-32 text-center'>INV101</div>
            </div>
            <div className='flex flex-col w-1/4 items-center'>
              <div className='text-2xl font-bold mt-6'>Total Amount</div>
              <div className='mt-3 text-2xl text-green-700 font-semibold'>Rs.12,034</div>
            </div>
          </div>

          <hr className='mt-5 border-gray-400' />
          <div className='flex text-zinc-600 mt-2 mb-4 font-semibold'>
            <div className='w-1/2'>Description</div>
            <div className='w-1/6'>Rate</div>
            <div className='w-1/6'>Qty</div>
            <div className='w-1/6'>Line Total</div>
          </div>

          {lines.map((line, index) => (
            <div key={index} className='flex text-zinc-500 mt-2'>
              <input className='bg-zinc-200 p-2 rounded w-1/2' type="text" placeholder="Description" />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder="Rate" />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="number" placeholder="Qty" />
              <input className='bg-zinc-200 p-2 rounded w-1/6 ml-4' type="text" placeholder="Line Total" readOnly />
            </div>
          ))}

          <div className='mt-3 w-full border-dashed border-2 border-blue-500 rounded p-3 text-center cursor-pointer hover:bg-blue-100' onClick={addLine}>
            + Add a Line
          </div>

          <div className='flex flex-col items-end mt-6'>
            <div className='flex justify-between w-1/4'>
              <div className='font-semibold'>Subtotal:</div>
              <div>100</div>
            </div>
            <div className='flex justify-between w-1/4 mt-2'>
              <div className='font-semibold'>Tax:</div>
              <div>100</div>
            </div>
            <hr className='w-1/4 my-2 border-gray-400' />
            <div className='flex justify-between w-1/4'>
              <div className='font-bold'>Total:</div>
              <div className='font-bold'>12,034</div>
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
