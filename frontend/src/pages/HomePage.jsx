import React, { useState } from "react";
import MovieCard from "../components/MovieCard";

export default function HomePage({ allMovies, loading, error }) {
  const [activeCategory, setActiveCategory] = useState(null);
  
  let filteredMovies = allMovies;
  if (activeCategory) {
    filteredMovies = filteredMovies.filter((m) => m.category === activeCategory);
  }

  const categories = Array.from(new Set(allMovies.map((m) => m.category)));
  const bannerImg = allMovies[0]?.image || "";
  const bannerTitle = "Discover Amazing Movies & Anime";
  const bannerDesc = "Experience the best ratings and reviews from the CriticScore community.";

  return (
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c518] relative h-56 bg-gradient-to-r from-[#232323] to-[#141414] flex items-center justify-center mb-8">
        <img
          src={bannerImg}
          alt="Banner"
          className="object-cover w-full h-full opacity-60 absolute top-0 left-0"
        />
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[#f5c518] drop-shadow-lg">
            {bannerTitle}
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">{bannerDesc}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-[#f5c518] tracking-wide">Home</h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
            className={
              `font-semibold px-4 py-2 text-base text-center shadow rounded border transition-colors ` +
              (activeCategory === cat
                ? "bg-[#f5c518] text-black border-[#f5c518]"
                : "bg-[#232323] text-[#f5c518] border-[#f5c518] hover:bg-[#f5c518] hover:text-black")
            }
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full h-32 text-[#f5c518] text-xl font-bold">
          Loading movies...
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
          {error}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-gray-400 text-lg">
          No movies found for this page.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7">
          {filteredMovies.map((movie, idx) => (
            <MovieCard key={idx} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}