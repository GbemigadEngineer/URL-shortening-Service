const form = document.querySelector("#shorten-form");
const resultContainer = document.querySelector("#result-container");
const shortLink = document.querySelector("#shortened-link");
const copyBtn = document.querySelector("#copy-btn");
const errorMessage = document.querySelector("#error-message");
const tableBody = document.querySelector("#url-list-body");

let urlCount = 0;
const baseRedirectUrl = "http://127.0.0.1:3000/";
const existingUrls = new Set(); // Track original URLs

function addUrlToTable(originalUrl, shortUrl, clicks, createdAt) {
  if (existingUrls.has(originalUrl)) return; // Prevent duplicates

  existingUrls.add(originalUrl);
  const placeholderRow = tableBody.querySelector("td[colspan='5']");
  if (placeholderRow) placeholderRow.parentElement.remove();

  urlCount++;
  const row = document.createElement("tr");
  row.innerHTML = `
    <th scope="row">${urlCount}</th>
    <td><a href="${originalUrl}" target="_blank">${originalUrl}</a></td>
    <td><a href="#" class="short-url-link" data-code="${shortUrl}">${shortUrl}</a></td>
    <td>${clicks}</td>
    <td>${createdAt}</td>
  `;
  tableBody.appendChild(row);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const originalUrl = document.querySelector(".form-control").value.trim();
  if (!originalUrl) return;

  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/urls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ originalUrl }),
    });

    const data = await response.json();
    const shortUrl = data.data.shortUrl;
    const clicks = data.data.clicks || 0;
    const createdAt = data.data.createdAt;

    shortLink.href = "#";
    shortLink.classList.add("short-url-link");
    shortLink.setAttribute("data-code", shortUrl);
    shortLink.textContent = shortUrl;
    resultContainer.classList.remove("d-none");

    copyBtn.onclick = () => {
      navigator.clipboard.writeText(`${shortUrl}`).then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 2000);
      });
    };

    if (existingUrls.has(originalUrl)) {
      alert("This link has already been shortened. Check the table below.");
    } else {
      addUrlToTable(originalUrl, shortUrl, clicks, createdAt);
    }
  } catch (error) {
    console.error("Failed to create short URL", error);
    errorMessage.textContent =
      error.message || "An error occurred while creating the short URL.";
    errorMessage.classList.remove("d-none");
  }
});

// Global click handler for short links
document.addEventListener("click", async (e) => {
  const link = e.target.closest(".short-url-link");
  if (!link) return;

  e.preventDefault();
  const shortCode = link.getAttribute("data-code");
  if (!shortCode) return;

  try {
    const response = await fetch(
      `http://127.0.0.1:3000/api/v1/urls/lookup/${shortCode}`
    );
    if (!response.ok) throw new Error("Short URL not found");

    const data = await response.json();
    const originalUrl = data.data.originalUrl;
    const updatedClicks = data.data.clicks;
    // ✅ Update click count in the table
    const row = link.closest("tr");
    if (row) {
      const clicksCell = row.querySelector("td:nth-child(4)");
      if (clicksCell) clicksCell.textContent = updatedClicks;
    }

    window.open(originalUrl, "_blank"); // ✅ Open in new tab
  } catch (err) {
    alert("Failed to redirect: " + err.message);
  }
});

async function refreshTable() {
  try {
    const response = await fetch("http://127.0.0.1:3000/api/v1/urls/all");
    const data = await response.json();

    if (!data || !data.data) return;

    tableBody.innerHTML = "";
    urlCount = 0;
    existingUrls.clear();

    data.data.forEach((url) => {
      addUrlToTable(url.originalUrl, url.shortUrl, url.clicks, url.dateCreated);
    });
  } catch (err) {
    console.error("Failed to refresh table:", err);
  }
}

setInterval(refreshTable, 5000); // Refresh every 10 seconds