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
    <div className="flex gap-6">
      {/* LEFT SIDE */}
      <div className="w-1/3 bg-white border rounded-xl p-4">
        <h3 className="font-semibold mb-3">Portion Types</h3>

        <CreatableSelect
          options={portionTypes.map((p) => ({
            value: p.type,
            label: p.type,
          }))}
          value={
            activeType
              ? { value: activeType.type, label: activeType.type }
              : null
          }
          onChange={handleSelectType}
          onCreateOption={handleCreateType}
          placeholder="Select or add portion type"
          className="mb-4"
        />

        {portionTypes.map((pt) => (
          <div
            key={pt.type}
            onClick={() => {
              setActiveType(pt);
              setUnits(pt.units || [{ ...EMPTY_UNIT }]);
              setPricingRule(pt.pricingRule || "percentage");
            }}
            className={`cursor-pointer px-3 py-2 rounded-lg mb-2 capitalize ${
              activeType?.type === pt.type
                ? "bg-red-100 text-red-600"
                : "hover:bg-gray-100"
            }`}
          >
            {pt.type}
          </div>
        ))}
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 bg-white border rounded-xl p-6">
        {activeType ? (
          <>
            <h3 className="font-semibold mb-4 capitalize">
              Edit: {activeType.type}
            </h3>

            {/* PRICING RULE */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Pricing Rule
              </label>
              <select
                value={pricingRule}
                onChange={(e) => setPricingRule(e.target.value)}
                className="w-64 border rounded-lg px-3 py-2"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="per_unit">Per Unit Price (₹)</option>
              </select>
            </div>

            {/* UNITS */}
            {units.map((u, i) => (
              <div key={i} className="flex gap-3 mb-3">
                <input
                  className="flex-1 border rounded-lg px-3 py-2"
                  placeholder="Unit name (e.g. Half)"
                  value={u.name}
                  onChange={(e) =>
                    handleUnitChange(i, "name", e.target.value)
                  }
                />
                <input
                  className="w-32 border rounded-lg px-3 py-2"
                  placeholder={
                    pricingRule === "per_unit"
                      ? "Price ₹"
                      : "Percentage %"
                  }
                  value={u.value}
                  onChange={(e) =>
                    handleUnitChange(i, "value", e.target.value)
                  }
                />
                <button
                  onClick={() => removeUnit(i)}
                  className="text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}

            <button
              onClick={addUnit}
              className="text-sm text-blue-600 mt-2"
            >
              + Add Unit
            </button>

            <div className="mt-6 flex justify-end">
              <button
                onClick={saveCurrentType}
                disabled={loading}
                className="bg-black text-white px-6 py-2 rounded-lg"
              >
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">Select a portion type to edit</p>
        )}
      </div>
    </div>
  );
};

export default PortionType;
