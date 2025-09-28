import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";

export default function SettingsPage() {
  const { user, isSignedIn } = useUser();
  const [settings, setSettings] = useState({
    theme: "dark",
    emailNotifications: true,
    autoplay: false,
    showSpoilers: false,
    defaultRatingSystem: "numbers", // 'numbers' or 'stars'
    language: "en",
    showAdultContent: false,
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem("criticscore_settings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    localStorage.setItem("criticscore_settings", JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetSettings = () => {
    const defaultSettings = {
      theme: "dark",
      emailNotifications: true,
      autoplay: false,
      showSpoilers: false,
      defaultRatingSystem: "numbers",
      language: "en",
      showAdultContent: false,
    };
    setSettings(defaultSettings);
    localStorage.setItem(
      "criticscore_settings",
      JSON.stringify(defaultSettings)
    );
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

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
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c518] relative h-56 bg-gradient-to-r from-[#232323] to-[#141414] flex items-center justify-center mb-8">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[#f5c518] drop-shadow-lg">
            ⚙️ Settings
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            Customize your CriticScore experience
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* User Profile Section */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-[#f5c518] mb-4 flex items-center gap-2">
            👤 Profile Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 mb-2">Name</label>
              <div className="bg-[#232323] border border-gray-600 rounded-lg p-3 text-gray-400">
                {user?.fullName || user?.firstName || "Anonymous User"}
              </div>
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Email</label>
              <div className="bg-[#232323] border border-gray-600 rounded-lg p-3 text-gray-400">
                {user?.emailAddresses?.[0]?.emailAddress || "Not provided"}
              </div>
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-[#f5c518] mb-4 flex items-center gap-2">
            🎨 Display Preferences
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">Theme</label>
                <p className="text-gray-400 text-sm">
                  Choose your preferred theme
                </p>
              </div>
              <select
                value={settings.theme}
                onChange={(e) => handleSettingChange("theme", e.target.value)}
                className="bg-[#232323] border border-gray-600 text-white px-3 py-2 rounded-lg"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">
                  Default Rating System
                </label>
                <p className="text-gray-400 text-sm">
                  How you prefer to rate movies
                </p>
              </div>
              <select
                value={settings.defaultRatingSystem}
                onChange={(e) =>
                  handleSettingChange("defaultRatingSystem", e.target.value)
                }
                className="bg-[#232323] border border-gray-600 text-white px-3 py-2 rounded-lg"
              >
                <option value="numbers">Numbers (1-10)</option>
                <option value="stars">Stars (1-5)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">Language</label>
                <p className="text-gray-400 text-sm">Interface language</p>
              </div>
              <select
                value={settings.language}
                onChange={(e) =>
                  handleSettingChange("language", e.target.value)
                }
                className="bg-[#232323] border border-gray-600 text-white px-3 py-2 rounded-lg"
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
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-[#f5c518] mb-4 flex items-center gap-2">
            🔒 Privacy & Content
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">
                  Show Spoilers
                </label>
                <p className="text-gray-400 text-sm">
                  Display spoiler content in reviews
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showSpoilers}
                  onChange={(e) =>
                    handleSettingChange("showSpoilers", e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5c518]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">
                  Show Adult Content
                </label>
                <p className="text-gray-400 text-sm">
                  Display mature-rated movies
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.showAdultContent}
                  onChange={(e) =>
                    handleSettingChange("showAdultContent", e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5c518]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#1a1a1a] rounded-lg p-6 mb-8 border border-gray-700">
          <h3 className="text-2xl font-bold text-[#f5c518] mb-4 flex items-center gap-2">
            🔔 Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">
                  Email Notifications
                </label>
                <p className="text-gray-400 text-sm">
                  Receive updates about new movies and reviews
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    handleSettingChange("emailNotifications", e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5c518]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-semibold">
                  Autoplay Trailers
                </label>
                <p className="text-gray-400 text-sm">
                  Automatically play movie trailers when available
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.autoplay}
                  onChange={(e) =>
                    handleSettingChange("autoplay", e.target.checked)
                  }
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f5c518]"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={saveSettings}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              saved
                ? "bg-green-600 text-white"
                : "bg-[#f5c518] text-black hover:bg-yellow-400"
            }`}
          >
            {saved ? "✅ Saved!" : "Save Settings"}
          </button>
          <button
            onClick={resetSettings}
            className="px-8 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-all duration-200"
          >
            Reset to Default
          </button>
        </div>
      </div>
    </section>
  );
}
