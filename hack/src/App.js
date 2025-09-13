import "./App.css";
import Login from "./login/Login.jsx";
import Admindash from "./admindash/Admindash.jsx";
import { HashRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admindash" element={<Admindash />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
