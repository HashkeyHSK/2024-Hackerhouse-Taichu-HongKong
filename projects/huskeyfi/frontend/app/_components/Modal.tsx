"use client";

import { useEffect, useRef, MouseEvent, useState } from "react";
import ModalPortal from "./ModalPortal";
import useObserve from "../_hooks/useObserve";

type ModalProps = {
  title: string;
  onClose: () => void;
  handleOutsideClickEnabled?: boolean;
  children: React.ReactNode;
};

const Modal = ({
  title,
  onClose,
  handleOutsideClickEnabled = true,
  children,
}: ModalProps) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const modalRef = useRef<HTMLDivElement>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useObserve({ ref: modalRef, setVisible: setModalVisible });

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
      <div
        onClick={handleOutsideClick}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      >
        <div
          ref={modalRef}
          className={`transfrom flex scale-100 flex-col rounded-2xl bg-black text-white shadow-lg transition-all ${modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          <h3 className="py-5 text-center text-lg font-semibold text-white">
            {title}
          </h3>
          <div className="px-6 pb-6">{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default Modal;
