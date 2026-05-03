import React, { useContext } from 'react';
import { AppContext } from '../../appContext';

const Searchbar = () => {
  const { state, setSearchQuery } = useContext(AppContext);
  return (
    <input
      className="navbar-search-input"
      type="text"
      placeholder="Search..."
      value={state.searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
  );
};

export default Searchbar;
