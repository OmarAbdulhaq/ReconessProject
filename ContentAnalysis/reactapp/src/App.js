import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import SignUpForm from './components/SignUpForm.js';
import LoginForm from './components/LoginForm.js';
import Home from './components/HomePage.js';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/signup" element={<SignUpForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/">
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;