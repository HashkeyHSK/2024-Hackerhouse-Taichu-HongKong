"use client";

import CloseSmallIcon from "@/public/svgs/CloseSmallIcon";
import { useEffect, useRef, MouseEvent, useState } from "react";
import ModalPortal from "./ModalPortal";
import useObserve from "../_hooks/useObserve";

// Props type definition for Modal component
type ModalProps = {
  title: string; // Modal title text
  onClose: () => void; // Function to close modal
  handleOutsideClickEnabled?: boolean; // Flag to enable/disable closing on outside click
  children: React.ReactNode; // Modal content
};

// Modal component that displays content in a popup window
const Modal = ({
  title,
  onClose,
  handleOutsideClickEnabled = true,
  children,
}: ModalProps) => {
  // Disable page scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Refs and state for modal visibility and animations
  const modalRef = useRef<HTMLDivElement>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Custom hook to observe modal visibility
  useObserve({ ref: modalRef, setVisible: setModalVisible });

  // Handler for clicks outside the modal
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      handleOutsideClickEnabled &&
      modalRef.current &&
      !modalRef.current.contains(e.target as Node)
    ) {
      onClose();
    }
  };

  return (
    <ModalPortal>
      {/* Modal overlay with background dimming */}
      <div
        onClick={handleOutsideClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-huskey-background bg-opacity-70"
      >
        {/* Modal container with animation */}
        <div
          ref={modalRef}
          className={`transfrom flex scale-100 flex-col rounded border border-huskey-primary-400 bg-huskey-box text-white shadow-lg transition-all ${modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          {/* Modal header with title and close button */}
          <div className="flex items-center justify-between">
            <h3 className="px-5 py-4 text-base font-medium text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="absolute right-5 top-5"
              type="button"
            >
              <CloseSmallIcon />
            </button>
          </div>
          {/* Modal content */}
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default Modal;
