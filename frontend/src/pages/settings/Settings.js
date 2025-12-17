import React, { useState } from "react";
import Areas from "./AreaManagement/Areas";




const tabs = [
  { key: "areas", label: "Areas / Floors" },
  { key: "users", label: "Users" },
  { key: "taxes", label: "Taxes" }
];

const Settings = () => {
  const [activeTab, setActiveTab] = useState("areas");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        ⚙️ Settings
      </h1>

      {/* TABS */}
      <div className="flex gap-3 border-b mb-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 font-medium transition
              ${
                activeTab === tab.key
                  ? "border-b-2 border-[#ff4d4d] text-[#ff4d4d]"
                  : "text-gray-500 hover:text-gray-700"
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      <div>
        {activeTab === "areas" && <Areas />}
        {activeTab === "users" && (
          <div className="text-gray-500">Users settings coming soon</div>
        )}
        {activeTab === "taxes" && (
          <div className="text-gray-500">Taxes settings coming soon</div>
        )}
      </div>
    </div>
  );
};

export default Settings;
