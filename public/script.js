const form = document.querySelector("#shorten-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalUrl = document.querySelector(".form-control").value;
  // Basic validation (optional, but good practice)
  if (!originalUrl) {
    console.error("URL input is empty.");
    return;
  }
  try {
    const response = await fetch(" http://127.0.0.1:3000/api/v1/urls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ originalUrl: originalUrl }),
    });
    // Check for non-200 status codes (e.g., 400, 500)
    if (!response.ok) {
      const errorData = await response.json(); // Try to parse error details
      throw new Error(
        `Server returned status ${response.status}: ${
          errorData.message || "Unknown Error"
        }`
      );
    }

    // 3. Extract the JSON body data
    const data = await response.json();

    console.log("Successfully created short URL:", data);

    // --- Next steps: Display the URL on the page (you'll add this next) ---
    // displayShortUrl(data.data.shortUrl);
  } catch (error) {
    console.log("failed to create short url", error);
  }
});
