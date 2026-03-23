const KotPrint = ({ kot, order }) => {

  const created = new Date(kot?.createdAt || Date.now());
  const dateStr = created.toLocaleDateString();
  const timeStr = created.toLocaleTimeString();

  const isCounter = order?.orderType === "counter";
  const isCar = order?.orderType === "carobar";
  const isDine = order?.orderType === "dine_in";

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
        {isCounter && "COUNTER / TAKEAWAY"}
        {isDine && "DINE IN"}
        {isCar && "CAR-O-BAR"}
      </p>

      {/* AREA (ONLY FOR TABLE) */}
      {isDine && area && (
        <p>
          <strong>Area:</strong> {area}
        </p>
      )}

      {/* TABLE / CAR / COUNTER */}
      <p>
        {isCounter && "Counter Order"}

        {isDine && `Table: ${order?.tableId?.tableNumber || "-"}`}

        {isCar && `Car: ${order?.carNo || "-"}`}
      </p>

      {/* ORDER NUMBER */}
      <p>
        Order No:{" "}
        {order?.orderNumber ||
          order?._id?.slice(-6)?.toUpperCase() ||
          "-"}
      </p>

      {/* KOT NUMBER */}
      <p>KOT No: {kot?.kotNo}</p>

      <hr />

      {/* ITEMS */}
      {kot?.items?.map((i, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>
            {i.name}
            {i.variant ? ` (${i.variant})` : ""}
          </span>
          <span>x{i.qty}</span>
        </div>
      ))}

      <hr />

      <p style={{ textAlign: "center" }}>
        --- END ---
      </p>

    </div>
  );
};

export default KotPrint;