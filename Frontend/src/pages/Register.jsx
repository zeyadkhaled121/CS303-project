import React, { useEffect, useState } from "react";
import logo from "../assets/black-logo.png";
import logo_with_title from "../assets/logo-with-title.png";
import { useDispatch,useSelector} from "react-redux";
import{useNavigate} from  "react-router-dom";
import { Link, Navigate } from "react-router-dom";
import { toast } from "react-toastify";
import { register, resetAuthSlice } from "../store/slices/authSlice";
const Register = () => {
  const[name, setName] = useState('');
  const[email,setEmail] = useState('');
  const[password,setPassword] = useState('');

  const dispatch = useDispatch();    
  const { loading, error, message, user, isAuthenticated } = useSelector(
    state => state.auth
  ); 
    const navigateTo = useNavigate();
const handleRegister = (e) => {
e.preventDefault();
const data = new FormData();
data.append("name", name);
data.append("email", email);
data.append("password", password);
dispatch(register(data));
};
useEffect (()=> {
  if (message) {

    navigateTo(`/otp-verification/${email}`);    }  
    if (error) {  
    }    
    toast.error(error);
    dispatch(resetAuthSlice());
    }, [dispatch, isAuthenticated, error, loading])
    
    if(isAuthenticated) {
    return <Navigate to ={"/"}/> 
    }
  return ( <>
<div className="min-h-screen flex overflow-hidden">

{/* Left Side */}
<div className="
  w-1/2 
  
  bg-black 
  text-white 
  flex flex-col 
  justify-center 
  items-center 
  p-6 md:p-10
  rounded-r-[80px] md:rounded-r-[200px]
">
  <img src={logo_with_title} alt="logo" className="w-28 md:w-56 mb-6" />

  <p className="mb-4 text-center text-sm md:text-base text-gray-300">
    Already have Account? Sign in now.
  </p>

  <Link
    to="/login"
    className="border border-white px-4 md:px-8 py-2 rounded-md text-sm md:text-base hover:bg-white hover:text-black transition"
  >
    SIGN IN
  </Link>
</div>

{/* Right Side */}
<div className="
  w-1/2 
   
  flex 
  justify-center 
  items-center 
  p-6 md:p-10
">
  <div className="w-full max-w-xs md:max-w-sm">
    <h2 className="text-xl md:text-3xl font-semibold mb-2 text-gray-800">
      Sign Up
    </h2>

    <p className="text-gray-500 mb-6 text-xs md:text-sm">
      Please provide your information to sign up.
    </p>

    <div className="space-y-3 md:space-y-4">
      <input
        type="text"
        placeholder="Full Name"
        className="w-full border border-gray-400 px-3 md:px-4 py-2 rounded-md text-sm focus:outline-none"
      />

      <input
        type="email"
        placeholder="Email"
        className="w-full border border-gray-400 px-3 md:px-4 py-2 rounded-md text-sm focus:outline-none"
      />

      <input
        type="password"
        placeholder="Password"
        className="w-full border border-gray-400 px-3 md:px-4 py-2 rounded-md text-sm focus:outline-none"
      />
    </div>
    <button type="submit"
  className="w-full mt-4 bg-black text-white py-2 rounded-md text-sm md:text-base hover:opacity-90 transition"
>
  SIGN UP
</button>
  </div>
</div>

</div>
  </>);
};

export default Register;
