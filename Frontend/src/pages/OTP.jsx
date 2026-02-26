import React, { useEffect, useState } from "react";
import logo from "../assets/black-logo.png";
import whiteLogo from "../assets/white-logo.png";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { otpVerification, resetAuthSlice } from "../store/slices/authSlice";

const OTP = () => {
  const { email } = useParams();
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const handleOtpVerification = (e) => {
    e.preventDefault();
    dispatch(otpVerification(email, otp));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
      // After verification, redirect to login (backend doesn't auto-authenticate)
      navigateTo("/login");
    }
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, message, error, navigateTo]);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* Left */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-8 relative">
          <Link
            to={"/login"}
            className="border-2 border-black rounded-3xl font-bold w-52 py-2 px-4 fixed top-10 -left-28 hover:bg-black hover:text-white transition duration-300 text-end"
          >
            Back
          </Link>
          <div className="max-w-sm w-full">
            <div className="flex justify-center mb-12">
              <div className="rounded-full flex items-center justify-center">
                <img src={logo} alt="logo" className="h-24 w-auto" />
              </div>
            </div>
            <h1 className="text-4xl font-medium text-center mb-12 overflow-hidden">
              Check your Mailbox
            </h1>
            <p className="text-gray-800 text-center mb-12">
              Please enter the OTP to proceed
            </p>
            <form onSubmit={handleOtpVerification}>
              <div className="mb-4">
                <input
                  type="number"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="OTP"
                  className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-black text-white py-2 rounded-md text-sm md:text-base hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>
          </div>
        </div>
        {/* Right */}
        <div className="hidden w-full md:w-1/2 bg-black text-white md:flex flex-col items-center justify-center p-8 rounded-tl-[80px] rounded-bl-[80px]">
          <div className="text-center h-[400px]">
            <div className="flex justify-center mb-12">
              <div className="flex flex-col items-center mb-12">
                <img src={whiteLogo} alt="logo" className="h-28 w-auto mb-2" />
                <span className="text-3xl font-bold tracking-wide">Sci</span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Library</span>
              </div>
            </div>
            <p className="text-gray-300 mb-12">New to our platform? Sign up now.</p>
            <Link
              to={"/register"}
              className="border-2 mt-5 border-white px-8 w-full font-semibold bg-black text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
            >
              SIGN UP
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default OTP;
