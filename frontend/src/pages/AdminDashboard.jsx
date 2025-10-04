import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Icon } from "../components/Icons";
import ApiService from "../services/api";
import { isUserAdmin } from "../adminDetails";

export default function AdminDashboard() {
  const { user } = useUser();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    poster: "",
    trailer: "",
    backdrop: "",
    year: "",
    runtime: "",
    genre: "",
    director: "",
    language: "English",
    budget: "",
    boxOffice: "",
    awards: "",
    featured: false,
    isActive: true,
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if user is admin using centralized admin details
  const isAdmin = isUserAdmin(user);

  // Load movies
  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMovies();
      const movieData = Array.isArray(response) ? response : response.movies || [];
      setMovies(movieData);
    } catch (error) {
      console.error("Error loading movies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = "Title is required";
    if (!formData.description.trim()) errors.description = "Description is required";
    if (!formData.director.trim()) errors.director = "Director is required";
    if (!formData.year) errors.year = "Release year is required";
    if (!formData.genre.trim()) errors.genre = "Genre is required";
    if (!formData.runtime || formData.runtime <= 0) errors.runtime = "Valid runtime is required";
    
    // URL validation
    const urlPattern = /^https?:\/\/.+/;
    if (formData.poster && !urlPattern.test(formData.poster)) {
      errors.poster = "Valid poster URL is required";
    }
    if (formData.trailer && !urlPattern.test(formData.trailer)) {
      errors.trailer = "Valid trailer URL is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingMovie) {
        await ApiService.updateMovie(editingMovie._id, formData);
        alert("Movie updated successfully!");
      } else {
        await ApiService.createMovie(formData);
        alert("Movie created successfully!");
      }
      
      resetForm();
      loadMovies();
    } catch (error) {
      console.error("Error saving movie:", error);
      alert(`Error ${editingMovie ? 'updating' : 'creating'} movie: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || "",
      description: movie.description || "",
      poster: movie.poster || "",
      trailer: movie.trailer || "",
      backdrop: movie.backdrop || "",
      year: movie.year || new Date(movie.releaseDate).getFullYear() || "",
      runtime: movie.runtime || movie.duration || "",
      genre: Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre || "",
      director: movie.director || "",
      language: movie.language || "English",
      budget: movie.budget || "",
      boxOffice: movie.boxOffice || "",
      awards: movie.awards || "",
      featured: movie.featured || false,
      isActive: movie.isActive !== false,
    });
    setFormErrors({});
    setShowCreateForm(true);
  };

  const handleDelete = async (movieId) => {
    if (window.confirm("Are you sure you want to delete this movie?")) {
      try {
        await ApiService.deleteMovie(movieId);
        loadMovies();
      } catch (error) {
        console.error("Error deleting movie:", error);
        alert("Error deleting movie. Please try again.");
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      poster: "",
      trailer: "",
      backdrop: "",
      year: "",
      runtime: "",
      genre: "",
      director: "",
      language: "English",
      budget: "",
      boxOffice: "",
      awards: "",
      featured: false,
      isActive: true,
    });
    setFormErrors({});
    setEditingMovie(null);
    setShowCreateForm(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen theme-bg-primary">
        <div className="text-center">
          <Icon name="lock" size={64} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold theme-text-primary mb-2">Access Denied</h1>
          <p className="theme-text-secondary">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg-primary theme-text-primary p-8 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-tertiary);
            border-radius: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 4px;
            border: 1px solid var(--bg-secondary);
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: var(--text-secondary);
          }
          
          .modal-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .modal-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-primary);
            border-radius: 3px;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
            opacity: 0.7;
          }
          .modal-scrollbar::-webkit-scrollbar-thumb:hover {
            opacity: 1;
            background: var(--text-primary);
          }
          
          .table-scrollbar::-webkit-scrollbar {
            height: 6px;
          }
          .table-scrollbar::-webkit-scrollbar-track {
            background: var(--bg-secondary);
            border-radius: 3px;
          }
          .table-scrollbar::-webkit-scrollbar-thumb {
            background: var(--accent-color);
            border-radius: 3px;
            opacity: 0.6;
          }
          .table-scrollbar::-webkit-scrollbar-thumb:hover {
            opacity: 0.8;
          }
        `}</style>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Icon name="settings" size={32} className="theme-accent" />
              Admin Dashboard
            </h1>
            <p className="theme-text-secondary mt-2">Manage movies and content</p>
          </div>
          
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 theme-button-primary px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-all"
          >
            <Icon name="plus" size={20} />
            Add New Movie
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="theme-card p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <Icon name="film" size={40} className="theme-accent" />
              <div>
                <h3 className="text-2xl font-bold">{movies.length}</h3>
                <p className="theme-text-secondary">Total Movies</p>
              </div>
            </div>
          </div>
          
          <div className="theme-card p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <Icon name="star" size={40} className="text-yellow-400" />
              <div>
                <h3 className="text-2xl font-bold">
                  {movies.filter(m => m.featured).length}
                </h3>
                <p className="theme-text-secondary">Featured Movies</p>
              </div>
            </div>
          </div>
          
          <div className="theme-card p-6 rounded-xl">
            <div className="flex items-center gap-4">
              <Icon name="trending" size={40} className="text-green-400" />
              <div>
                <h3 className="text-2xl font-bold">
                  {movies.filter(m => m.averageRating > 8).length}
                </h3>
                <p className="theme-text-secondary">High Rated (8+)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Movies Table */}
        <div className="theme-card rounded-xl overflow-hidden">
          <div className="p-6 border-b theme-border">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Icon name="list" size={24} />
              All Movies
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="settings-loading-spinner w-8 h-8 mx-auto mb-4"></div>
              <p>Loading movies...</p>
            </div>
          ) : (
            <div className="overflow-x-auto table-scrollbar">
              <table className="w-full">
                <thead className="theme-bg-secondary">
                  <tr>
                    <th className="text-left p-4 font-semibold">Movie</th>
                    <th className="text-left p-4 font-semibold">Director</th>
                    <th className="text-left p-4 font-semibold">Year</th>
                    <th className="text-left p-4 font-semibold">Rating</th>
                    <th className="text-left p-4 font-semibold">Status</th>
                    <th className="text-left p-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movies.map((movie) => (
                    <tr key={movie._id} className="border-b theme-border hover:theme-bg-hover">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div>
                            <h4 className="font-semibold">{movie.title}</h4>
                            <p className="text-sm theme-text-secondary">
                              {Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{movie.director}</td>
                      <td className="p-4">
                        {movie.year || new Date(movie.releaseDate).getFullYear()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Icon name="star" size={16} className="text-yellow-400" />
                          {movie.averageRating?.toFixed(1) || "N/A"}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          movie.featured ? "bg-yellow-500 text-black" : "theme-bg-secondary"
                        }`}>
                          {movie.featured ? "Featured" : "Regular"}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(movie)}
                            className="p-2 theme-bg-secondary hover:theme-bg-hover rounded transition-colors"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(movie._id)}
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                          >
                            <Icon name="trash" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Create/Edit Movie Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="theme-bg-secondary rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto modal-scrollbar shadow-2xl">
              <div className="p-6 border-b theme-border">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Icon name={editingMovie ? "edit" : "plus"} size={24} />
                  {editingMovie ? "Edit Movie" : "Add New Movie"}
                </h3>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Information */}
                  <div className="space-y-6">
                    <div className="border-b theme-border pb-4">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="film" size={20} />
                        Basic Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Title <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.title 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="Enter movie title"
                            disabled={isSubmitting}
                          />
                          {formErrors.title && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.title}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Director <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="director"
                            value={formData.director}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.director 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="Enter director name"
                            disabled={isSubmitting}
                          />
                          {formErrors.director && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.director}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Description <span className="text-red-400">*</span>
                          </label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md resize-none ${
                              formErrors.description 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="Enter movie description or plot summary..."
                            disabled={isSubmitting}
                          />
                          {formErrors.description && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Movie Details */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="settings" size={20} />
                        Movie Details
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Release Year <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="year"
                            value={formData.year}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.year 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="2024"
                            min="1900"
                            max="2030"
                            disabled={isSubmitting}
                          />
                          {formErrors.year && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.year}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Runtime (minutes) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="runtime"
                            value={formData.runtime}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.runtime 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="120 minutes"
                            min="1"
                            disabled={isSubmitting}
                          />
                          {formErrors.runtime && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.runtime}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">
                            Genre <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            name="genre"
                            value={formData.genre}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.genre 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="e.g., Action, Drama, Comedy"
                            disabled={isSubmitting}
                          />
                          {formErrors.genre && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.genre}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Language</label>
                          <select
                            name="language"
                            value={formData.language}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            disabled={isSubmitting}
                          >
                            <option value="English">English</option>
                            <option value="Hindi">Hindi</option>
                            <option value="Spanish">Spanish</option>
                            <option value="French">French</option>
                            <option value="German">German</option>
                            <option value="Japanese">Japanese</option>
                            <option value="Korean">Korean</option>
                            <option value="Chinese">Chinese</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Media & Additional Info */}
                  <div className="space-y-6">
                    <div className="border-b theme-border pb-4">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="image" size={20} />
                        Media & Links
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Poster URL</label>
                          <input
                            type="url"
                            name="poster"
                            value={formData.poster}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.poster 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="https://example.com/poster.jpg"
                            disabled={isSubmitting}
                          />
                          {formErrors.poster && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.poster}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Trailer URL</label>
                          <input
                            type="url"
                            name="trailer"
                            value={formData.trailer}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md ${
                              formErrors.trailer 
                                ? 'border-red-400 focus:border-red-400 focus:ring-red-400' 
                                : 'theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)]'
                            }`}
                            placeholder="https://youtube.com/watch?v=..."
                            disabled={isSubmitting}
                          />
                          {formErrors.trailer && (
                            <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                              <Icon name="alert" size={12} />
                              {formErrors.trailer}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold mb-2">Backdrop URL</label>
                          <input
                            type="url"
                            name="backdrop"
                            value={formData.backdrop}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="https://example.com/backdrop.jpg"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Icon name="star" size={20} />
                        Additional Information
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold mb-2">Budget</label>
                          <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="50000000"
                            min="0"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Box Office</label>
                          <input
                            type="number"
                            name="boxOffice"
                            value={formData.boxOffice}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="100000000"
                            min="0"
                            disabled={isSubmitting}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold mb-2">Awards</label>
                          <input
                            type="text"
                            name="awards"
                            value={formData.awards}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 rounded-lg border-2 theme-bg-primary theme-text-primary theme-border hover:border-opacity-80 focus:theme-border-accent focus:ring-[var(--accent-color)] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-opacity-50 hover:shadow-md"
                            placeholder="Oscar Winner, Golden Globe Nominee"
                            disabled={isSubmitting}
                          />
                        </div>

                        {/* Status Options */}
                        <div className="pt-4 border-t theme-border">
                          <h5 className="text-md font-semibold mb-3">Status Options</h5>
                          <div className="space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:theme-bg-hover transition-colors">
                              <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-2 theme-border focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50"
                                disabled={isSubmitting}
                              />
                              <div>
                                <span className="text-sm font-semibold">Featured Movie</span>
                                <p className="text-xs theme-text-secondary">Show on homepage as featured content</p>
                              </div>
                            </label>
                            
                            <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:theme-bg-hover transition-colors">
                              <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                className="w-4 h-4 rounded border-2 theme-border focus:ring-2 focus:ring-[var(--accent-color)] focus:ring-opacity-50"
                                disabled={isSubmitting}
                              />
                              <div>
                                <span className="text-sm font-semibold">Active Status</span>
                                <p className="text-xs theme-text-secondary">Make movie visible to users</p>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 mt-8 border-t theme-border">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-6 py-3 theme-button-secondary rounded-lg font-semibold disabled:opacity-50 transition-all duration-200 hover:shadow-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 theme-button-primary rounded-lg font-semibold disabled:opacity-50 flex items-center gap-2 transition-all duration-200 hover:shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="settings-loading-spinner w-4 h-4"></div>
                        {editingMovie ? "Updating..." : "Creating..."}
                      </>
                    ) : (
                      <>
                        <Icon name={editingMovie ? "edit" : "plus"} size={18} />
                        {editingMovie ? "Update Movie" : "Create Movie"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}