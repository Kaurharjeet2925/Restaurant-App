const KotPrint = ({ kot, order }) => {
  const created = new Date(kot?.createdAt || Date.now());
  const dateStr = created.toLocaleDateString();
  const timeStr = created.toLocaleTimeString();

  const isCounter = order?.orderType === "counter";

  // Prefer populated area.name if available
  const area =
    order?.tableId?.area?.name ||
    order?.area?.name ||
    order?.tableId?.areaName ||
    order?.tableId?.zone ||
    "";

  const restaurantName =
    process.env.REACT_APP_RESTAURANT_NAME || "RESTAURANT";

  return (
    <div style={{ width: "280px", fontFamily: "monospace", padding: 8 }}>
      {/* DATE / TIME */}
      <div style={{ fontSize: 12, marginBottom: 6 }}>
        {dateStr} &nbsp; {timeStr}
      </div>

      {/* RESTAURANT */}
      <div
        style={{
          textAlign: "center",
          fontWeight: "bold",
          marginBottom: 4,
        }}
      >
        {restaurantName}
      </div>

      <h3 style={{ textAlign: "center", margin: "6px 0" }}>
        KITCHEN ORDER TICKET
      </h3>

      <hr />

      {/* ORDER TYPE */}
      <p>
        <strong>Type:</strong>{" "}
        {isCounter ? "COUNTER / TAKEAWAY" : "DINE IN"}
      </p>

      {/* AREA (DINE-IN ONLY) */}
      {!isCounter && area && <p>Area: {area}</p>}

      {/* TABLE OR COUNTER */}
      <p>
        {isCounter
          ? "Counter Order"
          : `Table: ${order?.tableId?.tableNumber || "-"}`}
      </p>

      <p>
        Order: #
        ORD{String(order?._id || "").slice(-4).toUpperCase()}
      </p>

      <p>KOT No: {kot?.kotNo}</p>

      <hr />

      {/* ITEMS */}
      {kot?.items?.map((i, idx) => (
        <div
          key={idx}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>
            {i.name}
            {i.variant ? ` (${i.variant})` : ""}
          </span>
          <span>x{i.qty}</span>
        </div>
      ))}

      <hr />
      <p style={{ textAlign: "center" }}>--- END ---</p>
    </div>
  );
};

export default KotPrint;
