import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import Footer from "../components/Footer.jsx";
import LoginModal from "../components/LoginModal.jsx";
import RegisterModal from "../components/RegisterModal.jsx";
// Import images dynamically
const images = Object.values(import.meta.glob("../assets/*.png", { eager: true })).map((img) => img.default);

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const handleLoginClick = () => {
    setShowLoginModal(true);
  }
  const handleRegisterClick = () => {
    setShowRegisterModal(true);
  }
  const handleCloseLoginModal = () => {
    setShowLoginModal(false);
  }
  const handleCloseRegisterModal = () => {
    setShowRegisterModal(false);
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-r from-blue-100 to-blue-300">
      {/* Content Section */}
      <div className="flex flex-grow">
        {/* Left Section */}
        <div className="flex flex-col justify-center w-2/3 px-16">
          <h1 className="text-5xl font-extrabold text-blue-700 mb-6">Invoicer</h1>
          <p className="bg-white shadow-2xl p-6 rounded-lg text-gray-700 text-lg leading-relaxed">
            Invoicer is a modern cloud-based invoicing system designed to simplify
            financial transactions for businesses of all sizes. Our platform allows
            users to generate, send, and manage invoices effortlessly while keeping
            records securely stored in the cloud.
            <br />
            <br />
            With intuitive features like automated invoice reminders, real-time tracking,
            and seamless multi-user access, Invoicer ensures that you stay on top of your
            finances without the hassle.
          </p>
          {/* Buttons */}
          <div className="flex mt-8 space-x-6">
            <button className="bg-blue-700 hover:bg-blue-900 text-white px-6 py-3 rounded-lg shadow-md text-lg transition duration-300" onClick={handleRegisterClick}>
              Get Started
            </button>
            <button
              className="bg-gray-700 hover:bg-gray-900 text-white px-6 py-3 rounded-lg shadow-md text-lg transition duration-300"
              onClick={handleLoginClick}
            >
              Login
            </button>
          </div>
        </div>

        {/* Right Section with Swiper Carousel */}
        <div className="w-1/3 flex items-center justify-center p-10">
          <Swiper
            modules={[Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            autoplay={{ delay: 2000, disableOnInteraction: false }}
            loop
            className="w-full max-w-lg"
          >
            {images.map((imgSrc, index) => (
              <SwiperSlide key={index}>
                <img src={imgSrc} alt={`Slide ${index + 1}`} className="w-full h-96 rounded-lg shadow-md" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Footer Component */}
      <Footer />
      {showLoginModal && (
        <div className="fixed inset-0 z-50">
          <LoginModal onClose={handleCloseLoginModal} />
        </div>
      )}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50">
          <RegisterModal onClose={handleCloseRegisterModal} />
        </div>
      )}
    </div>
  );
};

export default Index;
