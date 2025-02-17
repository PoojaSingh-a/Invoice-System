import React from "react";

const Footer = () => {
  return (
    <footer className="bg-blue-700 text-white text-sm text-center p-1 w-full">
      &copy; {new Date().getFullYear()} Invoicer. All rights reserved.
    </footer>
  );
};

export default Footer;
