import apiClient from "../../apiclient/apiclient";
import { toast } from "react-toastify";
import { Edit2, Trash2 } from "lucide-react";

/* STATUS BADGE COLORS */
const STATUS_BADGE = {
  pending: "bg-red-100 text-red-700",
  preparing: "bg-yellow-100 text-yellow-700",
  ready: "bg-green-100 text-green-700",
  served: "bg-blue-100 text-blue-700",
};

const KotHistory = ({ order, reload, onEdit, onCancel }) => {
  const markKotServed = async (kotNo) => {
    try {
      await apiClient.patch(
        `/orders/${order._id}/kot/${kotNo}/status`,
        { status: "served" }
      );
      toast.success(`KOT ${kotNo} marked as Served`);
      reload();
    } catch (err) {
      toast.error("Failed to mark KOT served");
    }
  };

  const cancelKot = async (kot) => {
    if (onCancel) return onCancel(kot);
    if (!window.confirm(`Cancel KOT #${kot.kotNo}?`)) return;
    try {
      await apiClient.patch(
        `/orders/${order._id}/kot/${kot.kotNo}/status`,
        { status: "cancelled" }
      );
      toast.success(`KOT ${kot.kotNo} cancelled`);
      reload();
    } catch (err) {
      toast.error("Failed to cancel KOT");
    }
  };

  return (
    <div className="mt-4 border-t pt-3">
      <h3 className="font-semibold text-sm mb-3">KOT History</h3>

      {/* Scrollable list so the screen doesn't scroll */}
      <div className="max-h-56 overflow-y-auto space-y-3 pr-2">
        {order.kots.map((kot) => (
          <div
            key={kot.kotNo}
            className="mb-0 rounded-lg border bg-gray-50 p-3"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-sm">KOT #{kot.kotNo}</span>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${STATUS_BADGE[kot.status]}`}
                >
                  {kot.status.toUpperCase()}
                </span>

                {/* Edit / Cancel shown only when handlers passed and KOT editable */}
                {(onEdit || onCancel) &&
                  (kot.status === "pending" || kot.status === "preparing") && (
                    <>
                      {onEdit && (
                        <button
                          title="Edit KOT"
                          onClick={() => onEdit(kot)}
                          className="ml-2 p-1 rounded hover:bg-gray-100"
                          aria-label="Edit KOT"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}

                      <button
                        title="Cancel KOT"
                        onClick={() => cancelKot(kot)}
                        className="ml-1 p-1 rounded hover:bg-gray-100"
                        aria-label="Cancel KOT"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
              </div>
            </div>

            {/* ITEMS */}
            <ul className="space-y-1 text-sm">
              {kot.items.map((item, idx) => (
                <li
                  key={idx}
                  className="flex justify-between items-center"
                >
                  <span>
    {item.name}
    {item.variant && (
      <span className="text-gray-500 text-xs ml-1">
        ({item.variant})
      </span>
    )}{" "}
    × {item.qty}
  </span>

                  {item.status === "prepared" && (
                    <span className="text-xs text-green-600 font-medium">
                      Prepared
                    </span>
                  )}
                </li>
              ))}
            </ul>

            {/* ADMIN ACTION */}
            {kot.status === "ready" && (
              <button
                onClick={() => markKotServed(kot.kotNo)}
                className="mt-3 w-full py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                Mark as Served
              </button>
            )}

            {kot.status === "served" && (
              <p className="mt-3 text-center text-sm font-semibold text-blue-700">
                ✔ Served
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KotHistory;
