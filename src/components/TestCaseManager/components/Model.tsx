import React, { useState } from "react";

// Define component props
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moduleName: string) => void;
}

export function Modal({ isOpen, onClose, onSubmit }: ModalProps) {
  const [moduleName, setModuleName] = useState<string>("");

  const handleSubmit = () => {
    if (moduleName) {
      onSubmit(moduleName);
      onClose();
    } else {
      alert("Module name is required!");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-1/3">
        <h3 className="text-lg font-semibold mb-4">Enter Module Name</h3>
        <input
          type="text"
          value={moduleName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setModuleName(e.target.value)
          }
          placeholder="Module Name"
          className="border p-2 rounded w-full mb-4"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-indigo-700 text-white px-4 py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
