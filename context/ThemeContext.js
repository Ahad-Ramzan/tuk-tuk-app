// context/ThemeContext.js
import React, { createContext, useContext, useState } from "react";
import { companies } from "../constants/companies";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [companyKey, setCompanyKey] = useState("alpha"); // default

  const value = {
    company: companies[companyKey],
    selectCompany: setCompanyKey,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
