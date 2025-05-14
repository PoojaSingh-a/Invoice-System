import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify'; // ✅ Fixed: added ToastContainer
import { useLocation, useNavigate } from 'react-router-dom';
import RegisterModal from "../components/RegisterModal.jsx";
import 'react-toastify/dist/ReactToastify.css'; // ✅ Optional but recommended if not already included globally

const LoginModal = ({ onClose }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const location = useLocation();
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [userType, setUserType] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (location.state?.message) {
            toast.error(location.state.message, { autoClose: 1000 });
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if(userType === "business"){
            try{
                const response = await fetch("http://localhost:5000/businessLogin",{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    credentials:"include",
                    body: JSON.stringify({email, password}),
                });
                const data = await response.json();
                if(response.ok){
                    toast.success(data.msg);
                    setTimeout(() => {
                        navigate("/bussinessDashboard");
                    },1000);
                }
                else{
                    toast.error(data.err);
                }
            }
            catch(err){
                console.log("Login failed", err);
                toast.error("Login failed", {autoclose: 3000});
            }
        }
        if(userType === "client"){
            try{
                const response = await fetch("http://localhost:5000/clientLogin",{
                    method:"POST",
                    headers:{
                        "Content-Type":"application/json",
                    },
                    credentials:"include",
                    body: JSON.stringify({email, password}),
                });
                const data = await response.json();
                if(response.ok){
                    toast.success(data.msg);
                    setTimeout(() => {
                        navigate("/ClientDashboard");
                    },1000);
                }
                else{
                    toast.error(data.err);
                }
            }
            catch(err){
                console.log("Login failed", err);
                toast.error("Login failed", {autoclose: 3000});
            }
        }
    };

    const handleRegisterClick = () => {
        setShowRegisterModal(true);
    };

    if (showRegisterModal) {
        return <RegisterModal onClose={() => setShowRegisterModal(false)} />;
    }

    return (
        <div className='fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300'>
            <div className='bg-white p-8 rounded-2xl w-full max-w-sm relative animate-fadeIn'>
                <button onClick={onClose} className='absolute top-4 right-4 text-gray-500 hover:text-blue-600 text-2xl font-bold'>
                    &times;
                </button>
                <h2 className='text-3xl font-bold text-center text-blue-700 mb-6'>Welcome Back</h2>
                <form onSubmit={handleSubmit} className='space-y-4'>
                    <div className='relative'>
                        <FaEnvelope className='absolute left-3 top-3 text-gray-400' />
                        <input
                            type="email"
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
                            placeholder='Email'
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className='relative'>
                        <FaLock className='absolute left-3 top-3 text-gray-400' />
                        <input
                            type="password"
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
                            placeholder='Password'
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className='relative'>
                        <FaUser className='absolute left-3 top-3 text-gray-400' />
                        <select
                            className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400'
                            required
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <option value="" className="text-gray-500">Select user type</option>
                            <option value="business">Business</option>
                            <option value="client">Client</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-semibold transition-colors duration-300'
                    >
                        Login
                    </button>
                </form>
                <p className='text-sm text-center text-gray-500 mt-4'>
                    Don't have an account?{" "}
                    <span
                        className='text-blue-600 hover:underline cursor-pointer'
                        onClick={handleRegisterClick}
                    >
                        Register
                    </span>
                </p>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </div>
    );
};

export default LoginModal;