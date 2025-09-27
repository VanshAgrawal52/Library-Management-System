import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./navbar";

const HideRoutes = () => {
  const location = useLocation();
  const showNavbarRoutes = ["/"];
  const shouldShowNavbar = showNavbarRoutes.includes(location.pathname);

  return shouldShowNavbar ? <Navbar /> : null;
};

export default HideRoutes;