import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpForm from './components/Signup/index.js';
import LoginForm from './components/Login/index.js';
import Home from './components/Home/index.js';
import Token from './components/Tokens/index.js'
import Dashboard from './components/Dashboard/index.js'
import Aboutus from './components/AboutUs/index.js'
import SettingsPage from './components/Settings/index.js';
import ForgotPassword from './components/ForgotPassword/index.js'
import ResetPassword from './components/ResetPassword/index.js'
import Profile from './components/Profile/index.js'


function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/aboutus" element={<Aboutus />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/:username/:videoname" element={<Dashboard />} />
          <Route path="/token" element={<Token />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;