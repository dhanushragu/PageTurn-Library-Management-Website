// Shared small frontend interactions for PageTurn.
// This project does not send form data to a server or save personal information.

document.addEventListener("DOMContentLoaded", () => {
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");

  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
      menuButton.innerHTML = isOpen ? "&times;" : "&#9776;";
    });
  }

  // Book catalogue search and filters
  const bookGrid = document.getElementById("bookGrid");
  const searchInput = document.getElementById("bookSearch");
  const categoryFilter = document.getElementById("categoryFilter");
  const availabilityFilter = document.getElementById("availabilityFilter");
  const filterForm = document.getElementById("bookFilters");

  if (bookGrid && searchInput && categoryFilter && availabilityFilter) {
    const cards = Array.from(bookGrid.querySelectorAll(".book-card"));
    const count = document.getElementById("resultsCount");
    const empty = document.getElementById("emptyState");

    const applyFilters = () => {
      const query = searchInput.value.trim().toLowerCase();
      const category = categoryFilter.value.trim().toLowerCase();
      const availability = availabilityFilter.value;
      let visible = 0;

      cards.forEach(card => {
        const title = card.dataset.title || "";
        const author = card.dataset.author || "";
        const cardCategory = card.dataset.category || "";
        const textMatches = title.includes(query) || author.includes(query);
        const categoryMatches = !category || cardCategory === category;
        const status = card.querySelector(".status");
        const isAvailable = status && status.classList.contains("available");
        const availabilityMatches = !availability ||
          (availability === "available" && isAvailable) ||
          (availability === "unavailable" && !isAvailable);

        const show = textMatches && categoryMatches && availabilityMatches;
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });

      if (count) count.textContent = `Showing ${visible} of ${cards.length} sample books`;
      if (empty) empty.style.display = visible ? "none" : "block";
    };

    searchInput.addEventListener("input", applyFilters);
    categoryFilter.addEventListener("change", applyFilters);
    availabilityFilter.addEventListener("change", applyFilters);

    if (filterForm) {
      filterForm.addEventListener("reset", () => setTimeout(applyFilters, 0));
    }

    // Read filters from URLs such as books.html?category=fiction&search=harper
    const params = new URLSearchParams(window.location.search);
    if (params.has("search")) searchInput.value = params.get("search") || "";
    if (params.has("category")) {
      const wanted = (params.get("category") || "").toLowerCase().replaceAll("-", " ");
      Array.from(categoryFilter.options).forEach(option => {
        if (option.value.toLowerCase() === wanted || option.text.toLowerCase() === wanted) {
          categoryFilter.value = option.value;
        }
      });
    }
    applyFilters();
  }

  // Demo form confirmation; browser required-field validation still applies.
  document.querySelectorAll(".demo-form").forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();

      if (form.id === "registerForm") {
        const password = form.querySelector("#registerPassword");
        const confirm = form.querySelector("#confirmPassword");
        const message = form.querySelector("#registerMessage");

        if (password && confirm && password.value !== confirm.value) {
          confirm.setCustomValidity("Passwords do not match.");
          confirm.reportValidity();
          confirm.setCustomValidity("");
          return;
        }

        if (message) {
          message.textContent = "Frontend demo only: the form passed validation, but no account was created and no data was saved.";
          message.style.display = "block";
        }
        return;
      }

      const message = form.querySelector(".form-message");
      if (message) message.style.display = "block";
    });
  });

  // Book details page: use the book number in ?book=1, ?book=2, etc.
  const detailTitle = document.getElementById("detailTitle");
  if (detailTitle) {
    const catalogue = [
      {title:"To Kill a Mockingbird",author:"Harper Lee",category:"Fiction",rating:"4.8",available:true,id:"PT-001",description:"A celebrated novel exploring justice, empathy, childhood, and the complexities of a community."},
      {title:"The C Programming Language",author:"Brian W. Kernighan",category:"Technology",rating:"4.7",available:true,id:"PT-002",description:"A classic programming reference that introduces the C language and core programming concepts."},
      {title:"The Great Gatsby",author:"F. Scott Fitzgerald",category:"Fiction",rating:"4.6",available:false,id:"PT-003",description:"A classic American novel about ambition, identity, wealth, and the pursuit of an elusive dream."},
      {title:"Harry Potter and the Philosopher's Stone",author:"J. K. Rowling",category:"Fiction",rating:"4.9",available:true,id:"PT-004",description:"A young reader discovers a magical world, new friendships, and the beginning of an extraordinary adventure."},
      {title:"Atomic Habits",author:"James Clear",category:"Self-Development",rating:"4.8",available:true,id:"PT-005",description:"A practical guide to understanding how small routines can support meaningful long-term change."},
      {title:"A Brief History of Time",author:"Stephen Hawking",category:"Science",rating:"4.7",available:true,id:"PT-006",description:"An introduction to major questions about the universe, time, space, and modern cosmology."},
      {title:"The Lean Startup",author:"Eric Ries",category:"Business",rating:"4.5",available:true,id:"PT-007",description:"A business book about experimentation, learning from customers, and developing products efficiently."},
      {title:"Sapiens",author:"Yuval Noah Harari",category:"History",rating:"4.8",available:false,id:"PT-008",description:"A broad account of human history and the social, cultural, and biological changes that shaped societies."}
    ];
    const params = new URLSearchParams(window.location.search);
    const selected = Math.min(Math.max(parseInt(params.get("book") || "1", 10) || 1, 1), catalogue.length) - 1;
    const book = catalogue[selected];

    document.title = `${book.title} | PageTurn Library`;
    detailTitle.textContent = book.title;
    document.getElementById("detailAuthor").textContent = `By ${book.author}`;
    document.getElementById("detailCategory").textContent = book.category.toUpperCase();
    document.getElementById("detailCategoryValue").textContent = book.category;
    document.getElementById("detailRating").textContent = `★ ${book.rating} reader rating`;
    document.getElementById("detailDescription").textContent = book.description;
    document.getElementById("detailAvailability").textContent = book.available ? "Available" : "Unavailable";
    document.getElementById("detailAvailability").style.color = book.available ? "#267249" : "#b94b4b";
    document.getElementById("detailId").textContent = book.id;
    document.getElementById("detailCoverTitle").textContent = book.title.toUpperCase();
    document.getElementById("detailCoverAuthor").textContent = book.author.toUpperCase();

    const reserveButton = document.getElementById("reserveButton");
    const reserveMessage = document.getElementById("reserveMessage");
    if (!book.available) {
      reserveButton.textContent = "Currently Unavailable";
      reserveButton.disabled = true;
      reserveButton.style.opacity = ".55";
      reserveButton.style.cursor = "not-allowed";
    } else {
      reserveButton.addEventListener("click", () => {
        reserveMessage.style.display = "block";
      });
    }
  }
});
