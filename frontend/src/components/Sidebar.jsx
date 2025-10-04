import {
  FaHome,
  FaFire,
  FaThLarge,
  FaCalendarAlt,
  FaCog,
  FaStar,
  FaListUl,
  FaSearch,
  FaUserShield,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import React from "react";

export default function Sidebar() {
  const { user } = useUser();
  
  // Check if user is admin
  const isAdmin = user?.publicMetadata?.role === "admin" || 
                  user?.emailAddresses?.[0]?.emailAddress === "workgd6@gmail.com";

  const navLinks = [
    { name: "Home", icon: <FaHome />, path: "/" },
    { name: "Trending", icon: <FaFire />, path: "/trending" },
    { name: "Top Rated", icon: <FaStar />, path: "/top" },
    { name: "Categories", icon: <FaThLarge />, path: "/categories" },
    { name: "Watchlist", icon: <FaListUl />, path: "/watchlist" },
    { name: "Settings", icon: <FaCog />, path: "/settings" },
    ...(isAdmin ? [{ name: "Admin Panel", icon: <FaUserShield />, path: "/admin" }] : []),
  ];

  return (
    <aside className="w-60 theme-bg-secondary flex flex-col py-8 px-4 min-h-screen border-r theme-border shadow-xl fixed left-0 top-0 h-full z-20 theme-transition">
      <div className="mb-10 flex items-center gap-2">
        <NavLink to="/" className="text-3xl font-extrabold tracking-wide theme-accent drop-shadow">
          CriticScore
        </NavLink>
      </div>
      <nav className="flex flex-col gap-4 theme-text-secondary">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 text-lg font-semibold px-3 py-2 rounded-lg transition-all duration-150 focus:outline-none ${
                isActive
                  ? "theme-accent theme-bg-primary"
                  : "hover:theme-accent hover:theme-bg-primary"
              } ${link.name === "Admin Panel" ? "border-t theme-border mt-4 pt-4" : ""}`
            }
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
