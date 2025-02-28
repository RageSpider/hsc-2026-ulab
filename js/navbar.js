document.addEventListener("DOMContentLoaded", () => {
  // Enhanced search data structure with alt text mapping
  const searchData = [
    {
      title: "Academic Calendar",
      url: "/academic/academic.html",
      category: "Academic",
      description: "View academic schedule and important dates",
      altTexts: [
        "academic schedule",
        "class routine",
        "exam dates",
        "semester calendar",
        "academic events",
        "important academic dates",
        "college calendar",
      ],
    },
    {
      title: "Upcoming Events",
      url: "/events/events.html",
      category: "Events",
      description: "Check upcoming college events and activities",
      altTexts: [
        "college events",
        "cultural programs",
        "sports events",
        "competitions",
        "seminars",
        "workshops",
        "college activities",
      ],
    },
    {
      title: "Admission Notice",
      url: "/notices/notices.html",
      category: "Notices",
      description: "Important announcements and notices",
      altTexts: [
        "announcements",
        "college notices",
        "important updates",
        "notifications",
        "circular",
        "bulletin",
        "news",
      ],
    },
    {
      title: "Course Materials",
      url: "/files/files.html",
      category: "Resources",
      description: "Access study materials and resources",
      altTexts: [
        "study materials",
        "lecture notes",
        "assignments",
        "syllabus",
        "reading materials",
        "worksheets",
        "practice papers",
      ],
    },
    {
      title: "Staff Directory",
      url: "/introduction/introduction.html",
      category: "Contact",
      description: "Find faculty and staff contact information",
      altTexts: [
        "teachers list",
        "faculty members",
        "staff contacts",
        "teacher information",
        "faculty directory",
        "department contacts",
        "teacher profiles",
      ],
    },
  ];

  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const menuToggle = document.getElementById("menu-toggle");
  let currentFocus = -1;

  // Initialize navigation highlighting
  initializeNavigation();

  // Event listeners
  searchInput.addEventListener("input", debounce(handleSearch, 150));
  searchInput.addEventListener("keydown", handleSearchNavigation);
  document.addEventListener("click", handleClickOutside);
  if (menuToggle) menuToggle.addEventListener("change", handleMobileMenu);

  // Core functions
  function handleSearch(e) {
    const query = e.target.value.trim().toLowerCase();

    if (query.length < 2) {
      hideSearchResults();
      return;
    }

    const results = searchData
      .filter((item) => {
        const titleMatch = item.title.toLowerCase().includes(query);
        const descMatch = item.description.toLowerCase().includes(query);
        const categoryMatch = item.category.toLowerCase().includes(query);
        const altMatch = item.altTexts.some((alt) =>
          alt.toLowerCase().includes(query)
        );
        return titleMatch || descMatch || categoryMatch || altMatch;
      })
      .sort((a, b) => {
        // Prioritize matches: title > altText > category > description
        const aTitle = a.title.toLowerCase().includes(query);
        const bTitle = b.title.toLowerCase().includes(query);
        const aAlt = a.altTexts.some((alt) =>
          alt.toLowerCase().includes(query)
        );
        const bAlt = b.altTexts.some((alt) =>
          alt.toLowerCase().includes(query)
        );

        if (aTitle !== bTitle) return aTitle ? -1 : 1;
        if (aAlt !== bAlt) return aAlt ? -1 : 1;
        return 0;
      });

    displaySearchResults(results, query);
  }

  function displaySearchResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = `
        <div class="no-results">
          <p>No results found for "${query}"</p>
          <p class="search-tip">Try using different keywords or check spelling</p>
        </div>
      `;
    } else {
      searchResults.innerHTML = results
        .map((item, index) => {
          // Find matching alt text if any
          const matchingAlt = item.altTexts.find((alt) =>
            alt.toLowerCase().includes(query.toLowerCase())
          );

          return `
            <div class="result-item" role="option" data-index="${index}">
              <a href="${item.url}" class="result-link">
                <div class="result-category">${item.category}</div>
                <div class="result-title">${highlightMatch(
                  item.title,
                  query
                )}</div>
                <div class="result-description">
                  ${highlightMatch(item.description, query)}
                </div>
                ${
                  matchingAlt
                    ? `
                  <div class="alt-match">
                    Related: ${highlightMatch(matchingAlt, query)}
                  </div>
                `
                    : ""
                }
              </a>
            </div>
          `;
        })
        .join("");
    }

    searchResults.style.display = "block";
  }

  function handleSearchNavigation(e) {
    const items = searchResults.getElementsByClassName("result-item");

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        currentFocus = Math.min(currentFocus + 1, items.length - 1);
        updateFocus(items);
        break;
      case "ArrowUp":
        e.preventDefault();
        currentFocus = Math.max(currentFocus - 1, -1);
        updateFocus(items);
        break;
      case "Enter":
        e.preventDefault();
        if (currentFocus > -1 && items[currentFocus]) {
          items[currentFocus].querySelector("a").click();
        }
        break;
      case "Escape":
        hideSearchResults();
        searchInput.blur();
        break;
    }
  }

  // Utility functions
  function initializeNavigation() {
    const currentPage =
      window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((link) => {
      if (link.getAttribute("href") === currentPage) {
        link.classList.add("active");
      }
    });
  }

  function handleClickOutside(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      hideSearchResults();
    }
  }

  function hideSearchResults() {
    searchResults.style.display = "none";
    currentFocus = -1;
  }

  function handleMobileMenu(e) {
    document.body.style.overflow = e.target.checked ? "hidden" : "";
  }

  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function updateFocus(items) {
    Array.from(items).forEach((item, index) => {
      if (index === currentFocus) {
        item.classList.add("focused");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("focused");
      }
    });
  }
});
