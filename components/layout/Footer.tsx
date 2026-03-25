import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="container h-[60px] mx-auto flex justify-center items-center">
      <p className="text-sm text-muted-foreground">
        &copy; {currentYear} <span className="font-bold text-foreground">SIGEAC</span> | All rights reserved.
      </p>
    </div>
  );
};

export default Footer;