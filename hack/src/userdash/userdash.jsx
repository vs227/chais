import React from "react";
import "./userdash.css";
import Usernav from "../userdash/nav/usernav";
import Usermain from "../userdash/usermain/usermain";
import { Routes, Route } from "react-router-dom";
import UserHistory from "./usermain/UserHistory";


export default function Userdash() {
  return (
    <div>
      <Usernav />
      <Routes>
        <Route path="/" element={<Usermain />} />
        <Route path="/history" element={<UserHistory />} />
      </Routes>
    </div>
  );
}