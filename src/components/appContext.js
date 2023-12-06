import React, { createContext, useState } from "react";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets] = useState([]); // List of widgets
  const [viewMode, setViewMode] = useState(true); // true for viewing, false for editing

  const addWidget = (widget) => {
    setWidgets((prevWidgets) => [...prevWidgets, widget]);
  };

  const removeWidget = (index) => {
    setWidgets((prevWidgets) => {
      const updatedWidgets = [...prevWidgets];
      updatedWidgets.splice(index, 1);
      return updatedWidgets;
    });
  };

  const toggleViewMode = () => {
    setViewMode((prevMode) => !prevMode);
  };

  const updateState = (newState) => {
    setWidgets(newState.widgets || []);
    // You can add more logic to update other state values here
  };

  return (
    <AppContext.Provider
      value={{
        state: {
          widgets,
          viewMode,
        },
        updateState,
        addWidget,
        removeWidget,
        toggleViewMode,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
