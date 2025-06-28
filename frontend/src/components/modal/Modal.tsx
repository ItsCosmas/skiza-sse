import { useRef } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceIP: string;
  responseBody: string;
}

const Modal = ({ isOpen, onClose, sourceIP, responseBody }: ModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  return (
    <dialog
      ref={modalRef}
      className="modal"
      open={isOpen}
      onClick={() => onClose()} // Close modal when clicking outside the content
    >
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-bold text-lg">{sourceIP}</h3>
        <p className="py-4">{responseBody}</p>
        <div className="modal-action">
          <button className="btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
};

export default Modal;
