import './App.css';
import './styles/home.css'
import './styles/navbar.css'

import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'

import Navbar from './components/navbar/Navbar';
import Home from './pages/Home';

function App() {
  return (
    <div className="App">
			<Router>
	  <Navbar />
				<Routes>
					<Route path='/' element={<Home />} />
				</Routes>
			</Router>
    </div>
  );
}

export default App;
