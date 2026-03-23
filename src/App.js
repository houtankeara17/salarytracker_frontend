// src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import ExpensesPage from "./pages/ExpensesPage";
import SalaryPage from "./pages/SalaryPage";
import BonusPage from "./pages/BonusPage";
import SavingsPage from "./pages/SavingsPage";
import TripsPage from "./pages/TripsPage";
import GoalsPage from "./pages/GoalsPage";
import GivingsPage from "./pages/GivingsPage";
import OthersPage from "./pages/OthersPage";
import Profile from "./pages/Profile";
import PublicRoute from "./components/PublicRoute";
import NotesPage from "./pages/NotesPage";
import "./styles/globals.css";

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                borderRadius: "12px",
                fontFamily: "Nunito, sans-serif",
                fontSize: "14px",
              },
            }}
          />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />

            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/expenses" element={<ExpensesPage />} />
                      <Route path="/salary" element={<SalaryPage />} />
                      <Route path="/savings" element={<SavingsPage />} />
                      <Route path="/bonus" element={<BonusPage />} />
                      <Route path="/trips" element={<TripsPage />} />
                      <Route path="/goals" element={<GoalsPage />} />
                      <Route path="/givings" element={<GivingsPage />} />
                      <Route path="/others" element={<OthersPage />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notes" element={<NotesPage />} />
                    </Routes>
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
