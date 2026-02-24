import React, { useState } from "react";
import logo from "../assets/black-logo.png";
import logo_with_title from "../assets/logo-with-title.png";
import { useDispatch,useSelector} from "react-redux";
import{useNavigate} from  "react-router-dom"
const Register = () => {
  const[name, setName] = useState('');
  const[email,setEmail] = useState('');
  const[password,setPassword] = useState('');

    const dispatch= useDispatch
    
  const{loading,error, massage, user, isAuthenticated} = useSelector(
    state => state.auth); 
    const navigateTo = useNavigate();
  return <></>;
};

export default Register;
