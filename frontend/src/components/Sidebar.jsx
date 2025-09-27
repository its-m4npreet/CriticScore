import {
  FaHome,
  FaFire,
  FaThLarge,
  FaCalendarAlt,
  FaCog,
  FaStar,
  FaListUl,
  FaSearch,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const navLinks = [
  { name: "Home", icon: <FaHome />, path: "/" },
  { name: "Trending", icon: <FaFire />, path: "/trending" },
  { name: "Top Rated", icon: <FaStar />, path: "/top" },
  { name: "Categories", icon: <FaThLarge />, path: "/categories" },
  { name: "Watchlist", icon: <FaListUl />, path: "/watchlist" },
  { name: "Upcoming", icon: <FaCalendarAlt />, path: "/upcoming" },
  { name: "Settings", icon: <FaCog />, path: "/settings" },
];

import React from "react";

export default function Sidebar() {
  return (
    <aside className="w-60 bg-[#181818] flex flex-col py-8 px-4 min-h-screen border-r border-[#222] shadow-xl fixed left-0 top-0 h-full z-20">
      <div className="mb-10 flex items-center gap-2">
        <NavLink to="/" className="text-3xl font-extrabold tracking-wide text-[#f5c518] drop-shadow">
          CriticScore
        </NavLink>
      </div>
      <nav className="flex flex-col gap-4 text-gray-300">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-3 text-lg font-semibold px-3 py-2 rounded-lg transition-all duration-150 focus:outline-none ${
                isActive
                  ? "text-[#f5c518] bg-[#232323]"
                  : "hover:text-[#f5c518] hover:bg-[#232323]"
              }`
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
