import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import TasksPage from "./pages/TasksPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/tasks" replace />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="*" element={<Navigate to="/tasks" replace />} />
      </Routes>

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#16161c",
            color: "#ededf1",
            border: "1px solid #26262e",
            borderRadius: "12px",
            fontSize: "14px",
            boxShadow: "0 16px 40px -16px rgba(0,0,0,0.7)",
          },
          success: { iconTheme: { primary: "#34d399", secondary: "#16161c" } },
          error: { iconTheme: { primary: "#fb6f84", secondary: "#16161c" } },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
