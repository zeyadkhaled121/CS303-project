import React from "react";
import placeHolder from "../assets/placeholder.jpg";
import closeIcon from "../assets/close-square.png";
import keyIcon from "../assets/key.png";
import { useDispatch } from "react-redux";
import { toggleAddNewAdminPopup } from "../store/slices/popUpSlice";

const AddNewAdmin = () => {
  const dispatch = useDispatch();
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <img
          src={closeIcon}
          alt="close"
          className="absolute top-4 right-4 w-6 h-6 cursor-pointer"
          onClick={() => dispatch(toggleAddNewAdminPopup())}
        />
        <div className="flex items-center gap-3 mb-6">
          <img src={keyIcon} alt="key" className="w-8 h-8" />
          <h2 className="text-xl font-bold text-gray-800">Add New Admin</h2>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          This feature is coming soon.
        </p>
      </div>
    </div>
  );
};

export default AddNewAdmin;
