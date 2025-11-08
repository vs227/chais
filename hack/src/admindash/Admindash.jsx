import React from "react";
import { Routes, Route } from "react-router-dom";
import "./Admindash.css";
import Adminnav from "./nav/adminnav";
import Adminmain from "./adminmain/adminmain";
import DataVisualization from "../components/DataVisualization";
import ReviewHistoryPage from "./adminmain/ReviewHistoryPage";

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
          <Route path="/review-history" element={<ReviewHistoryPage />} />
        </Routes>
      </div>
    </div>
  );
}