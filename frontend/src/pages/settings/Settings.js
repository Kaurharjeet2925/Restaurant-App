import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Areas from "./AreaManagement/Areas";
import UsersSettings from "./User/UsersSettings";
import PortionType from "./PortionType";
const tabs = [
  { key: "areas", label: "Areas / Floors" },
  { key: "users", label: "Users" },
  { key: "portion-types", label: "Portion Types" },
  { key: "taxes", label: "Taxes" },

];

const Settings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // ✅ READ TAB FROM URL
  const tabFromUrl = searchParams.get("tab") || "areas";
  const [activeTab, setActiveTab] = useState(tabFromUrl);

  // ✅ SYNC when URL changes
  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        ⚙️ Settings
      </h1>

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`pb-2 font-medium transition ${
              activeTab === tab.key
                ? "border-b-2 border-[#ff4d4d] text-[#ff4d4d]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      {activeTab === "areas" && <Areas />}
      {activeTab === "users" && <UsersSettings />}
      {activeTab === "portion-types" && <PortionType />}
       {activeTab === "taxes" && (
        <div className="text-gray-500">Taxes settings coming soon</div>
      )}
    </div>
  );
};

export default Settings;
