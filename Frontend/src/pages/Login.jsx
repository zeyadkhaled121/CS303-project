import { useEffect, useState } from "react";
import whiteLogo from "../assets/white-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { login, resetAuthSlice } from "../store/slices/authSlice";


const Login = () => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch(); 
  const { loading, error, message, isAuthenticated } = useSelector((state) => state.auth);
  const navigateTo = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Send plain object — backend expects JSON, not FormData
    dispatch(login({ email, password }));
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigateTo('/');
    }
    if (error) {
      toast.error(error);
      dispatch(resetAuthSlice());
    }
    if (message) {
      toast.success(message);
      dispatch(resetAuthSlice());
    }
  }, [isAuthenticated, error, message, navigateTo, dispatch]);
  return (<>
  <div className="min-h-screen flex overflow-hidden">
  
  
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
    <div className="flex flex-col items-center mb-6">
      <img src={whiteLogo} alt="logo" className="w-20 md:w-28 mb-2" />
      <span className="text-2xl md:text-3xl font-bold tracking-wide">Sci</span>
      <span className="text-[10px] tracking-[0.3em] uppercase text-gray-400">Library</span>
    </div>
  
    <p className="mb-4 text-center text-sm md:text-base text-gray-300">
      create new account , sign up now 
    </p>
  
    <Link
      to="/Register"
      className="border border-white px-4 md:px-8 py-2 rounded-md text-sm md:text-base hover:bg-white hover:text-black transition"
    >
      SIGN UP
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
        Sign in
      </h2>
  
      <p className="text-gray-500 mb-6 text-xs md:text-sm">
        Please provide your information to sign in.
      </p>
  
   
      <form onSubmit={handleLogin} className="space-y-3 md:space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-400 px-3 md:px-4 py-2 rounded-md text-sm focus:outline-none"
          required
        />
  
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-400 px-3 md:px-4 py-2 rounded-md text-sm focus:outline-none"
          required
        />

        <div className="text-right">
          <Link
            to="/password/forgot"
            className="text-xs md:text-sm text-gray-500 hover:text-black transition"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          className="w-full mt-4 bg-black text-white py-2 rounded-md text-sm md:text-base hover:opacity-90 transition"
        >
          SIGN IN
        </button>
      </form>
    </div>
  </div>
  </div>
  

  
  </>);
};

export default Login;
