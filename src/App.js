import React, { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import AddTransaction from './components/AddTransaction';
import Dashboard from './components/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';
import './App.css';

function App() {
  const [reloadFlag, setReloadFlag] = useState(false);
  const { token, logout, user } = useAuth();

  const handleTransactionAdded = () => {
    setReloadFlag(prev => !prev);
  };

  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" />;
  };

  return (
    <div className="App">
      {/* Top Navbar always visible */}
      <header className="app-header">
        <h2 className="logo">finSight</h2>
        <div className="nav-right">
          {token ? (
            <>
              <span>Hello, {user?.name}</span>
              <button onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <>
                <AddTransaction onTransactionAdded={handleTransactionAdded} />
                <Dashboard reload={reloadFlag} />
              </>
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

export default App;
