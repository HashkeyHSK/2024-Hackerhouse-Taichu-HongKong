// Import necessary dependencies
import React, { ReactNode } from "react";
import ReactDOM from "react-dom";

// Props type definition for ModalPortal
interface ModalPortalProps {
  children: ReactNode; // Child elements to render in portal
}

// Component that renders children into a portal element
const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  // Get the portal root element from DOM
  const el = document.getElementById("modal") as HTMLElement;

  // Render children into portal if element exists, otherwise return null
  return el ? ReactDOM.createPortal(children as any, el) : null;
};

export default ModalPortal;
