import React, { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";

const EMPTY_UNIT = { name: "", value: "" };

const PortionType = () => {
  const [portionTypes, setPortionTypes] = useState([]);
  const [activeType, setActiveType] = useState(null);
  const [units, setUnits] = useState([{ ...EMPTY_UNIT }]);
  const [pricingRule, setPricingRule] = useState("percentage");
  const [loading, setLoading] = useState(false);

  /* -------------------------------
     LOAD ALL PORTION TYPES
  -------------------------------- */
  useEffect(() => {
    loadPortionTypes();
  }, []);

  const loadPortionTypes = async () => {
    try {
      const res = await apiClient.get("/portion-types");
      setPortionTypes(res.data || []);

      if (res.data?.length) {
        const first = res.data[0];
        setActiveType(first);
        setUnits(first.units || [{ ...EMPTY_UNIT }]);
        setPricingRule(first.pricingRule || "percentage");
      }
    } catch {
      toast.error("Failed to load portion types");
    }
  };

  /* -------------------------------
     SELECT EXISTING PORTION TYPE
  -------------------------------- */
  const handleSelectType = (selected) => {
    if (!selected) return;

    const found = portionTypes.find(
      (p) => p.type === selected.value
    );

    if (found) {
      setActiveType(found);
      setUnits(found.units || [{ ...EMPTY_UNIT }]);
      setPricingRule(found.pricingRule || "percentage");
    }
  };

  /* -------------------------------
     CREATE NEW PORTION TYPE
  -------------------------------- */
  const handleCreateType = (inputValue) => {
    const value = inputValue.toLowerCase().replace(/\s+/g, "_");

    if (portionTypes.some((p) => p.type === value)) {
      return toast.error("Portion type already exists");
    }

    const newType = {
      _id: null,
      type: value,
      pricingRule: "percentage", // admin will choose
      units: [{ ...EMPTY_UNIT }],
    };

    setPortionTypes((prev) => [...prev, newType]);
    setActiveType(newType);
    setUnits([{ ...EMPTY_UNIT }]);
    setPricingRule("percentage");

    toast.success(`"${inputValue}" added`);
  };

  /* -------------------------------
     UNIT HANDLERS
  -------------------------------- */
  const handleUnitChange = (index, field, value) => {
    const updated = [...units];
    updated[index][field] = value;
    setUnits(updated);
  };

  const addUnit = () => {
    setUnits([...units, { ...EMPTY_UNIT }]);
  };

  const removeUnit = (index) => {
    if (units.length === 1) return;
    setUnits(units.filter((_, i) => i !== index));
  };

  /* -------------------------------
     SAVE CURRENT PORTION TYPE
  -------------------------------- */
  const saveCurrentType = async () => {
    if (!activeType) return;

    if (units.some((u) => !u.name || !u.value)) {
      return toast.error("All unit fields are required");
    }

    const payload = {
      type: activeType.type,
      pricingRule,
      units: units.map((u) => ({
        name: u.name.trim(),
        value: Number(u.value),
      })),
    };

    try {
      setLoading(true);
      await apiClient.post("/portion-types", payload);
      toast.success(`${activeType.type} saved`);
      loadPortionTypes();
    } catch {
      toast.error("Failed to save portion type");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------
     UI
  -------------------------------- */
  return (
  <div className="space-y-5">

    {/* MOBILE + DESKTOP LAYOUT */}
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">

      {/* LEFT PANEL */}
      <div
        className="
          bg-white border border-slate-200
          rounded-2xl shadow-sm
          p-5
        "
      >

        {/* HEADER */}
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-gray-800">
            Portion Types
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Create and manage portion variations
          </p>
        </div>

        {/* SELECT */}
        <CreatableSelect
          options={portionTypes.map((p) => ({
            value: p.type,
            label: p.type,
          }))}
          value={
            activeType
              ? {
                  value: activeType.type,
                  label: activeType.type,
                }
              : null
          }
          onChange={handleSelectType}
          onCreateOption={handleCreateType}
          placeholder="Select or create type"
          className="mb-5"
        />

        {/* LIST */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">

          {portionTypes.map((pt) => (
            <div
              key={pt.type}
              onClick={() => {
                setActiveType(pt);
                setUnits(pt.units || [{ ...EMPTY_UNIT }]);
                setPricingRule(
                  pt.pricingRule || "percentage"
                );
              }}
              className={`
                cursor-pointer rounded-xl
                px-4 py-3 capitalize
                transition border

                ${
                  activeType?.type === pt.type
                    ? "bg-primaryLight border-primary text-primary"
                    : "border-slate-200 hover:bg-slate-50"
                }
              `}
            >
              <div className="font-medium">
                {pt.type.replaceAll("_", " ")}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                {pt.units?.length || 0} units
              </div>
            </div>
          ))}

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div
        className="
          bg-white border border-slate-200
          rounded-2xl shadow-sm
          p-5 sm:p-6
        "
      >

        {activeType ? (
          <>

            {/* HEADER */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold capitalize text-gray-800">
                {activeType.type.replaceAll("_", " ")}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Configure pricing rule and units
              </p>
            </div>

            {/* PRICING RULE */}
            <div className="mb-6">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pricing Rule
              </label>

              <select
                value={pricingRule}
                onChange={(e) =>
                  setPricingRule(e.target.value)
                }
                className="
                  w-full sm:w-72
                  border border-slate-300
                  rounded-xl px-4 py-3
                  outline-none focus:ring-2
                  focus:ring-primaryLight
                "
              >
                <option value="percentage">
                  Percentage (%)
                </option>

                <option value="per_unit">
                  Per Unit Price (₹)
                </option>
              </select>

            </div>

            {/* UNITS */}
            <div className="space-y-4">

              {units.map((u, i) => (
                <div
                  key={i}
                  className="
                    border border-slate-200
                    rounded-xl p-4
                    bg-slate-50
                  "
                >

                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_160px_auto] gap-3">

                    {/* UNIT NAME */}
                    <input
                      className="
                        border border-slate-300
                        rounded-xl px-4 py-3
                        outline-none focus:ring-2
                        focus:ring-primaryLight
                      "
                      placeholder="Unit name (Half / Full)"
                      value={u.name}
                      onChange={(e) =>
                        handleUnitChange(
                          i,
                          "name",
                          e.target.value
                        )
                      }
                    />

                    {/* VALUE */}
                    <input
                      className="
                        border border-slate-300
                        rounded-xl px-4 py-3
                        outline-none focus:ring-2
                        focus:ring-primaryLight
                      "
                      placeholder={
                        pricingRule === "per_unit"
                          ? "Price ₹"
                          : "Percentage %"
                      }
                      value={u.value}
                      onChange={(e) =>
                        handleUnitChange(
                          i,
                          "value",
                          e.target.value
                        )
                      }
                    />

                    {/* DELETE */}
                    <button
                      onClick={() => removeUnit(i)}
                      className="
                        h-12 w-12 rounded-xl
                        bg-red-50 text-red-600
                        hover:bg-red-100
                        transition
                        flex items-center justify-center
                      "
                    >
                      ✕
                    </button>

                  </div>

                </div>
              ))}

            </div>

            {/* ACTIONS */}
            <div
              className="
                mt-6 flex flex-col sm:flex-row
                gap-3 sm:justify-between
              "
            >

              <button
                onClick={addUnit}
                className="
                  px-5 py-3 rounded-xl
                  border border-primary
                  text-primary
                  hover:bg-primaryLight
                  transition
                "
              >
                + Add Unit
              </button>

              <button
                onClick={saveCurrentType}
                disabled={loading}
                className="
                  px-6 py-3 rounded-xl
                  bg-primary hover:bg-primaryDark
                  text-white transition
                  shadow-sm
                "
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>

            </div>

          </>
        ) : (

          <div className="text-center py-20 text-gray-500">
            Select or create a portion type
          </div>

        )}

      </div>

    </div>

  </div>
);
};

export default PortionType;
