import React, { useState } from "react";
// import  {  useEffect, useCallback } from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import ApiService from "../services/api";
import { useTheme } from "../hooks/useTheme";
import { Icon } from "../components/Icons";

export default function SettingsPage() {
  const { user, isSignedIn } = useUser();
  const { openUserProfile } = useClerk();
  const { theme, setTheme } = useTheme();
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoplay: false,
    showSpoilers: false,
    defaultRatingSystem: "numbers", // 'numbers' or 'stars'
    language: "en",
    showAdultContent: false,
    movieListView: "grid", // 'grid' or 'list'
    itemsPerPage: 20,
    enableKeyboardShortcuts: true,
    showRatingCounts: true,
    autoSaveReviews: true,
  });
  

  
  // const [saved, setSaved] = useState(false);
  // const [stats, setStats] = useState({
  //   totalRatings: 0,
  //   totalReviews: 0,
  //   averageRating: 0,
  //   favoriteGenres: [],
  //   watchlistCount: 0,
  // });
  // const [loading, setLoading] = useState(false);
  // const [exportLoading, setExportLoading] = useState(false);

  // const loadUserStats = useCallback(async () => {
  //   if (!isSignedIn) return;
    
  //   try {
  //     // setLoading(true);
  //     // Get watchlist count
  //     const watchlist = await ApiService.getWatchlist();
  //     const watchlistCount = Array.isArray(watchlist) ? watchlist.length : 0;
      
  //     // Simulate user stats (in a real app, this would come from the backend)
  //     // setStats({
  //     //   totalRatings: Math.floor(Math.random() * 100) + 20,
  //     //   totalReviews: Math.floor(Math.random() * 50) + 10,
  //     //   averageRating: (Math.random() * 4 + 6).toFixed(1),
  //     //   favoriteGenres: ['Action', 'Drama', 'Sci-Fi'],
  //     //   watchlistCount,
  //     // });
  //   } catch (error) {
  //     console.error('Error loading user stats:', error);
  //   } finally {
  //     // setLoading(false);
  //   }
  // }, [isSignedIn]);

  // useEffect(() => {
  //   // Load settings from localStorage
  //   const savedSettings = localStorage.getItem("criticscore_settings");
  //   if (savedSettings) {
  //     const parsedSettings = JSON.parse(savedSettings);
  //     setSettings(parsedSettings);
  //   }
    
  //   // Load user statistics
  //   loadUserStats();
  // }, [isSignedIn, user, loadUserStats]);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };



  // const saveSettings = () => {
  //   localStorage.setItem("criticscore_settings", JSON.stringify(settings));
  //   setSaved(true);
  //   setTimeout(() => setSaved(false), 2000);
  // };



  // const exportUserData = async () => {
  //   setExportLoading(true);
  //   try {
  //     const exportData = {
  //       user: {
  //         name: user?.fullName || 'User',
  //         email: user?.emailAddresses?.[0]?.emailAddress || 'Not provided',
  //         id: user?.id,
  //       },
  //       settings,
  //       stats,
  //       exportDate: new Date().toISOString(),
  //     };
      
  //     const dataStr = JSON.stringify(exportData, null, 2);
  //     const dataBlob = new Blob([dataStr], { type: 'application/json' });
  //     const url = URL.createObjectURL(dataBlob);
      
  //     const link = document.createElement('a');
  //     link.href = url;
  //     link.download = `criticscore-data-${new Date().toISOString().split('T')[0]}.json`;
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     URL.revokeObjectURL(url);
      
  //     setSaved(true);
  //     setTimeout(() => setSaved(false), 2000);
  //   } catch (error) {
  //     console.error('Error exporting data:', error);
  //   } finally {
  //     setExportLoading(false);
  //   }
  // };

  // const clearAllData = () => {
  //   if (window.confirm('Are you sure you want to clear all your local data? This action cannot be undone.')) {
  //     localStorage.clear();
  //     resetSettings();
  //     loadUserStats();
  //   }
  // };

  // const resetSettings = () => {
  //   const defaultSettings = {
  //     emailNotifications: true,
  //     autoplay: false,
  //     showSpoilers: false,
  //     defaultRatingSystem: "numbers",
  //     language: "en",
  //     showAdultContent: false,
  //     movieListView: "grid",
  //     itemsPerPage: 20,
  //     enableKeyboardShortcuts: true,
  //     showRatingCounts: true,
  //     autoSaveReviews: true,
  //   };
  //   setSettings(defaultSettings);
  //   localStorage.setItem(
  //     "criticscore_settings",
  //     JSON.stringify(defaultSettings)
  //   );
  //   // Reset theme to dark
  //   setTheme('dark');
  //   setSaved(true);
  //   setTimeout(() => setSaved(false), 2000);
  // };

  if (!isSignedIn) {
    return (
      <section className="px-8 py-6">
        <div className="text-center py-20">
          <div className="text-8xl mb-6">🔐</div>
          <h2 className="text-3xl font-bold text-white mb-4">
            Sign In Required
          </h2>
          <p className="text-gray-400 text-lg">
            You need to sign in to access your settings
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-8 py-6 theme-bg-primary theme-text-primary min-h-screen">
      
      <div className="max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            <Icon name="profile" size={20} className="mr-2" /> Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block theme-text-secondary mb-2">Name</label>
              <div className="settings-input rounded-lg p-3">
                <span className="theme-text-primary">
                  {user?.fullName || user?.firstName || "Anonymous User"}
                </span>
              </div>
            </div>
            <div>
              <label className="block theme-text-secondary mb-2">Email</label>
              <div className="settings-input rounded-lg p-3">
                <span className="theme-text-primary">
                  {user?.emailAddresses?.[0]?.emailAddress || "Not provided"}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t theme-border">
            <button
              onClick={() => openUserProfile()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
            >
              🔧 Manage Profile in Clerk
            </button>
          </div>
        </div>

        {/* User Statistics */}
        {/* <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            <Icon name="stats" size={20} className="mr-2" /> Your Statistics
          </h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="settings-loading-spinner w-8 h-8"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <div className="text-2xl font-bold theme-accent">{stats.totalRatings}</div>
                <div className="theme-text-secondary text-sm">Total Ratings</div>
              </div>
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <div className="text-2xl font-bold theme-accent">{stats.totalReviews}</div>
                <div className="theme-text-secondary text-sm">Reviews Written</div>
              </div>
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <div className="text-2xl font-bold theme-accent">{stats.averageRating}</div>
                <div className="theme-text-secondary text-sm">Avg Rating</div>
              </div>
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <div className="text-2xl font-bold theme-accent">{stats.watchlistCount}</div>
                <div className="theme-text-secondary text-sm">Watchlist Items</div>
              </div>
              <div className="text-center p-4 theme-bg-secondary rounded-lg">
                <div className="text-2xl font-bold theme-accent">{stats.favoriteGenres.length}</div>
                <div className="theme-text-secondary text-sm">Fav Genres</div>
              </div>
            </div>
          )}
        </div> */}

        {/* Display Preferences */}
        <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            <Icon name="palette" size={20} className="mr-2" /> Display Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">Theme</label>
                <p className="theme-text-secondary text-sm">
                  Choose your preferred theme
                </p>
              </div>
              <select
                value={theme}
                onChange={(e) => handleThemeChange(e.target.value)}
                className="settings-input px-3 py-2 rounded-lg"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">
                  Default Rating System
                </label>
                <p className="theme-text-secondary text-sm">
                  How you prefer to rate movies
                </p>
              </div>
              <select
                value={settings.defaultRatingSystem}
                onChange={(e) =>
                  handleSettingChange("defaultRatingSystem", e.target.value)
                }
                className="settings-input px-3 py-2 rounded-lg"
              >
                <option value="numbers">Numbers (1-10)</option>
                <option value="stars">Stars (1-5)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">Language</label>
                <p className="theme-text-secondary text-sm">Interface language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
                className="settings-input px-3 py-2 rounded-lg"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
          </div>
        </div>

        {/* Privacy & Content */}
        <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            <Icon name="lock" size={20} className="mr-2" /> Privacy & Content
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">
                  Show Spoilers
                </label>
                <p className="theme-text-secondary text-sm">
                  Display spoiler content in reviews
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.showSpoilers}
                  onChange={(e) =>
                    handleSettingChange("showSpoilers", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.showSpoilers ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.showSpoilers ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">
                  Show Adult Content
                </label>
                <p className="theme-text-secondary text-sm">
                  Display mature-rated movies
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.showAdultContent}
                  onChange={(e) =>
                    handleSettingChange("showAdultContent", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.showAdultContent ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.showAdultContent ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            🔔 Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">
                  Email Notifications
                </label>
                <p className="theme-text-secondary text-sm">
                  Receive updates about new movies and reviews
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    handleSettingChange("emailNotifications", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.emailNotifications ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>

            {/* <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">
                  Autoplay Trailers
                </label>
                <p className="theme-text-secondary text-sm">
                  Automatically play movie trailers when available
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={settings.autoplay}
                  onChange={(e) =>
                    handleSettingChange("autoplay", e.target.checked)
                  }
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  settings.autoplay ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    settings.autoplay ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div> */}
          </div>
        </div>

        {/* Advanced Preferences */}
        {/* <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            ⚡ Advanced Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">Movie List View</label>
                <p className="theme-text-secondary text-sm">How movies are displayed in lists</p>
              </div>
              <select
                value={settings.movieListView}
                onChange={(e) => handleSettingChange("movieListView", e.target.value)}
                className="settings-input px-3 py-2 rounded-lg"
              >
                <option value="grid">Grid View</option>
                <option value="list">List View</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">Items Per Page</label>
                <p className="theme-text-secondary text-sm">Number of movies shown per page</p>
              </div>
              <select
                value={settings.itemsPerPage}
                onChange={(e) => handleSettingChange("itemsPerPage", Number(e.target.value))}
                className="settings-input px-3 py-2 rounded-lg"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">High Contrast Mode</label>
                <p className="theme-text-secondary text-sm">Improve accessibility with higher contrast</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isHighContrast}
                  onChange={toggleHighContrast}
                />
                <div className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                  isHighContrast ? 'settings-toggle-checked' : 'settings-toggle-unchecked'
                }`}>
                  <div className={`absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-200 ${
                    isHighContrast ? 'translate-x-5' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>
          </div>
        </div> */}

        {/* Data Management */}
        {/* <div className="settings-card rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold theme-accent mb-4 flex items-center gap-2">
            <Icon name="save" size={20} className="mr-2" /> Data Management
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">Export Your Data</label>
                <p className="theme-text-secondary text-sm">Download your settings, ratings, and reviews</p>
              </div>
              <button
                onClick={exportUserData}
                disabled={exportLoading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                {exportLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Exporting...
                  </>
                ) : (
                  <>
                    📥 Export Data
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="theme-text-primary font-semibold">Clear All Data</label>
                <p className="theme-text-secondary text-sm">Remove all local settings and cached data</p>
              </div>
              <button
                onClick={clearAllData}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-all duration-200"
              >
                <Icon name="trash" size={18} className="mr-2" /> Clear Data
              </button>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        {/* <div className="flex gap-4 justify-center flex-wrap">
          <button
            onClick={saveSettings}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              saved
                ? "settings-success text-white"
                : "settings-button hover:opacity-90"
            }`}
          >
            {saved ? (
              <><Icon name="checkCircle" size={18} className="mr-2" /> Saved!</>
            ) : (
              <><Icon name="save" size={18} className="mr-2" /> Save Settings</>
            )}
          </button>
          <button
            onClick={resetSettings}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            <Icon name="reset" size={18} className="mr-2" /> Reset to Default
          </button>
          <button
            onClick={loadUserStats}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            <Icon name="refresh" size={18} className="mr-2" /> Refresh Stats
          </button>
        </div> */}
      </div>
    </section>
  );
}
