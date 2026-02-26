import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container h-[60px] mx-auto flex justify-center items-center text-black">
      <p>
        &copy; {currentYear} <span className="font-bold">SIGEAC</span> | All rights reserved.
      </p>
    </div>
  );
};

export default Footer;