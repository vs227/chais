import "./App.css";
import Login from "./login/Login.jsx";
import Admindash from "./admindash/Admindash.jsx";
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admindash" element={<Admindash />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
