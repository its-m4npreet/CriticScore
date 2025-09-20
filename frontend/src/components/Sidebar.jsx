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

const navLinks = [
  { name: "Home", icon: <FaHome />, page: "home" },
  { name: "Trending", icon: <FaFire />, page: "trending" },
  { name: "Top Rated", icon: <FaStar />, page: "top" },
  { name: "Categories", icon: <FaThLarge />, page: "categories" },
  { name: "Watchlist", icon: <FaListUl />, page: "watchlist" },
  { name: "Upcoming", icon: <FaCalendarAlt />, page: "upcoming" },
  { name: "Settings", icon: <FaCog />, page: "settings" },
];

import React from "react";

export default function Sidebar({ currentPage, setCurrentPage }) {
  return (
    <aside className="w-60 bg-[#181818] flex flex-col py-8 px-4 min-h-screen border-r border-[#222] shadow-xl fixed left-0 top-0 h-full z-20">
      <div className="mb-10 flex items-center gap-2">
        <span className="text-3xl font-extrabold tracking-wide text-[#f5c518] drop-shadow">
          CriticScore
        </span>
      </div>
      <nav className="flex flex-col gap-4 text-gray-300">
        {navLinks.map((link) => (
          <button
            key={link.name}
            onClick={() => setCurrentPage(link.page)}
            className={`flex items-center gap-3 text-lg font-semibold px-3 py-2 rounded-lg transition-all duration-150 focus:outline-none ${
              currentPage === link.page
                ? "text-[#f5c518] bg-[#232323]"
                : "hover:text-[#f5c518] hover:bg-[#232323]"
            }`}
          >
            <span className="text-xl">{link.icon}</span>
            {link.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}
