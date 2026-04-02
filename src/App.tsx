import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import MainLayout from './components/Layout/MainLayout';
import Company from './pages/Company';
import Customers from './pages/Customers';
import NewCustomer from './pages/NewCustomer';
import EditCustomer from './pages/EditCustomer';

import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected Routes (Authenticated Layout) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/company" element={<Company />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/customers/new" element={<NewCustomer />} />
              <Route path="/customers/:id" element={<EditCustomer />} />

              <Route path="/dashboard" element={<Navigate to="/company" replace />} />
            </Route>
          </Route>

          {/* Default route to /login for now */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Catch-all redirect to login or dashboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
