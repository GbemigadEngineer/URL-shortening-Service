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

  // Construct the full, clickable URL
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

  // Clear previous error message
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

    // Construct the full, absolute URL
    const fullShortUrl = `${baseRedirectUrl}/${shortCode}`;

    // Update the result display
    shortLink.href = fullShortUrl;
    shortLink.classList.add("short-url-link");
    shortLink.setAttribute("data-code", shortCode);

    // 👇 CHANGE 2: Display only the shortCode (the clean look you want)
    shortLink.textContent = shortCode;

    resultContainer.classList.remove("d-none");

    copyBtn.onclick = () => {
      // ✅ FIX: Copy the full URL (which users can paste and redirect with)
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
// GLOBAL CLICK HANDLER (Retained for completeness, although table link now handles redirect)
// ----------------------------------------------------------------------
document.addEventListener("click", async (e) => {
  const link = e.target.closest(".short-url-link");
  if (!link) return;

  // Since the link now has the full URL as href, we only need to preventDefault
  // if we wanted to run the lookup logic first, which is often redundant.
  // We'll keep the logic as is, relying on the link's href for actual navigation,
  // and letting the browser handle the redirect via the server.

  // If the link has a standard href, just let the browser handle it.
  if (link.getAttribute("href") !== "#") return;

  e.preventDefault();
  const shortCode = link.getAttribute("data-code");
  if (!shortCode) return;

  try {
    const response = await fetch(`/api/v1/urls/lookup/${shortCode}`);
    if (!response.ok) throw new Error("Short URL not found");

    const data = await response.json();
    const originalUrl = data.data.originalUrl;
    const updatedClicks = data.data.clicks;

    // Update click count in the table
    const row = link.closest("tr");
    if (row) {
      const clicksCell = row.querySelector("td:nth-child(4)");
      if (clicksCell) clicksCell.textContent = updatedClicks;
    }

    window.open(originalUrl, "_blank");
  } catch (err) {
    alert("Failed to redirect: " + err.message);
  }
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
      // Backend response uses 'shortUrl', which is the short code.
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
