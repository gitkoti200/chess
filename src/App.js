import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ManualGame from './components/ManualGame';
import AutoGame from './components/AutoGame';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <h1>Chess Game</h1>
        <Routes>
          <Route path="/" element={
            <div className="menu">
              <h2>Select Game Mode</h2>
              <div className="menu-options">
                <Link to="/manual" className="menu-button">Play with Friend</Link>
                <Link to="/auto" className="menu-button">Play with AI</Link>
              </div>
            </div>
          } />
          <Route path="/manual" element={<ManualGame />} />
          <Route path="/auto" element={<AutoGame />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;