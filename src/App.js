import './App.css';
import './styles/home.css';
import './styles/navbar.css';
import './styles/tiles.css';

import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppContext } from './components/appContext';
import Navbar from './components/navbar/Navbar';
import Home from './pages/Home';

import NavbarView from './components/view-mode/NavbarView'

function App() {
  const { toggleViewMode, state, addWidget, removeWidget } = useContext(AppContext);

  const handleAddWidget = () => {
    const newWidget = {/* your widget data here */};
    addWidget(newWidget);
  };

  const handleRemoveWidget = (index) => {
    removeWidget(index);
  };

  return (
    <div className="App">
      <button className='Editing' onClick={toggleViewMode}>
        {state.viewMode ? 'Switch to View Mode' : 'Switch to Edit Mode'}
      </button>
      {state.viewMode ? (
        /* Render edit mode content or form */
        <Router>
         <Navbar />
          <Routes>
            <Route path='/' element={<Home />} />
          </Routes>
        </Router>
      ) : (
        /* Render view mode content */
        <div>
          {/* View mode display content */}
          <Router>
            <NavbarView />
            <Routes>
              <Route path='/' element={<Home />} />
            </Routes>
          </Router>
        </div>
      )}
    </div>
  );
}

export default App;
