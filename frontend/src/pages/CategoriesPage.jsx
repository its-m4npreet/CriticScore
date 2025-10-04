import React, { useState, useEffect, useMemo } from "react";
import MovieCard from "../components/MovieCard";
import ApiService from "../services/api";
import { GenreIcon } from "../components/Icons";

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
        console.log("[Categories] Fetching movies for categories page...");
        const response = await ApiService.getMovies();
        console.log("📡 API Response:", response);
        
        // Handle different response structures
        let allMovies = [];
        if (Array.isArray(response)) {
          allMovies = response;
        } else if (response && response.movies && Array.isArray(response.movies)) {
          allMovies = response.movies;
        } else if (response && response.data && Array.isArray(response.data)) {
          allMovies = response.data;
        }
        
        console.log("[Categories] Processed movies:", allMovies.length, allMovies);
        setMovies(allMovies);

        // Extract unique genres
        const allGenres = new Set();
        allMovies.forEach((movie) => {
          console.log("[Categories] Movie genre:", movie.title, "=>", movie.genre, movie.category);
          
          // Check both 'genre' and 'category' fields
          const genreField = movie.genre || movie.category;
          if (genreField) {
            // Handle both string and array genres
            if (Array.isArray(genreField)) {
              genreField.forEach((g) => allGenres.add(g));
            } else if (typeof genreField === "string") {
              genreField.split(",").forEach((g) => allGenres.add(g.trim()));
            }
          }
        });
        
        const sortedGenres = ["all", ...Array.from(allGenres).sort()];
        console.log("🏷️ Available genres:", sortedGenres);
        setGenres(sortedGenres);
      } catch (err) {
        setError("Failed to load movies");
        console.error("[Categories] Error fetching movies:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    console.log("[Categories] Filtering movies for genre:", selectedGenre);
    console.log("📚 Total movies to filter:", movies.length);
    
    if (selectedGenre === "all") {
      console.log("[Categories] Showing all movies:", movies.length);
      return movies;
    }
    
    const filtered = movies.filter((movie) => {
      // Check both 'genre' and 'category' fields
      const genreField = movie.genre || movie.category;
      
      if (!genreField) {
        console.log("⚠️ Movie has no genre/category:", movie.title);
        return false;
      }
      
      let hasGenre = false;
      
      if (Array.isArray(genreField)) {
        hasGenre = genreField.includes(selectedGenre);
      } else if (typeof genreField === "string") {
        hasGenre = genreField
          .split(",")
          .map((g) => g.trim())
          .includes(selectedGenre);
      }
      
      if (hasGenre) {
        console.log("[Categories] Movie matches genre:", movie.title, genreField);
      }
      
      return hasGenre;
    });
    
    console.log("[Categories] Filtered movies count:", filtered.length);
    return filtered;
  }, [movies, selectedGenre]);

  // Genre icons are now handled by the GenreIcon component

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
              {genre === "all" ? (
                <span className="flex items-center"><GenreIcon genre="all" size={18} className="mr-2 " />All Movies</span>
              ) : (
                <span className="flex items-center"><GenreIcon genre={genre} size={18} className="mr-2" />{genre}</span>
              )}
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
            <GenreIcon genre={selectedGenre === "all" ? "Action" : selectedGenre} size={72} className="text-gray-400" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
