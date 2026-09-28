import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import ExploreIndia from "./pages/ExploreIndia";
import StateExplorer from "./pages/StateExplorer";
import Destination from "./pages/Destination";
import PlanTrip from "./pages/PlanTrip";
import MyTrips from "./pages/MyTrips";
import TripDetails from "./pages/TripDetails";
import DiscoverTravelers from "./pages/DiscoverTravelers";
import TravelGroups from "./pages/TravelGroups";
import GroupDetails from "./pages/GroupDetails";
import Messages from "./pages/Messages";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import PublicSharedTrip from "./pages/PublicSharedTrip";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <ToastProvider>
          <ToastContainer />
          <BrowserRouter>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<ExploreIndia />} />
            <Route path="/state/:stateSlug" element={<StateExplorer />} />
            <Route path="/destination/:name" element={<Destination />} />
            <Route path="/plan" element={<PlanTrip />} />
            <Route path="/share/trip/:shareId" element={<PublicSharedTrip />} />
            <Route path="/travelers" element={<DiscoverTravelers />} />
            <Route path="/groups" element={<TravelGroups />} />
            <Route path="/groups/:id" element={<GroupDetails />} />
            <Route path="/trips" element={<MyTrips />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/wishlist"
              element={
                <ProtectedRoute>
                  <Wishlist />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        </ToastProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;