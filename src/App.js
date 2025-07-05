import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
      {token && (
        <div
          className="nav"
          style={{
            background: '#0071bd',
            color: '#fff',
            padding: '15px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h2 style={{ margin: 0, color: '#fff' }}>finSight</h2>
          <div>
            <span style={{ marginRight: '10px' }}>Hello, {user?.name}</span>
            <button
              onClick={logout}
              style={{
                padding: '6px 12px',
                borderRadius: '5px',
                border: 'none',
                background: '#fff',
                color: '#0071bd',
                fontWeight: 'bold'
              }}
            >
              Logout
            </button>
          </div>
        </div>
      )}

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
