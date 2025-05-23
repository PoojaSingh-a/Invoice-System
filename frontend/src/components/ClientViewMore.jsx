import React from 'react'
import {IoClose} from 'react-icons/io5';

const ClientViewMore = ({ invoice, itemList, onClose }) => {
  const calculateTotals = () => {
    let subTotal = 0;
    let gstTotal = 0;
    itemList.forEach(item => {
      const lineTotal = item.itemRate * item.itemQty;
      subTotal += lineTotal;
      gstTotal += lineTotal * (item.itemGST / 100);
    });
    const grandTotal = subTotal + gstTotal;
    return { subTotal, gstTotal, grandTotal };
  };

  if (!invoice) return null;

  const { subTotal, gstTotal, grandTotal } = calculateTotals(); 

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl p-8 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-600 text-2xl"
        >
          <IoClose />
        </button>
        <h3 className="text-2xl font-bold text-blue-700 mb-6">Invoice Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Biller Details</h5>
            <p>Name: <span className='text-gray-500'>{invoice.billedBy}</span></p>
            <p>Company: <span className='text-gray-500'>{invoice.billerCompany}</span></p>
            <p>Phone: <span className='text-gray-500'>{invoice.billerPhone}</span></p>
            <p>City: <span className='text-gray-500'>{invoice.billerCity}</span></p>
          </div>
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Client Details</h5>
            <p>Name: <span className='text-gray-500'> {invoice.clientName}</span></p>
            <p>Email: <span className='text-gray-500'> {invoice.clientEmail}</span></p>
          </div>
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Dates & Number</h5>
            <p>Issue Date: <span className='text-gray-500'> {new Date(invoice.issueDate).toLocaleDateString()} </span></p>
            <p className='text-red-600'>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <p>Invoice No: <span className='text-gray-500'> {invoice.invoiceNumber}</span></p>
          </div>
          <div>
            <h5 className="font-bold border-b pb-1 mb-2">Totals</h5>
            <p>Subtotal: <span className='text-gray-500'> ₹{subTotal.toFixed(2)} </span></p>
            <p>GST Total: <span className='text-gray-500'> ₹{gstTotal.toFixed(2)} </span></p>
            <p className='text-green-600'>Total Amount: <span className='font-bold'> ₹{grandTotal.toFixed(2)}</span></p>
          </div>
        </div> 

        <div className="mb-6">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-200">
                {['Description', 'Rate', 'Qty', 'Line Total', 'GST'].map(col => (
                  <th key={col} className="px-3 py-2">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {itemList.length > 0 ? (
                itemList.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-3 py-2">{item.itemDesc}</td>
                    <td className="px-3 py-2">₹{item.itemRate}</td>
                    <td className="px-3 py-2">{item.itemQty}</td>
                    <td className="px-3 py-2">₹{(item.itemRate * item.itemQty).toFixed(2)}</td>
                    <td className="px-3 py-2">₹{((item.itemRate * item.itemQty) * (item.itemGST / 100)).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">
                    No items available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClientViewMore;
