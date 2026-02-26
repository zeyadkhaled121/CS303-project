import React, { useEffect, useState } from "react";
import logo from "../assets/black-logo.png";
import whiteLogo from "../assets/white-logo.png";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { forgotPassword, resetAuthSlice } from "../store/slices/authSlice";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const { loading, error, message, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  const handleForgotPassword = (e) => {
    e.preventDefault();
    dispatch(forgotPassword(email));
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
      // OTP was sent — navigate to reset page, passing email via state
      navigateTo("/password/reset", { state: { email } });
    }
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
  }, [dispatch, message, error, navigateTo, email]);

  if (isAuthenticated) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <div className="flex flex-col justify-center md:flex-row h-screen">
        {/* Left — Form */}
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
            <h1 className="text-4xl font-medium text-center mb-4 overflow-hidden">
              Forgot Password
            </h1>
            <p className="text-gray-800 text-center mb-12">
              Enter your email and we&apos;ll send you an OTP to reset your
              password.
            </p>
            <form onSubmit={handleForgotPassword}>
              <div className="mb-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  className="w-full px-4 py-3 border border-black rounded-md focus:outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-black text-white py-2 rounded-md text-sm md:text-base hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Reset OTP"}
              </button>
            </form>
          </div>
        </div>

        {/* Right — Branding */}
        <div className="hidden w-full md:w-1/2 bg-black text-white md:flex flex-col items-center justify-center p-8 rounded-tl-[80px] rounded-bl-[80px]">
          <div className="text-center h-[400px]">
            <div className="flex justify-center mb-12">
              <div className="flex flex-col items-center mb-12">
                <img src={whiteLogo} alt="logo" className="h-28 w-auto mb-2" />
                <span className="text-3xl font-bold tracking-wide">Sci</span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Library</span>
              </div>
            </div>
            <p className="text-gray-300 mb-12">
              Remember your password? Sign in now.
            </p>
            <Link
              to={"/login"}
              className="border-2 mt-5 border-white px-8 w-full font-semibold bg-black text-white py-2 rounded-lg hover:bg-white hover:text-black transition"
            >
              SIGN IN
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
