// appContext.js
import React, { createContext, useState } from "react";

const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [widgets, setWidgets] = useState([]); // List of widgets

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

  const updateState = (newState) => {
    // Your other state values here
    // ...

    // Include the widgets in the state
    setWidgets(newState.widgets || []);
  };

  return (
    <AppContext.Provider
      value={{
        state: {
          // Your other state values here
          // ...

          // Include the widgets in the context state
          widgets,
        },
        updateState,
        addWidget,
        removeWidget,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export { AppContext, AppContextProvider };
