const BillPrint = ({ order, billMeta }) => {
  const area =
    order?.area?.name ||
    order?.tableId?.area?.name ||
    "";

  const customerName =
    order?.tableId?.customerId?.name ||
    order?.customer?.name ||
    "";

  const customerPhone =
    order?.tableId?.customerId?.phone ||
    order?.customer?.phone ||
    "";

  const restaurantName = "DICE RESTAURANT";

  const formatMoney = (value) => {
    const num = Number(value || 0);
    if (Number.isNaN(num)) return "0";
    return num % 1 === 0 ? String(num) : num.toFixed(2);
  };

  const isCredit = order.paymentType === "credit";

  return (
    <div style={{ width: "280px", fontFamily: "monospace", fontSize: "13px" }}>
      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "18px" }}>
        {restaurantName}
      </div>

      <div style={{ textAlign: "center", fontWeight: "bold", fontSize: "14px", marginTop: 4 }}>
        INVOICE
      </div>

      <hr />

      <div>Order No: #ORD{order._id.slice(-4).toUpperCase()}</div>
      {order.tableId && <div>Table: {order.tableId.tableNumber}</div>}
      {area && <div>Area: {area}</div>}

      {(customerName || customerPhone) && (
        <>
          <div>Customer: {customerName}</div>
          {customerPhone && <div>Mobile: {customerPhone}</div>}
        </>
      )}

      <div>
        Date: {new Date(order.createdAt).toLocaleDateString()}{" "}
        {new Date(order.createdAt).toLocaleTimeString()}
      </div>

      <hr />

      {/* ITEMS */}
      {order.items.map((item, idx) => (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
          <span>
            {item.name} ({item.variant}) × {item.qty}
          </span>
          <span>₹{formatMoney(item.price * item.qty)}</span>
        </div>
      ))}

      <hr />

      {/* SUMMARY */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span>Subtotal</span>
        <span>₹{formatMoney(order.subTotal)}</span>
      </div>

      {Number(order.tax || 0) > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>GST ({order.taxPercent}%)</span>
          <span>₹{formatMoney(order.tax)}</span>
        </div>
      )}

      {Number(order.discount || 0) > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span>Discount</span>
          <span>-₹{formatMoney(order.discount)}</span>
        </div>
      )}

      <hr />

      {/* TOTAL */}
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
        <span>TOTAL</span>
        <span>₹{formatMoney(order.totalAmount)}</span>
      </div>

      {/* 🔥 CREDIT SECTION */}
      {isCredit && billMeta && (
        <>
          <hr />
          <div style={{ fontWeight: "bold", textAlign: "center" }}>
            CREDIT SUMMARY
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Previous Due</span>
            <span>₹{formatMoney(billMeta.previousDue)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Current Due</span>
            <span>₹{formatMoney(billMeta.currentDue)}</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold" }}>
            <span>Total Due</span>
            <span>₹{formatMoney(billMeta.totalDue)}</span>
          </div>
        </>
      )}

      <hr />

      <div style={{ textAlign: "center" }}>
        Payment: {isCredit ? "CREDIT" : order.paymentMethod?.toUpperCase()}
      </div>

      <p style={{ textAlign: "center", marginTop: 8 }}>
        --- THANK YOU ---
      </p>
    </div>
  );
};

export default BillPrint;
