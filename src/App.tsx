// import React from 'react';
import { ThemeProvider } from "@/components/ThemeProvider"
import Router  from "./Router"
function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  )
}

export default App