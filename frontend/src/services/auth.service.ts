export const checkAuth = async () => {
  try {
    const response = await fetch(
      "http://localhost:8001/api/auth/current-user",
      {
        method: "GET",
        credentials: "include",
      }
    );

    console.log("Raw response:", response);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("checkAuth response:", data.data);

    return data.data || null;
  } catch (error) {
    console.error("Error checking authentication:", error);
    return null;
  }
};
