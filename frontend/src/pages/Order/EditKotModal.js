import { useState } from "react";
import apiClient from "../../apiclient/apiclient";
import { Plus, Minus, Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const EditKotModal = ({ kot, orderId, close, reload }) => {

  const [items, setItems] = useState(kot.items);

  const changeQty = (index, diff) => {
    setItems(prev =>
      prev.map((i, idx) =>
        idx === index
          ? { ...i, qty: Math.max(0, i.qty + diff) }
          : i
      )
    );
  };

  const removeItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const saveKot = async () => {
    try {
      await apiClient.patch(
        `/orders/${orderId}/kot/${kot.kotNo}/edit`,
        { items }
      );

      toast.success("KOT updated");
      reload();
      close();
    } catch (err) {
      toast.error("Failed to update KOT");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-96 p-4">

        <h2 className="font-semibold mb-4">
          Edit KOT #{kot.kotNo}
        </h2>

        <div className="space-y-3 max-h-60 overflow-y-auto">

          {items.map((item, index) => (
            <div
              key={index}
              className="flex justify-between items-center"
            >

              <div>
                {item.name}
                <div className="text-xs text-gray-500">
                  {item.variant}
                </div>
              </div>

              <div className="flex items-center gap-2">

                <Minus
                  size={16}
                  onClick={() => changeQty(index, -1)}
                  className="cursor-pointer"
                />

                <span>{item.qty}</span>

                <Plus
                  size={16}
                  onClick={() => changeQty(index, 1)}
                  className="cursor-pointer"
                />

                <Trash2
                  size={16}
                  onClick={() => removeItem(index)}
                  className="text-red-500 cursor-pointer"
                />

              </div>

            </div>
          ))}

        </div>

        <div className="flex gap-2 mt-4">

          <button
            onClick={saveKot}
            className="flex-1 bg-primary text-white py-2 rounded"
          >
            Save
          </button>

          <button
            onClick={close}
            className="flex-1 bg-gray-200 py-2 rounded"
          >
            Cancel
          </button>

        </div>

      </div>

    </div>
  );
};

export default EditKotModal;