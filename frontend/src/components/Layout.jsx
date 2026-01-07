import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { GuidedTour } from "./GuidedTour";
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  ShoppingBag,
  ClipboardList,
  HelpCircle,
  ChevronDown,
} from "lucide-react";

export const Layout = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStartTour = () => {
    if (window.resetGuidedTour) {
      window.resetGuidedTour();
    }
  };

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role;

    if (role === "customer") {
      return [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/shop", icon: ShoppingBag, label: "Shop", tourId: "nav-shop" },
        {
          to: "/my-orders",
          icon: ClipboardList,
          label: "My Orders",
          tourId: "nav-my-orders",
        },
      ];
    }

    if (role === "employee") {
      return [
        { to: "/", icon: LayoutDashboard, label: "Dashboard" },
        { to: "/shop", icon: ShoppingBag, label: "Shop", tourId: "nav-shop" },
        {
          to: "/invoices",
          icon: FileText,
          label: "Invoices",
          tourId: "nav-invoices",
        },
        { to: "/my-orders", icon: ClipboardList, label: "My Orders" },
      ];
    }

    // Admin & Manager
    return [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      {
        to: "/products",
        icon: Package,
        label: "Products",
        tourId: "nav-products",
      },
      {
        to: "/invoices",
        icon: FileText,
        label: "Invoices",
        tourId: "nav-invoices",
      },
      {
        to: "/reports",
        icon: BarChart3,
        label: "Reports",
        tourId: "nav-reports",
      },
      { to: "/users", icon: Users, label: "Users", tourId: "nav-users" },
      { to: "/shop", icon: ShoppingBag, label: "Shop" },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadgeColor = () => {
    switch (user?.role) {
      case "admin":
        return "bg-red-100 text-red-700";
      case "manager":
        return "bg-purple-100 text-purple-700";
      case "employee":
        return "bg-green-100 text-green-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <GuidedTour />

      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
          <Menu size={24} />
        </button>
        <button
          onClick={() => navigate("/")}
          className="font-bold text-lg text-blue-600"
        >
          Trinity
        </button>
        <button
          onClick={() => navigate("/cart")}
          className="text-gray-600 relative"
        >
          <ShoppingCart size={24} />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative bg-white w-72 p-6">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <X size={24} />
            </button>
            <div className="mb-8">
              <button
                onClick={() => {
                  navigate("/");
                  setSidebarOpen(false);
                }}
                className="text-xl font-bold text-blue-600"
              >
                Trinity
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  data-tour={item.tourId}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-600 hover:bg-gray-100"
                    }`
                  }
                >
                  <item.icon size={20} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-gray-200">
          <div className="p-6">
            <button
              onClick={() => navigate("/")}
              className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Trinity
            </button>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-tour={item.tourId}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`
                }
              >
                <item.icon size={20} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div data-tour="dashboard-stats">
                <h2 className="text-lg font-semibold text-gray-900">
                  Hello, {user?.firstName || "there"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartTour}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Start Guided Tour"
                  data-tour="help-button"
                >
                  <HelpCircle size={20} />
                  <span className="hidden sm:inline text-sm">Help</span>
                </button>

                <button
                  onClick={() => navigate("/cart")}
                  className="relative flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="View Cart"
                  data-tour="header-cart"
                >
                  <ShoppingCart size={20} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                <div className="relative" data-tour="user-menu">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                      {user?.firstName?.charAt(0) ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName || user?.email?.split("@")[0]}
                      </p>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor()}`}
                      >
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown size={16} className="text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900">
                            {user?.email}
                          </p>
                          <p className="text-xs text-gray-500 capitalize">
                            {user?.role}
                          </p>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        >
                          <LogOut size={16} />
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
