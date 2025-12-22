const Order = require("../models/order.model")
const Table = require("../models/table.model")

exports.createOrder = async(req,res)=>{
    try{
       const { tableId, items } = req.body;
       if(!tableId || !items ||items.length === 0){
        return res.status(400).json({message: "Table and Items are required"});
       }
       const table =await Table.findById(tableId)
       if (!table) {
          return res.status(404).json({ message: "Table not found" });
       }
       if (table.status !== "free") {
           return res
            .status(400)
            .json({ message: "Table is already occupied" });
        }
        let subTotal = 0;

       const formattedItems = items.map((item) => {
         const total = item.price * item.qty;
           subTotal += total;

         return {
             ...item,
              total,
                 } ;
            });
         const order=await Order.create({
            tableId,
            items:formattedItems,
            subTotal,
            totalAmount: subTotal,
            status:"draft"

         })
         table.status = "occupied";
         table.currentOrderId = order._id;
         await table.save();
         res.status(201).json({
         message: "Order created successfully",
         order,
         });


    }
    catch (err) {
  console.error("CREATE ORDER ERROR:", err.response?.data || err.message);
  toast.error(err.response?.data?.message || "Failed to create order");
}

}


exports.updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Items are required" });
    }

    // 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Check order status
    if (["completed"].includes(order.status)) {
      return res
        .status(400)
        .json({ message: "Cannot update completed order" });
    }

    // 3️⃣ Recalculate totals
    let subTotal = 0;
    const formattedItems = items.map((item) => {
      const total = item.price * item.qty;
      subTotal += total;
      return { ...item, total };
    });

    // 4️⃣ Update order
    order.items = formattedItems;
    order.subTotal = subTotal;
    order.totalAmount = subTotal;

    await order.save();

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.sendToKitchen = async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Allow only draft orders
    if (order.status !== "draft") {
      return res.status(400).json({
        message: "Only draft orders can be sent to kitchen",
      });
    }

    // 3️⃣ Update status
    order.status = "sent_to_kitchen";
    await order.save();

    res.json({
      message: "Order sent to kitchen successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateKitchenStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // allowed kitchen statuses
    const allowedStatuses = ["preparing", "ready"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid kitchen status",
      });
    }

    // 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate transitions
    if (
      (order.status === "sent_to_kitchen" && status === "preparing") ||
      (order.status === "preparing" && status === "ready")
    ) {
      order.status = status;
      await order.save();

      return res.json({
        message: "Kitchen status updated",
        order,
      });
    }

    // ❌ Invalid transition
    return res.status(400).json({
      message: `Cannot change status from ${order.status} to ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.updateKitchenStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // allowed kitchen statuses
    const allowedStatuses = ["preparing", "ready"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid kitchen status",
      });
    }

    // 1️⃣ Find order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ Validate transitions
    if (
      (order.status === "sent_to_kitchen" && status === "preparing") ||
      (order.status === "preparing" && status === "ready")
    ) {
      order.status = status;
      await order.save();

      return res.json({
        message: "Kitchen status updated",
        order,
      });
    }

    // ❌ Invalid transition
    return res.status(400).json({
      message: `Cannot change status from ${order.status} to ${status}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    const order = await Order.findById(orderId)
      .populate({
        path: "tableId",
        select: "tableNumber capacity status",
      });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error("GET ORDER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};