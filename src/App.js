import './App.css';
import './styles/home.css';
import './styles/navbar.css';
import './styles/tiles.css';
import './styles/layouts.css';

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContext } from './components/appContext';
import Navbar from './components/navbar/Navbar';
import NavbarView from './components/view-mode/NavbarView';
import Home from './pages/Home';

function App() {
  const { toggleViewMode, state } = useContext(AppContext);

  return (
    <Router>
      <div className="App">
        <button className="Editing" onClick={toggleViewMode}>
          {state.viewMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
        </button>
        {state.viewMode ? <Navbar /> : <NavbarView />}
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
