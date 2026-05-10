import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Areas from "./AreaManagement/Areas";
import UsersSettings from "./User/UsersSettings";
import PortionType from "./PortionType";
import PageHeader from "../../components/pageHeader";
import { Settings } from "lucide-react";

const tabs = [
  { key: "areas", label: "Areas / Floors" },
  { key: "users", label: "Users" },
  { key: "portion-types", label: "Portion Types" },
  { key: "taxes", label: "Taxes" },
];

const SSettings = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const tabFromUrl = searchParams.get("tab") || "areas";

  const [activeTab, setActiveTab] = useState(tabFromUrl);

  useEffect(() => {
    setActiveTab(tabFromUrl);
  }, [tabFromUrl]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  return (
    <div>

      {/* HEADER */}
      <PageHeader
        title="Settings"
        
      />

      {/* TABS */}
      <div className="px-5">
        <div className="flex gap-6 border-b overflow-x-auto scrollbar-hide">

          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`
                pb-3 whitespace-nowrap font-medium transition text-sm sm:text-base

                ${
                  activeTab === tab.key
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-primaryDark"
                }
              `}
            >
              {tab.label}
            </button>
          ))}

        </div>
      </div>

      {/* CONTENT */}
      <div className="px-5 pb-6 pt-5">

        {activeTab === "areas" && <Areas />}

        {activeTab === "users" && <UsersSettings />}

        {activeTab === "portion-types" && <PortionType />}

        {activeTab === "taxes" && (
          <div className="text-gray-500">
            Taxes settings coming soon
          </div>
        )}

      </div>

    </div>
  );
};

export default SSettings;