import React, { useEffect, useState } from "react";
import apiClient from "../../apiclient/apiclient";

const PlatformDashboard = () => {
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await apiClient.get("/restaurants");
        if (Array.isArray(response.data.restaurants)) {
          setRestaurants(response.data.restaurants);
        } else {
          console.error("Unexpected response format:", response.data);
          setRestaurants([]); // Fallback to an empty array
        }
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setRestaurants([]); // Fallback to an empty array
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Platform Dashboard</h1>

      <p className="mt-4 text-gray-600">
        Manage restaurants, subscriptions and system.
      </p>

      <table className="table-auto w-full mt-6 border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border border-gray-300 px-4 py-2">Name</th>
            <th className="border border-gray-300 px-4 py-2">Phone</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => (
            <tr key={restaurant._id}>
              <td className="border border-gray-300 px-4 py-2">{restaurant.name}</td>
              <td className="border border-gray-300 px-4 py-2">{restaurant.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PlatformDashboard;