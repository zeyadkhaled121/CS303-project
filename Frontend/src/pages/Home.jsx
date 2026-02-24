import React,{useState} from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import {useSelector} from "react-redux"; 

const Home = () => {
  const [isSideBarOpen,SetIsSideBarOpen] = useState(false);
  const [selectedComponent,setSelectedComponent] = useState(false);

  const {} = useSelector();
  
  
  return <></>;
};

export default Home;
