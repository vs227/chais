import React from "react";
import "./userdash.css";
import Usernav from "../userdash/nav/usernav";
import Usermain from "../userdash/usermain/usermain";


export default function Userdash() {
  return (
    <div>
        <Usernav />
        <Usermain />
    </div>
  );
}