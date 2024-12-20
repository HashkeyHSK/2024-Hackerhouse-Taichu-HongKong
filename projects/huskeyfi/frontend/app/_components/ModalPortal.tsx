import React, { ReactNode } from "react";
import ReactDOM from "react-dom";

interface ModalPortalProps {
  children: ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const el = document.getElementById("modal") as HTMLElement;

  return el ? ReactDOM.createPortal(children as any, el) : null;
};

export default ModalPortal;
