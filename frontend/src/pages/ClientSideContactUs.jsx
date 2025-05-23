import React, { useState, useEffect } from 'react';
import ClientNavbar from '../components/ClientNavbar';
import Footer from '../components/Footer';
import { toast,ToastContainer } from 'react-toastify';

const ContactUs = () => {
  const [email, setEmail] = useState(null);
  const [optionalNameFeedback, setOptionalNameFeedback] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [optionalNameIssue, setOptionalNameIssue] = useState("");
  const [issueMessage, setIssueMessage] = useState("");
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [issueCategory, setIssueCategory] = useState("");
  const [issueSeverity, setIssueSeverity] = useState("");

  useEffect(() => {
      const fetchUserData = async () => {
        try {
          const res = await fetch("http://localhost:5000/clientDashboard", {
            method: "GET",
            credentials: "include",
          });
          const data = await res.json();
          if (res.ok && data.email) {
            setEmail(data.email);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetchUserData();
    }, []);

  const handleIssueSubmit = (e) => {
    e.preventDefault();
    setShowIssueModal(false);
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setShowFeedbackModal(false);
  };

  const submitFeedback = async(e) =>{
    //console.log("Sender Email is : ",email);
    try{
      const response = await fetch(`http://localhost:5000/sendFeedbackEmail`,{
        method:'POST',
        credentials:'include',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({
          senderEmail: email,
          senderName: optionalNameFeedback,
          category: feedbackCategory,
          message: feedbackMessage,
        }),
      });
      const data = await response.json();
      if(response.ok){
        toast.success("Feedback sent successfully!");
        setShowFeedbackModal(false);
        setFeedbackMessage("");
        setOptionalNameFeedback("");
      }
      else{
        toast.error("Failed to send feedback. Please try again.");
      }
    }
    catch(err){
      console.error("Error sending feedback: ",err);
    }
  };

  const submitIssue = async(e) =>{
    //console.log("Sender Email is : ",email);
    try{
      const response = await fetch(`http://localhost:5000/sendIssueEmail`,{
        method:'POST',
        credentials:'include',
        headers:{
          'Content-Type':'application/json',
        },
        body: JSON.stringify({
          senderEmail: email,
          senderName: optionalNameIssue,
          category: issueCategory,
          severity: issueSeverity,
          message: issueMessage,
        }),
      });
      //const data = await response.json();
      if(response.ok){
        toast.success("Issue sent successfully!");
        setShowIssueModal(false);
        setIssueMessage("");
        setOptionalNameIssue("");
      }
      else{
        toast.error("Failed to send Issue. Please try again.");
      }
    }
    catch(err){
      console.error("Error sending Issue: ",err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-tr from-indigo-400 via-teal-100 to-blue-300">
      <div className="flex flex-1">
        <ClientNavbar />
        <div className="w-4/5 p-10">
          <div className="bg-white/80 p-6 rounded-3xl shadow-xl mb-4">
            <h2 className="text-3xl text-blue-700 font-semibold font-serif">Contact Us</h2>
            <p className="mt-2 text-gray-600 text-lg">
              Have questions, feedback, or facing any issues? Fill out the form below and we’ll get back to you as soon as possible.
            </p>
          </div>
          <div className="flex flex-col mt-10 lg:flex-row gap-10">
            <div className="flex flex-col gap-6 w-full lg:w-1/2">
              <button
                className="group w-3/4 flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md"
                onClick={() => setShowFeedbackModal(true)}
              >
                Give a Feedback
              </button>
              <button
                className="group w-3/4 flex items-center justify-between gap-4 bg-white rounded-xl p-4 border text-lg border-blue-600 hover:bg-blue-600 hover:text-white transition duration-300 shadow-md"
                onClick={() => setShowIssueModal(true)}
              >
                Report an Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Send Feedback</h2>
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setShowFeedbackModal(false)}
            >
              &times;
            </button>
            <form onSubmit={handleFeedbackSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Your name (Optional)" className="p-2 border rounded-md" value={optionalNameFeedback} onChange={(e)=> setOptionalNameFeedback(e.target.value)} />
              <select className='p-2 border rounded-md' value={feedbackCategory} onChange={(e) => setFeedbackCategory(e.target.value)} required>
                <option value="">Select Feedback Category</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report </option>
                <option value="Praise">Praise </option>
                <option value="Other">Other </option>
              </select>
              <textarea placeholder="Your Feedback..." className="p-2 border rounded-md h-32" value={feedbackMessage} onChange={(e) => {setFeedbackMessage(e.target.value)}} required />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700" onClick={()=> submitFeedback()}>
                Submit Feedback
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6 relative">
            <h2 className="text-2xl font-bold text-blue-700 mb-4">Report an Issue</h2>
            <button
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl"
              onClick={() => setShowIssueModal(false)}
            >
              &times;
            </button>
            <form onSubmit={handleIssueSubmit} className="flex flex-col gap-4">
              <input type="text" placeholder="Subject" className="p-2 border rounded-md" value={optionalNameIssue} onChange={(e)=> setOptionalNameIssue(e.target.value)} required />
              <select className='p-2 border rounded-md' value={issueCategory} onChange={(e)=> setIssueCategory(e.target.value)} required>
                <option value="">Select Affected Feature</option>
                <option value="Login">Login</option>
                <option value="Dashboard">Dashboard</option>
                <option value="Invoices">Invoices</option>
                <option value="Other">Other</option>
              </select>
              <select className='p-2 border rounded-md' value={issueSeverity} onChange={(e) => setIssueSeverity(e.target.value)} required>
                <option value="">Select Severity</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              <textarea placeholder="Describe your issue..." className="p-2 border rounded-md h-32" value={issueMessage} onChange={(e)=> setIssueMessage(e.target.value)} required />
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={()=> submitIssue()}>
                Submit Issue
              </button>
            </form>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
      <Footer />
    </div>
  );
};

export default ContactUs;
