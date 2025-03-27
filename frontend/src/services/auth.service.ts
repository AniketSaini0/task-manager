export const checkAuth = async () => {
  try {
    const response = await fetch(
      "http://localhost:8000/api/auth/current-user",
      {
        method: "GET",
        credentials: "include",
      }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Error checking authentication:", error);
    return null;
  }
};
