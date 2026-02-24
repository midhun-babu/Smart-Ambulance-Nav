const API = import.meta.env.VITE_API_URL;

export const fetchRoute = async (data) => {
  const response = await fetch(`${API}/route`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  return response.json();
};