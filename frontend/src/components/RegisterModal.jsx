import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import zxcvbn from 'zxcvbn'; //for password strength checking

const RegisterModal = ({ onClose }) => {
  const [accountType, setAccountType] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyWork, setCompanyWork] = useState('');
  const [revenue, setRevenue] = useState('');
  const [currentMethod, setCurrentMethod] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !city || !accountType) {
      toast.error("Please fill all required fields");
      return;
    }
    if (accountType === "Business") {
      try {
        const response = await fetch('http://localhost:5000/businessRegisteration', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullname: fullName,
            email,
            password,
            city,
            phone,
            companyName,
            companyWork,
            revenue,
            currentMethod
          }),
        });

        const data = await response.json();
        console.log(data); // Check if data is what you expect
        if (response.ok) {
          toast.success("Registration successful");
          onClose();
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          toast.error("Registration failed - " + data.message);
        }
      } catch (error) {
        toast.error("Error during registration");
      }
    }

    if (accountType === "Client") {
      try {
        const response = await fetch('http://localhost:5000/clientRegisteration', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            fullname: fullName,
            email,
            password,
            city
          }),
        });

        const data = await response.json();
        if (response.ok) {
          toast.success("Registration successful");
          setTimeout(() => {
            onClose(); // ✅ close after some delay
            window.location.reload(); // ✅ reload after toast shows
          }, 2000); // give user 2 seconds to see toast
        }
        else {
          toast.error("Registration failed - " + data.message);
        }
      } catch (error) {
        toast.error("Error during registration");
      }
    }
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300'>
      <div className='bg-white p-8 rounded-2xl w-full max-w-2xl relative shadow-lg animate-fadeIn max-h=[90vh] overflow-y-auto'>
        <button onClick={onClose} className='absolute top-4 right-4 text-gray-500 hover:text-red-400 text-3xl font-bold transition'>&times;</button>
        <h2 className='text-4xl font-extrabold text-start text-blue-700 mb-2'>Register</h2>
        <p className='text-sm mb-6 text-gray-500'>Fill in your details to create an account</p>
        <form className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='flex flex-col space-y-4'>
            <div>
              <label className='block text-gray-600 text-sm mb-1'>Full Name</label>
              <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='First LastName' value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <label className='block text-gray-600 text-sm mb-1'>Email</label>
              <input type="text" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='abc@gmail.com' value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className='block text-gray-600 text-sm mb-1'>Password</label>
              <input type="password" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='●●●●●●' value={password} onChange={(e) => {
                setPassword(e.target.value);
                const strength = zxcvbn(e.target.value);
                if (e.target.value.length < 6)
                  setPasswordStrength("Too Short");
                else if (strength.score === 0)
                  setPasswordStrength("Very Weak");
                else if (strength.score === 1)
                  setPasswordStrength("Weak");
                else if (strength.score === 2)
                  setPasswordStrength("Fairly Strong");
                else if (strength.score === 3)
                  setPasswordStrength("Strong");
                else if (strength.score === 4)
                  setPasswordStrength("Very Strong");
                else
                  setPasswordStrength("Strong");
              }} />
              <div className='h-5 mt-1 text-sm'>
              {password && (
                <p className={`text-sm mt-1 ${passwordStrength === 'Strong' || passwordStrength === 'Very Strong' ? 'text-green-600' :
                    passwordStrength === 'Good' ? 'text-lime-500' :
                      passwordStrength === 'Fair' ? 'text-yellow-500' :
                        'text-red-500'
                  }`}>
                  Password strength: {passwordStrength}
                </p>
              )}
              </div>
            </div>
            <div>
              <label className='block text-gray-600 text-sm mb-1'>Confirm password</label>
              <input type="password" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder='●●●●●●' value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />
              <div className='h-5 mt-1 text-sm'>
              {confirmPassword && confirmPassword !== password && (
                <p className='text-red-500 text-sm mt-1'>Passwords do not match</p>
              )} 
              </div>
            </div>
            <div>
              <label className='block text-gray-600 text-sm mb-1'>Account type</label>
              <select className='w-full p-1 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500' value={accountType} onChange={(e) => setAccountType(e.target.value)}>
                <option value="">Select</option>
                <option value="Business">Business</option>
                <option value="Client">Client</option>
              </select>
            </div>
          </div>
          <div className='flex flex-col space-y-4'>
            <div>
              <label className="block text-gray-600 text-sm mb-1">City</label>
              <input type="text" placeholder="City" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            {accountType === "Business" && (
              <>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Phone</label>
                  <input type="text" placeholder="1234567890" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Company Name</label>
                  <input type="text" placeholder="Company Inc." className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">What does your company do?</label>
                  <input type="text" placeholder="e.g., IT Services" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={companyWork} onChange={(e) => setCompanyWork(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Estimated Revenue</label>
                  <input type="text" placeholder="$100,000" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={revenue} onChange={(e) => setRevenue(e.target.value)} />
                </div>
                <div>
                  <label className="block text-gray-600 text-sm mb-1">Current Method</label>
                  <input type="text" placeholder="e.g., Manual invoicing" className="w-full p-2 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500" value={currentMethod} onChange={(e) => setCurrentMethod(e.target.value)} />
                </div>
              </>
            )}
          </div>
        </form>
        <div className='mt-6 text-right'>
          <button className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition font-semibold' onClick={handleSubmit}>Register</button>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
