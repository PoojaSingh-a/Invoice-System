import React from 'react'
import Footer from '../components/Footer';
import ClientNavbar from '../components/ClientNavbar';
import { FaPlusCircle, FaSearch, FaFileInvoice,FaEdit } from 'react-icons/fa';

const ClientSideAllInvoices = () => {
 return (
    <div className="h-screen overflow-auto flex flex-col bg-gradient-to-l from-blue-100 to-blue-300">
      <div className="flex flex-1">
        <ClientNavbar />
        <div className="right w-4/5 h-auto flex flex-col p-6">
          <h2 className="text-black font-bold text-3xl mt-5 ml-5">
            Welcome, Client
          </h2>
          <div className='flex justify-self-end'>
            <button className="glow-button mt-14 w-80 bg-white hover:bg-blue-600 hover:text-white hover:shadow-glow transition duration-300 text-black p-3 text-lg rounded-lg ml-5 flex items-center gap-5 px-6 py-3">
              <FaPlusCircle size={22} />
              Create a New Invoice
            </button>
            <div>
              <div className='relative mt-14 ml-5 w-80'>
                <FaSearch className="absolute left-3 top-4 text-gray-400" />
                <input type="text" placeholder="Search by Invoice Number " className="pl-10 pr-3 py-3 w-full bg-white text-md rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div className="mt-10 bg-white p-6 w-5/5 ml-5 rounded-lg shadow-md hover:shadow-2xl transition flex flex-col">
            <div className="text-xl font-semibold mb-4 flex gap-3 items-center">
              <FaFileInvoice size={24} className="text-blue-500" />
              <h3> All Invoices Recieved</h3>
            </div>
            <div className='max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 rounded-lg'>
                  <div  className='bg-blue-100 mt-4 mb-5 rounded-lg p-4 w-full shadow-sm hover:shadow-lg hover:bg-gray-200 transition'>
                    <div className='flex justify-between'>
                      <p className='text-lg text-gray-700'>
                        <span className='font-semibold'>Invoice Number </span>
                        <strong>INVCO12</strong>
                      </p>
                    </div>
                    <p className='mr-6 text-lg mt-4 text-gray-700'>
                      <span className="font-semibold">Client Name </span>
                      <strong>XYZ</strong>
                    </p>
                    <div className='flex justify-between'>
                      <button
                        className='mt-6 text-lg text-blue-600 cursor-pointer hover:text-green-600 transition'
                      >
                        Read more →
                      </button>
                      <div className='flex gap-1 items-center hover:text-blue-700 '>
                        <FaEdit size={20} className="mt-6 text-green-600 cursor-pointer transition" />
                        <button
                          className='mt-6 text-lg text-green-600 hover:text-blue-700 cursor-pointer transition'
                        >
                          Edit
                        </button>

                      </div>
                    </div>
                  </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default ClientSideAllInvoices
