import React from "react";
import { Routes, Route } from "react-router-dom";
import "./Admindash.css";
import Adminnav from "./nav/adminnav";
import Adminmain from "./adminmain/adminmain";
import DataVisualization from "../components/DataVisualization";

export default function Admindash() {
  return (
    <div className="admin-dashboard">
      <div className="admin-navbar">
        <Adminnav />
      </div>
      <div className="admin-content">
        <Routes>
          <Route path="/" element={<Adminmain />} />
          <Route path="/dashboard" element={<DataVisualization />} />
        </Routes>
      </div>
    </div>
  );
}