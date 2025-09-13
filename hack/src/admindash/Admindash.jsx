import React from "react";
import "./Admindash.css";
import Adminnav from "../admindash/nav/adminnav";
import Adminmain from "../admindash/adminmain/adminmain";


export default function Admindash() {
  return (
    <div>
        <Adminnav />
        <Adminmain />
    </div>
  );
}