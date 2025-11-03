// script.js

const form = document.querySelector("#shorten-form");
const resultContainer = document.querySelector("#result-container");
const shortLink = document.querySelector("#shortened-link");
const copyBtn = document.querySelector("#copy-btn");
const errorMessage = document.querySelector("#error-message");
const tableBody = document.querySelector("#url-list-body");

let urlCount = 0;
// Use window.location.origin to dynamically get the deployed domain (e.g., https://your-app.onrender.com)
const baseRedirectUrl = window.location.origin;
const existingUrls = new Set(); // Track original URLs

/**
 * Adds a new row to the shortened URLs table.
 */
function addUrlToTable(originalUrl, shortCode, clicks, createdAt) {
  if (existingUrls.has(originalUrl)) return;

  existingUrls.add(originalUrl);
  const placeholderRow = tableBody.querySelector("td[colspan='5']");
  if (placeholderRow) placeholderRow.parentElement.remove();

  // Construct the full, clickable URL for the link's destination
  const fullShortUrl = `${baseRedirectUrl}/${shortCode}`;

  urlCount++;
  const row = document.createElement("tr");
  row.innerHTML = `
      <th scope="row">${urlCount}</th>
      <td><a href="${originalUrl}" target="_blank">${originalUrl}</a></td>
      <td><a href="${fullShortUrl}" target="_blank" class="short-url-link" data-code="${shortCode}">${shortCode}</a></td>
      <td>${clicks}</td>
      <td>${createdAt}</td>
    `;
  tableBody.appendChild(row);
}

// ----------------------------------------------------------------------
// FORM SUBMISSION HANDLER
// ----------------------------------------------------------------------
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalUrl = document.querySelector(".form-control").value.trim();
  if (!originalUrl) return;

  errorMessage.classList.add("d-none");

  try {
    const response = await fetch("/api/v1/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to shorten URL.");
    }

    const data = await response.json();
    const shortCode = data.data.shortUrl;
    const clicks = data.data.clicks || 0;
    const createdAt = data.data.createdAt;

    // Construct the full, absolute URL for external use
    const fullShortUrl = `${baseRedirectUrl}/${shortCode}`;

    // Update the result display
    shortLink.href = fullShortUrl;
    shortLink.classList.add("short-url-link");
    shortLink.setAttribute("data-code", shortCode);

    // 👇 Display only the shortCode
    shortLink.textContent = shortCode;

    resultContainer.classList.remove("d-none");

    // 👇 Copy button copies the FULL URL
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fullShortUrl).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      });
    };

    if (existingUrls.has(originalUrl)) {
      alert("This link has already been shortened. Check the table below.");
    } else {
      addUrlToTable(originalUrl, shortCode, clicks, createdAt);
    }
  } catch (error) {
    console.error("Failed to create short URL", error);
    errorMessage.textContent =
      error.message || "An error occurred while creating the short URL.";
    errorMessage.classList.remove("d-none");
  }
});

// ----------------------------------------------------------------------
// GLOBAL CLICK HANDLER (We remove the redundant fetch/redirect logic here)
// ----------------------------------------------------------------------
document.addEventListener("click", async (e) => {
  const link = e.target.closest(".short-url-link");
  if (!link) return;

  // We let the browser handle the redirect since the link's 'href' is the full URL.
  // This action hits the backend route `/:shortUrl`, which handles the click count and redirect.

  // We only prevent default behavior if the link still uses '#' (not the case here).
  // The previous fetch logic is now redundant/obsolete for simple redirection.
});

// ----------------------------------------------------------------------
// TABLE REFRESH LOGIC
// ----------------------------------------------------------------------
async function refreshTable() {
  try {
    const response = await fetch("/api/v1/urls/all");
    if (!response.ok) throw new Error("Failed to fetch history.");

    const data = await response.json();

    if (!data || !data.data) return;

    tableBody.innerHTML = "";
    urlCount = 0;
    existingUrls.clear();

    data.data.forEach((url) => {
      // Note: The backend response uses 'shortUrl', which is the short code.
      addUrlToTable(url.originalUrl, url.shortUrl, url.clicks, url.dateCreated);
    });

    // Handle placeholder display
    if (urlCount === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="5" class="text-center text-muted">No URLs yet. Shorten one above!</td>`;
      tableBody.appendChild(row);
    }
  } catch (err) {
    console.error("Failed to refresh table:", err);
  }
}

// Initial load and periodic refresh
refreshTable();
setInterval(refreshTable, 5000);
