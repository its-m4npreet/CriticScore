import React from "react";

export default function SettingsPage() {
  return (
    <section className="px-8 py-6">
      <div className="rounded-2xl overflow-hidden shadow-2xl border-2 border-[#f5c518] relative h-56 bg-gradient-to-r from-[#232323] to-[#141414] flex items-center justify-center mb-8">
        <div className="relative z-10 text-center">
          <h2 className="text-4xl font-extrabold mb-2 tracking-wide text-[#f5c518] drop-shadow-lg">
            Settings
          </h2>
          <p className="text-gray-200 text-lg drop-shadow">
            Manage your CriticScore preferences.
          </p>
        </div>
      </div>
      
      <div className="text-gray-300 text-lg">
        Settings page coming soon.
      </div>
    </section>
  );
}