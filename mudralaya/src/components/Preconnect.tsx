"use client";

import { useEffect } from "react";
import ReactDOM from "react-dom";

export function Preconnect() {
  useEffect(() => {
    ReactDOM.preconnect("https://checkout.razorpay.com");
    ReactDOM.preconnect("https://fonts.gstatic.com"); // Ensure fonts are preconnected if any linger
  }, []);

  return null;
}
