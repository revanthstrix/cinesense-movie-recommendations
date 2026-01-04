import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './components/Home';
import MovieDetails from './components/MovieDetails';
import Upcoming from './components/Upcoming';
import Recommendations from './components/recommendations';
import ActorDetails from './components/ActorDetails';
import SignIn from './auth/SignIn';
import Register from './auth/Register';
import PrivateRoute from './auth/PrivateRoute';
import Watchlist from './pages/Watchlist';
import Profile from './components/Profile';
import AdminDashboard from './components/AdminDashboard';
import EditProfile from './pages/EditProfile';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Series from './components/Series';
import SeriesDetails from './components/SeriesDetails';

export default function App() {

  return (
    <Router>
      <Routes>
        {/* ✅ First page will be Register */}
        <Route path="/" element={<Navigate to="/home" />} />

        {/* ✅ Public Routes */}
        <Route path="/register" element={<Register />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password" element={<ResetPassword />} />


        {/* ✅ Protected Routes */}
        <Route
          path="/home"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/series"
          element={
            <PrivateRoute>
              <Series />
            </PrivateRoute>
          }
        />
        <Route
          path="/series/:id"
          element={
            <PrivateRoute>
              <SeriesDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit-profile"
          element={
            <PrivateRoute>
              <EditProfile />
            </PrivateRoute>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <PrivateRoute>
              <MovieDetails key={window.location.pathname}/>
            </PrivateRoute>
          }
        />
        <Route
          path="/upcoming"
          element={
            <PrivateRoute>
              <Upcoming />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommendations"
          element={
            <PrivateRoute>
              <Recommendations />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommendations/:genreId"
          element={
            <PrivateRoute>
              <Recommendations />
            </PrivateRoute>
          }
        />
        <Route
          path="/recommendations/lang/:langCode"
          element={
            <PrivateRoute>
              <Recommendations />
            </PrivateRoute>
          }
        />
        <Route
          path="/actor/:id"
          element={
            <PrivateRoute>
              <ActorDetails />
            </PrivateRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <PrivateRoute>
              <Watchlist />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}
