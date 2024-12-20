"use client";

import { useEffect, useRef, MouseEvent, useState } from "react";
import ModalPortal from "./ModalPortal";
import useObserve from "../_hooks/useObserve";
import CloseSmallIcon from "@/public/svgs/CloseSmallIcon";

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
        className="fixed inset-0 z-50 flex items-center justify-center bg-huskey-background bg-opacity-70"
      >
        <div
          ref={modalRef}
          className={`transfrom flex scale-100 flex-col rounded border border-huskey-primary-400 bg-huskey-box text-white shadow-lg transition-all ${modalVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="px-5 py-4 text-base font-medium text-white">
              {title}
            </h3>
            <button onClick={onClose} className="absolute right-5 top-5">
              <CloseSmallIcon />
            </button>
          </div>
          <div className="px-5 pb-5">{children}</div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default Modal;
