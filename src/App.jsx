import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';  
import Welcome from './Components/Assets/LoginRegister/Welcome';
import LoginRegister from './Components/Assets/LoginRegister/LoginRegister';
import PasswordReset from './Components/Assets/LoginRegister/PasswordReset';
import ChangePassword from './Components/Assets/LoginRegister/ChangePassword';

// Protected Route Component สำหรับป้องกันเส้นทางที่ต้องการการยืนยันตัวตน
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <h2>Access Denied. Please log in first.</h2>;
  }
  return children;
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // ใช้สำหรับเก็บสถานะการล็อกอิน

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <LoginRegister setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        <Route 
          path="/Welcome" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Welcome />
            </ProtectedRoute>
          } 
        />
        {/* เปิดให้เข้าถึงได้โดยไม่ต้องล็อกอิน */}
        <Route 
          path="/PasswordReset" 
          element={<PasswordReset />} 
        />
        <Route 
          path="/ChangePassword" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ChangePassword />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </Router>
  );
}

export default App;
