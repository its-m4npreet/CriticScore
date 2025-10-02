import React, { useState, useEffect } from "react";
import MovieCard from "../components/MovieCard";
import ApiService from "../services/api";

export default function CategoriesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [genres, setGenres] = useState([]);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getMovies();
        const allMovies = Array.isArray(response) ? response : [];
        setMovies(allMovies);

        // Extract unique genres
        const allGenres = new Set();
        allMovies.forEach((movie) => {
          if (movie.genre) {
            // Handle both string and array genres
            if (Array.isArray(movie.genre)) {
              movie.genre.forEach((g) => allGenres.add(g));
            } else if (typeof movie.genre === "string") {
              movie.genre.split(",").forEach((g) => allGenres.add(g.trim()));
            }
          }
        });
        setGenres(["all", ...Array.from(allGenres).sort()]);
      } catch (err) {
        setError("Failed to load movies");
        console.error("Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies =
    selectedGenre === "all"
      ? movies
      : movies.filter((movie) => {
          if (!movie.genre) return false;
          if (Array.isArray(movie.genre)) {
            return movie.genre.includes(selectedGenre);
          }
          if (typeof movie.genre === "string") {
            return movie.genre
              .split(",")
              .map((g) => g.trim())
              .includes(selectedGenre);
          }
          return false;
        });

  const genreEmojis = {
    Action: "💥",
    Adventure: "🗺️",
    Animation: "🎨",
    Comedy: "😂",
    Crime: "🔫",
    Documentary: "📽️",
    Drama: "🎭",
    Family: "👨‍👩‍👧‍👦",
    Fantasy: "🧙‍♂️",
    History: "📜",
    Horror: "👻",
    Music: "🎵",
    Mystery: "🔍",
    Romance: "💕",
    "Science Fiction": "🚀",
    Thriller: "😰",
    War: "⚔️",
    Western: "🤠",
  };

  return (
    <section className="px-8 py-6 theme-bg-primary theme-text-primary">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 theme-border-accent relative h-56 theme-bg-secondary flex items-center justify-center mb-8">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide theme-accent drop-shadow-lg">
            🎬 Browse by Categories
          </h2>
          <p className="theme-text-secondary text-lg drop-shadow">
            Discover movies by your favorite genres
          </p>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="mb-8">
        <h3 className="text-2xl font-bold theme-accent mb-4">Select Genre</h3>
        <div className="flex flex-wrap gap-3">
          {genres.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-200 ${
                selectedGenre === genre
                  ? "theme-bg-accent theme-text-on-accent shadow-lg transform scale-105"
                  : "theme-bg-secondary theme-text-secondary hover:theme-bg-hover theme-border"
              }`}
            >
              {genre === "all"
                ? "🎯 All Movies"
                : `${genreEmojis[genre] || "🎬"} ${genre}`}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold theme-text-primary tracking-wide">
          {selectedGenre === "all"
            ? `All Movies (${filteredMovies.length})`
            : `${selectedGenre} Movies (${filteredMovies.length})`}
        </h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center w-full h-32 theme-accent text-xl font-bold">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 theme-border-accent"></div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center w-full h-32 text-red-400 text-xl font-bold">
          {error}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">
            {genreEmojis[selectedGenre] || "🎬"}
          </div>
          <h3 className="text-2xl font-semibold mb-2 text-gray-300">
            No {selectedGenre === "all" ? "Movies" : selectedGenre + " Movies"}{" "}
            Found
          </h3>
          <p className="text-gray-400">
            {selectedGenre === "all"
              ? "No movies available yet"
              : `No ${selectedGenre.toLowerCase()} movies available yet`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
