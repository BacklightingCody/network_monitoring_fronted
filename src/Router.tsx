import { BrowserRouter, Routes, Route } from "react-router-dom"
import { RootLayout } from "./layouts/RootLayout"
import { SystemLogs } from "./pages/SystemLogs"

export default function Router() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<SystemLogs />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  )
} 