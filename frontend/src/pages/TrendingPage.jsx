import React from "react";
import MovieCard from "../components/MovieCard";

export default function TrendingPage({ allMovies, loading, error }) {
  const filteredMovies = allMovies.filter((m) => m.trending);
  const bannerImg = allMovies.find((m) => m.trending)?.image || allMovies[0]?.image || "";

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
            What's Hot Right Now
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            See what's trending in the world of movies and anime.
          </p>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-[#f5c518] tracking-wide">
          Trending Now
        </h3>
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
          No trending movies found.
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