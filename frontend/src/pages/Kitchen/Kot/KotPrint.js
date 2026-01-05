const KotPrint = ({ kot, order }) => {
  const created = new Date(kot.createdAt || Date.now());
  const dateStr = created.toLocaleDateString();
  const timeStr = created.toLocaleTimeString();

  // Prefer populated area.name if available
  const area =
    order?.tableId?.area?.name ||
    order?.area?.name ||
    order?.tableId?.areaName ||
    order?.tableId?.zone ||
    "";

  // Restaurant name comes from env or fallback
  const restaurantName = process.env.REACT_APP_RESTAURANT_NAME || "RESTAURANT";

  return (
    <div style={{ width: "280px", fontFamily: "monospace", padding: 8 }}>
      {/* date/time top-left */}
      <div style={{ fontSize: 12, marginBottom: 6 }}>{`${dateStr}  ${timeStr}`}</div>

      {/* Restaurant name */}
      <div style={{ textAlign: "center", fontWeight: "bold", marginBottom: 4 }}>{restaurantName}</div>

      <h3 style={{ textAlign: "center", margin: "6px 0" }}>KITCHEN ORDER TICKET</h3>
      <hr />
      {area && <p>Area: {area}</p>}
      <p>Table: {order.tableId.tableNumber}</p>
      
      <p>Order: #ORD{String(order._id).slice(-4).toUpperCase()}</p>
      <p>KOT No: {kot.kotNo}</p>
      <p>Time: {timeStr}</p>

      <hr />

      {kot.items.map((i, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
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
