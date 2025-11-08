import "./App.css";
import Login from "./login/Login.jsx";
import Admindash from "./admindash/Admindash.jsx";
import Userdash from "./userdash/userdash.jsx";
import RegisterAdmin from "./newadmin/RegisterAdmin";
import { HashRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admindash/*" element={<Admindash />} />
        <Route path="/userdash/*" element={<Userdash />} />
        <Route path="/registeradmin" element={<RegisterAdmin />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
