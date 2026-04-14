
    const ideas = [
      {
        id: 1,
        title: "Sunrise Granny Square Cardigan",
        category: "wearables",
        difficulty: "Intermediate",
        time: "Weekend project",
        tag: "Granny squares · Colour play",
        imageText: "Warm sunrise gradient granny squares turned into a slouchy cardigan."
      },
      {
        id: 2,
        title: "Ocean Wave Throw Blanket",
        category: "home",
        difficulty: "Advanced beginner",
        time: "Slow & soothing",
        tag: "Ripple stitch · Ombre blues",
        imageText: "Soft ripple stitches in layered ocean blues and seafoam."
      },
      {
        id: 3,
        title: "Tiny Forest Amigurumi Set",
        category: "toys",
        difficulty: "Intermediate",
        time: "Bite-sized makes",
        tag: "Amigurumi · Nature",
        imageText: "Mini mushrooms, trees and woodland friends for a pocket forest."
      },
      {
        id: 4,
        title: "Cozy Mug Hug & Coaster Duo",
        category: "home",
        difficulty: "Beginner friendly",
        time: "One evening",
        tag: "Texture · Practical",
        imageText: "Chunky stitches wrapping your mug with a matching coaster."
      },
      {
        id: 5,
        title: "Pastel Cloud Bucket Hat",
        category: "wearables",
        difficulty: "Beginner",
        time: "Quick win",
        tag: "Bucket hat · Pastels",
        imageText: "Soft pastel stripes with fluffy cloud vibes."
      },
      {
        id: 6,
        title: "Starry Night Baby Mobile",
        category: "seasonal",
        difficulty: "Intermediate",
        time: "Mindful making",
        tag: "Stars · Moon · Dreamy",
        imageText: "Hanging stars and moons in deep navy and gold."
      },
      {
        id: 7,
        title: "Pumpkin Patch Table Runner",
        category: "seasonal",
        difficulty: "Advanced beginner",
        time: "Autumn project",
        tag: "Fall · Decor",
        imageText: "Row of pumpkins and leaves for a cozy autumn table."
      },
      {
        id: 8,
        title: "Soft Geometry Cushion Cover",
        category: "home",
        difficulty: "Intermediate",
        time: "Weekend project",
        tag: "Modern · Shapes",
        imageText: "Blocks of colour and simple shapes for a modern sofa moment."
      }
    ];

    const prompts = [
      { text: "Create a small project using only yarn you already own—no new skeins allowed.", mood: "Resourceful" },
      { text: "Pick one stitch you love and design a tiny project that shows it off.", mood: "Focused" },
      { text: "Choose three colours that feel like your favourite season and make a simple scarf.", mood: "Seasonal" },
      { text: "Crochet something just for you that nobody else has to see or approve.", mood: "Gentle" },
      { text: "Turn a favourite song into a colour story and stitch a bookmark from it.", mood: "Playful" },
      { text: "Make a tiny swatch gallery: five squares, five stitches, no pressure to finish.", mood: "Curious" }
    ];

    const palettes = [
      ["#ff8ba7", "#ffc6ff", "#ffe5ec", "#bde0fe"],
      ["#f4a261", "#e76f51", "#2a9d8f", "#264653"],
      ["#f6bd60", "#f7ede2", "#84a59d", "#f28482"],
      ["#9b5de5", "#f15bb5", "#fee440", "#00bbf9"],
      ["#e0fbfc", "#98c1d9", "#ee6c4d", "#293241"]
    ];

    const quotes = [
      { text: "Your pace is perfect for the maker you are today.", author: "Unknown" },
      { text: "Finished is optional. Enjoyed is essential.", author: "Unknown" },
      { text: "Every stitch is a tiny act of courage.", author: "Unknown" },
      { text: "You’re not behind. You’re exactly where your creativity needs you.", author: "Unknown" },
      { text: "Mistakes are just texture with a story.", author: "Unknown" }
    ];

    // --- STATE ---
    let activeCategory = "all";
    let searchTerm = "";
    let showFavoritesOnly = false;
    const favorites = new Set();

    // --- ELEMENTS ---
    const galleryEl = document.getElementById("gallery");
    const emptyStateEl = document.getElementById("emptyState");
    const categoryChipsEl = document.getElementById("categoryChips");
    const searchInputEl = document.getElementById("searchInput");
    const showFavoritesBtn = document.getElementById("showFavoritesBtn");
    const surpriseMeBtn = document.getElementById("surpriseMeBtn");
    const promptDisplayEl = document.getElementById("promptDisplay");
    const promptTagEl = document.getElementById("promptTag");
    const newPromptBtn = document.getElementById("newPromptBtn");
    const paletteEl = document.getElementById("palette");
    const quoteDisplayEl = document.getElementById("quoteDisplay");
    const newQuoteBtn = document.getElementById("newQuoteBtn");
    const boardListEl = document.getElementById("boardList");
    const boardHintEl = document.getElementById("boardHint");

    // --- RENDER FUNCTIONS ---
    function renderGallery() {
      galleryEl.innerHTML = "";
      const filtered = ideas.filter((idea) => {
        if (showFavoritesOnly && !favorites.has(idea.id)) return false;
        if (activeCategory !== "all" && idea.category !== activeCategory) return false;
        if (searchTerm) {
          const haystack = (idea.title + " " + idea.tag + " " + idea.imageText).toLowerCase();
          if (!haystack.includes(searchTerm.toLowerCase())) return false;
        }
        return true;
      });

      if (filtered.length === 0) {
        emptyStateEl.style.display = "block";
        return;
      } else {
        emptyStateEl.style.display = "none";
      }

      filtered.forEach((idea) => {
        const card = document.createElement("article");
        card.className = "card";
        card.dataset.id = idea.id;

        card.innerHTML = `
          <div class="card-tag">${idea.tag}</div>
          <div class="card-image">${idea.imageText}</div>
          <div class="card-title">${idea.title}</div>
          <div class="card-meta">
            <span>⭐ <strong>${idea.difficulty}</strong></span>
            <span>⏱ ${idea.time}</span>
            <button class="fav-btn ${favorites.has(idea.id) ? "active" : ""}" title="Toggle favourite">
              ${favorites.has(idea.id) ? "❤️" : "🤍"}
            </button>
          </div>
        `;

        const favBtn = card.querySelector(".fav-btn");
        favBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          toggleFavorite(idea.id);
        });

        card.addEventListener("click", () => {
          // When clicking the card, push a quick prompt based on it
          const prompt = `What if you made a "${idea.title}" in your favourite yarn and colours?`;
          promptDisplayEl.textContent = prompt;
          promptTagEl.textContent = "Mood: Inspired by your gallery";
        });

        galleryEl.appendChild(card);
      });
    }

    function renderPalette() {
      paletteEl.innerHTML = "";
      const palette = palettes[Math.floor(Math.random() * palettes.length)];
      palette.forEach((hex) => {
        const swatch = document.createElement("div");
        swatch.className = "swatch";
        swatch.style.background = hex;
        swatch.innerHTML = `<span>${hex}</span>`;
        swatch.addEventListener("click", () => {
          navigator.clipboard?.writeText(hex);
          promptTagEl.textContent = `Copied ${hex} to clipboard`;
        });
        paletteEl.appendChild(swatch);
      });
    }

    function renderQuote() {
      const q = quotes[Math.floor(Math.random() * quotes.length)];
      quoteDisplayEl.innerHTML = `
        “${q.text}”
        <small>— ${q.author}</small>
      `;
    }

    function renderBoard() {
      boardListEl.innerHTML = "";
      const favIdeas = ideas.filter((idea) => favorites.has(idea.id));
      if (favIdeas.length === 0) {
        boardHintEl.textContent = "Tip: tap the heart on any card to pin it here.";
        return;
      }
      boardHintEl.textContent = "These favourites will stay while this tab is open.";
      favIdeas.forEach((idea) => {
        const pill = document.createElement("div");
        pill.className = "board-pill";
        pill.innerHTML = `
          <span>${idea.title}</span>
          <button title="Remove from board">×</button>
        `;
        pill.querySelector("button").addEventListener("click", () => {
          toggleFavorite(idea.id);
        });
        boardListEl.appendChild(pill);
      });
    }

    // --- STATE UPDATERS ---
    function toggleFavorite(id) {
      if (favorites.has(id)) {
        favorites.delete(id);
      } else {
        favorites.add(id);
      }
      renderGallery();
      renderBoard();
    }

    function setCategory(category) {
      activeCategory = category;
      [...categoryChipsEl.querySelectorAll(".chip")].forEach((chip) => {
        chip.classList.toggle("active", chip.dataset.category === category);
      });
      renderGallery();
    }

    function setSearch(term) {
      searchTerm = term;
      renderGallery();
    }

    function toggleFavoritesView() {
      showFavoritesOnly = !showFavoritesOnly;
      showFavoritesBtn.textContent = showFavoritesOnly ? "Show all" : "Favourites";
      renderGallery();
    }

    function surpriseMe() {
      const randomIdea = ideas[Math.floor(Math.random() * ideas.length)];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      const message = `Imagine a "${randomIdea.title}" inspired by this prompt: ${randomPrompt.text}`;
      promptDisplayEl.textContent = message;
      promptTagEl.textContent = `Mood: ${randomPrompt.mood}`;
      if (!favorites.has(randomIdea.id)) {
        favorites.add(randomIdea.id);
        renderGallery();
        renderBoard();
      }
    }

    function newPrompt() {
      const p = prompts[Math.floor(Math.random() * prompts.length)];
      promptDisplayEl.textContent = p.text;
      promptTagEl.textContent = `Mood: ${p.mood}`;
    }

    // --- EVENT LISTENERS ---
    categoryChipsEl.addEventListener("click", (e) => {
      if (e.target.classList.contains("chip")) {
        setCategory(e.target.dataset.category);
      }
    });

    searchInputEl.addEventListener("input", (e) => {
      setSearch(e.target.value.trim());
    });

    showFavoritesBtn.addEventListener("click", toggleFavoritesView);
    surpriseMeBtn.addEventListener("click", surpriseMe);
    newPromptBtn.addEventListener("click", newPrompt);
    newQuoteBtn.addEventListener("click", renderQuote);

    // --- INIT ---
    renderGallery();
    renderPalette();
    renderQuote();
  