import { useState, useEffect, JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchUser, logout } from "./redux/authSlice";
import type { AppDispatch, RootState } from "./redux/store";

// Pages
import Tasks from "./pages/Tasks";
import Dashboard from "./pages/Dashboard";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile"; // ✅ Include Profile Page

// UI
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";

// AI Assistant
import MiniAssistant from "./components/MiniAssistant"; // ✅ Import Assistant

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user } = useSelector((state: RootState) => state.auth);
  return user ? children : <Navigate to="/login" replace />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Routes location={location}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <Tasks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

const App = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, error } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const resultAction = await dispatch(fetchUser());
        if (fetchUser.rejected.match(resultAction)) {
          console.error("Failed to fetch user:", resultAction.payload || resultAction.error.message);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [dispatch]);

  const handleLogout = () => {
    dispatch(logout());
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        {/* 🔝 Navigation */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-600">🎮 Study Planner</h1>

            {user && (
              <nav className="flex gap-4 items-center">
                <NavLink
                  to="/dashboard"
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-indigo-600 underline" : "text-gray-600"}`
                  }
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/tasks"
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-indigo-600 underline" : "text-gray-600"}`
                  }
                >
                  Tasks
                </NavLink>
                <NavLink
                  to="/leaderboard"
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-indigo-600 underline" : "text-gray-600"}`
                  }
                >
                  Leaderboard
                </NavLink>
                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `text-sm font-medium ${isActive ? "text-indigo-600 underline" : "text-gray-600"}`
                  }
                >
                  Profile
                </NavLink>
                <div className="text-sm text-right">
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-yellow-600">🏆 {user.xp} XP</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </nav>
            )}
          </div>
        </header>

        {/* 📌 Routes */}
        <main className="container mx-auto px-4 py-6">
          <AnimatedRoutes />
          {/* 🛑 Error Display */}
          {error && typeof error === "object" && "msg" in error && (
            <div className="mt-4 text-red-600 text-sm">{(error as any).msg}</div>
          )}
        </main>

        {/* 🤖 Mini Assistant (AI Study Coach) */}
        <MiniAssistant />
      </div>
    </Router>
  );
};

export default App;
