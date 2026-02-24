import React, { useEffect, useState } from "react";
import apiClient from "../apiclient/apiclient";
import { Loader2 } from "lucide-react";

const ActivityLog = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get("notifications/activity");
      setLogs(res.data?.data || res.data || []);
    } catch (err) {
      console.error("Failed to load activity logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">Activity Log</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={18} />
          Loading activity...
        </div>
      ) : logs.length === 0 ? (
        <div className="text-gray-500">No activity found</div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-3">Time</th>
                <th className="p-3">Module</th>
                <th className="p-3">Action</th>
                <th className="p-3">Description</th>
                <th className="p-3">Performed By</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr key={log._id} className="border-t hover:bg-gray-50">
                  <td className="p-3 text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>

                  <td className="p-3 capitalize">
                    <span className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs">
                      {log.module}
                    </span>
                  </td>

                  <td className="p-3 font-medium">
                    {log.action}
                  </td>

                  <td className="p-3">
                    {log.description}
                  </td>

                  <td className="p-3 text-sm">
                    <div className="font-medium">
                      {log.performedBy?.name || "System"}
                    </div>
                    <div className="text-gray-400 text-xs">
                      {log.performedBy?.role}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
