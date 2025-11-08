const STORAGE_KEYS = {
  plans: "myplanProfiles",
  rooms: "myplanChatRooms",
  messages: "myplanMessages",
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const defaultPlans = [
  {
    id: "plan-urban-bloom",
    title: "Urban Bloom Microgreens",
    category: "Food & Beverage",
    summary:
      "A hyperlocal farming network supplying restaurants with zero-mile produce via AI-managed hydroponics.",
    goal: 95000,
    raised: 62000,
    traction: "120 restaurants on waitlist · 4 pilot farms active",
    milestones: [
      "Expand to 3 new neighborhoods within 6 months",
      "Launch chef co-creation studio for new menus",
      "Develop franchise kit for international partners",
    ],
    whyNow:
      "Restaurants seek reliable, sustainable sources as supply chains remain volatile. Our model cuts delivery times and waste.",
    creator: "Maya Rivera",
    location: "Austin, TX",
    supporters: [
      { name: "Alex P.", amount: 1500 },
      { name: "Chef Lian", amount: 2500 },
      { name: "Nova Ventures", amount: 20000 },
      { name: "Ridge Angels", amount: 12000 },
    ],
    tags: ["Sustainability", "Agritech"],
  },
  {
    id: "plan-skyhaul",
    title: "SkyHaul Autonomous Cargo",
    category: "Technology",
    summary:
      "Battery-hybrid cargo drones designed to service underserved regional hubs, enabling same-day freight.",
    goal: 250000,
    raised: 142500,
    traction: "FAA sandbox approval secured · 30 logistics partners in LOI",
    milestones: [
      "Complete 200-hour test cycle with partner carriers",
      "Deploy autonomous fleet management software",
      "Open maintenance hub in Denver",
    ],
    whyNow:
      "Demand for resilient logistics has surged while pilots remain in short supply. Hybrid drones fill the gap cost-effectively.",
    creator: "Kwame Douglas",
    location: "Denver, CO",
    supporters: [
      { name: "Helios Capital", amount: 40000 },
      { name: "Regan Logistics", amount: 32500 },
      { name: "Celine M.", amount: 4500 },
    ],
    tags: ["Aviation", "Supply Chain"],
  },
  {
    id: "plan-musewave",
    title: "MuseWave Studios",
    category: "Creative",
    summary:
      "A fan-owned music incubator turning emerging artists into chart-ready acts with shared upside for early believers.",
    goal: 130000,
    raised: 38200,
    traction: "5 artists in slate · 2m collective TikTok reach",
    milestones: [
      "Sign streaming distribution partnership",
      "Launch member-only backstage community app",
      "Produce debut EP for anchor artist",
    ],
    whyNow:
      "Fans crave deeper participation. Web3 tools now enable royalty sharing at scale and compliant fan ownership.",
    creator: "Nia Carter",
    location: "Brooklyn, NY",
    supporters: [
      { name: "SoundCollective DAO", amount: 12500 },
      { name: "Marissa T.", amount: 1500 },
      { name: "Backstage Angels", amount: 9000 },
    ],
    tags: ["Web3", "Entertainment"],
  },
];

const defaultRooms = [
  {
    id: "room-general",
    title: "General Lounge",
    description: "Welcome investors and planners. Share news and quick intros.",
  },
  {
    id: "room-investor-circle",
    title: "Investor Circle",
    description: "Discuss diligence checklists, metrics, and portfolio learnings.",
  },
  {
    id: "room-market-fit",
    title: "Market Fit Lab",
    description: "Workshop customer discovery findings and product pivots.",
  },
];

const state = {
  plans: [...defaultPlans],
  customPlans: [],
  filters: {
    category: "all",
    search: "",
  },
  featuredPlanId: defaultPlans[0]?.id ?? null,
  rooms: [...defaultRooms],
  messages: {},
  activeRoomId: null,
  displayName: "",
};

function safeStorageGet(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : parsed;
  } catch (error) {
    console.warn("Storage read failed", key, error);
    return fallback;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Storage write failed", key, error);
  }
}

function initStateFromStorage() {
  state.customPlans = safeStorageGet(STORAGE_KEYS.plans, []);
  if (state.customPlans.length) {
    state.plans = [...defaultPlans, ...state.customPlans];
  }

  const storedRooms = safeStorageGet(STORAGE_KEYS.rooms, []);
  if (storedRooms.length) {
    const defaultIds = new Set(defaultRooms.map((room) => room.id));
    const mergedRooms = [...defaultRooms];
    storedRooms.forEach((room) => {
      if (!defaultIds.has(room.id)) {
        mergedRooms.push(room);
      }
    });
    state.rooms = mergedRooms;
  }

  const storedMessages = safeStorageGet(STORAGE_KEYS.messages, {});
  state.messages = storedMessages ?? {};
}

const elements = {
  planGrid: document.getElementById("planGrid"),
  emptyState: document.getElementById("emptyState"),
  planCategoryFilter: document.getElementById("planCategoryFilter"),
  planSearch: document.getElementById("planSearch"),
  featuredPlanTitle: document.getElementById("featuredPlanTitle"),
  featuredPlanSummary: document.getElementById("featuredPlanSummary"),
  featuredBackers: document.getElementById("featuredBackers"),
  heroStatPlans: document.getElementById("statPlans"),
  heroStatInvestors: document.getElementById("statInvestors"),
  heroStatRaised: document.getElementById("statRaised"),
  planModal: document.getElementById("planModal"),
  modalTitle: document.getElementById("modalTitle"),
  modalBody: document.getElementById("modalBody"),
  toast: document.getElementById("toast"),
  profileForm: document.getElementById("profileForm"),
  profilePreview: document.getElementById("profilePreview"),
  displayNameInput: document.getElementById("displayName"),
  roomList: document.getElementById("roomList"),
  createRoomBtn: document.getElementById("createRoomBtn"),
  messageList: document.getElementById("messageList"),
  messageForm: document.getElementById("messageForm"),
  messageInput: document.getElementById("messageInput"),
  messageSubmit: document.querySelector("#messageForm button[type='submit']"),
  activeRoomTitle: document.getElementById("activeRoomTitle"),
  activeRoomDesc: document.getElementById("activeRoomDesc"),
  activeRoomMembers: document.getElementById("activeRoomMembers"),
  navToggle: document.querySelector(".nav-toggle"),
  navMenu: document.getElementById("main-menu"),
};

function populateCategoryFilter() {
  const categories = new Set();
  state.plans.forEach((plan) => categories.add(plan.category));
  const select = elements.planCategoryFilter;
  const currentValue = select.value;
  select.innerHTML = `<option value="all">All</option>`;
  Array.from(categories)
    .sort()
    .forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      select.appendChild(option);
    });
  if ([...select.options].some((opt) => opt.value === currentValue)) {
    select.value = currentValue;
  }
}

function updateHeroSection() {
  const plan = state.plans.find((p) => p.id === state.featuredPlanId) ?? state.plans[0];
  if (!plan) return;
  state.featuredPlanId = plan.id;
  elements.featuredPlanTitle.textContent = plan.title;
  elements.featuredPlanSummary.textContent = plan.summary;

  const backers = plan.supporters?.slice(0, 5) ?? [];
  elements.featuredBackers.innerHTML = "";
  if (!backers.length) {
    const li = document.createElement("li");
    li.textContent = "Be the first to back this plan.";
    elements.featuredBackers.appendChild(li);
  } else {
    backers.forEach((supporter) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${supporter.name}</strong><span>${currencyFormatter.format(
        supporter.amount
      )}</span>`;
      elements.featuredBackers.appendChild(li);
    });
  }

  const planCount = state.plans.length;
  elements.heroStatPlans.textContent = planCount.toString();

  const investorCount = state.plans.reduce(
    (total, item) => total + (item.supporters?.length ?? 0),
    0
  );
  elements.heroStatInvestors.textContent = investorCount.toString();

  const totalRaised = state.plans.reduce(
    (total, item) => total + (item.raised ?? 0),
    0
  );
  elements.heroStatRaised.textContent = currencyFormatter.format(totalRaised);
}

function createPlanCard(plan) {
  const progress = plan.goal ? Math.min((plan.raised ?? 0) / plan.goal, 1) : 0;
  const card = document.createElement("article");
  card.className = "plan-card";
  card.innerHTML = `
    <header>
      <p class="plan-card__category">${plan.category}</p>
      <h3 class="plan-card__title">${plan.title}</h3>
    </header>
    <p class="plan-card__summary">${plan.summary}</p>
    <dl class="plan-card__meta">
      <div>
        <dt>Funding Goal</dt>
        <dd>${currencyFormatter.format(plan.goal)}</dd>
      </div>
      <div>
        <dt>Raised</dt>
        <dd>${currencyFormatter.format(plan.raised ?? 0)}</dd>
      </div>
      <div>
        <dt>Traction</dt>
        <dd>${plan.traction}</dd>
      </div>
    </dl>
    <div class="plan-card__progress">
      <div class="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(
        progress * 100
      )}">
        <div class="progress-bar__fill" style="--progress: ${progress * 100}%"></div>
      </div>
      <span>${percentFormatter.format(progress)} funded</span>
    </div>
    <div class="plan-card__actions">
      <button class="cta-button" data-action="invest" data-plan="${plan.id}">Invest</button>
      <button class="ghost-button" data-action="follow" data-plan="${plan.id}">Follow</button>
      <button class="ghost-button ghost-button--quiet" data-action="view-plan" data-plan="${plan.id}">View details</button>
    </div>
  `;
  return card;
}

function renderPlans() {
  const { category, search } = state.filters;
  const normalizedSearch = search.trim().toLowerCase();
  const results = state.plans.filter((plan) => {
    const matchesCategory = category === "all" || plan.category === category;
    const matchesSearch =
      !normalizedSearch ||
      plan.title.toLowerCase().includes(normalizedSearch) ||
      plan.summary.toLowerCase().includes(normalizedSearch) ||
      plan.tags?.some((tag) => tag.toLowerCase().includes(normalizedSearch));
    return matchesCategory && matchesSearch;
  });

  elements.planGrid.innerHTML = "";
  if (!results.length) {
    elements.emptyState.classList.remove("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");
  results.forEach((plan) => {
    elements.planGrid.appendChild(createPlanCard(plan));
  });
}

function openPlanModal(planId) {
  const plan = state.plans.find((item) => item.id === planId);
  if (!plan) return;

  state.featuredPlanId = planId;
  updateHeroSection();

  elements.modalTitle.textContent = plan.title;
  const supportersList =
    plan.supporters?.length > 0
      ? `<ul>${plan.supporters
          .map(
            (supporter) =>
              `<li><strong>${supporter.name}</strong> pledged ${currencyFormatter.format(
                supporter.amount
              )}</li>`
          )
          .join("")}</ul>`
      : "<p>No supporters yet. Be the first to invest.</p>";

  const milestones =
    plan.milestones?.length > 0
      ? `<ol>${plan.milestones.map((item) => `<li>${item}</li>`).join("")}</ol>`
      : "<p>Milestones will be added soon.</p>";

  elements.modalBody.innerHTML = `
    <section>
      <h4>Overview</h4>
      <p>${plan.summary}</p>
    </section>
    <section>
      <h4>Traction</h4>
      <p>${plan.traction}</p>
    </section>
    <section>
      <h4>Milestones</h4>
      ${milestones}
    </section>
    <section>
      <h4>Why Now</h4>
      <p>${plan.whyNow ?? "Founder will share timing insights soon."}</p>
    </section>
    <section>
      <h4>Supporters</h4>
      ${supportersList}
    </section>
  `;

  if (typeof elements.planModal.showModal === "function") {
    elements.planModal.showModal();
  } else {
    elements.planModal.setAttribute("open", "");
  }
}

function closeModal() {
  if (elements.planModal.hasAttribute("open")) {
    elements.planModal.close?.();
    elements.planModal.removeAttribute("open");
  }
}

function showToast(message) {
  if (!elements.toast) return;
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  setTimeout(() => {
    elements.toast.classList.remove("is-visible");
  }, 2600);
}

function handlePlanActions(event) {
  const action = event.target.dataset.action;
  if (!action) return;
  const planId = event.target.dataset.plan;
  if (action === "view-plan") {
    openPlanModal(planId);
  } else if (action === "invest") {
    showToast("Investment flow is simulated in this prototype.");
  } else if (action === "follow") {
    showToast("Following a plan will notify you about updates (demo).");
  }
}

function updatePlanFilters() {
  state.filters.category = elements.planCategoryFilter.value;
  renderPlans();
}

function handleSearchInput() {
  state.filters.search = elements.planSearch.value;
  renderPlans();
}

function resetProfilePreview() {
  const preview = elements.profilePreview;
  if (!preview) return;
  preview.querySelector(".plan-card__category").textContent = "Category";
  preview.querySelector(".plan-card__title").textContent = "Your plan title here";
  preview.querySelector(".plan-card__summary").textContent =
    "As you type, your pitch preview updates. Keep it crisp and inspiring.";
  preview.querySelectorAll(".plan-card__meta dd")[0].textContent = "$0";
  preview.querySelectorAll(".plan-card__meta dd")[1].textContent = "—";
  preview.querySelector(".plan-card__milestones p").textContent = "—";
  preview.querySelector(".plan-card__why p").textContent = "—";
}

function updateProfilePreview(formData) {
  const preview = elements.profilePreview;
  if (!preview) return;
  const title = formData.get("title");
  const category = formData.get("category");
  const summary = formData.get("summary");
  const goal = formData.get("goal");
  const traction = formData.get("traction");
  const milestones = formData.get("milestones");
  const whyNow = formData.get("whyNow");

  preview.querySelector(".plan-card__category").textContent = category || "Category";
  preview.querySelector(".plan-card__title").textContent =
    title || "Your plan title here";
  preview.querySelector(".plan-card__summary").textContent =
    summary ||
    "As you type, your pitch preview updates. Keep it crisp and inspiring.";
  preview.querySelectorAll(".plan-card__meta dd")[0].textContent = goal
    ? currencyFormatter.format(Number(goal))
    : "$0";
  preview.querySelectorAll(".plan-card__meta dd")[1].textContent =
    traction || "—";
  preview.querySelector(".plan-card__milestones p").textContent =
    milestones || "—";
  preview.querySelector(".plan-card__why p").textContent = whyNow || "—";
}

function handleProfileInput() {
  if (!elements.profileForm) return;
  const formData = new FormData(elements.profileForm);
  updateProfilePreview(formData);
}

function handleProfileSubmit(event) {
  event.preventDefault();
  const formData = new FormData(elements.profileForm);
  const title = formData.get("title")?.trim();
  const summary = formData.get("summary")?.trim();
  if (!title || !summary) {
    showToast("Please fill in at least the title and summary.");
    return;
  }

  const plan = {
    id: `plan-${Date.now()}`,
    title,
    category: formData.get("category"),
    summary,
    goal: Number(formData.get("goal")) || 0,
    raised: 0,
    traction: formData.get("traction") || "Traction will be updated soon.",
    milestones: formData
      .get("milestones")
      ?.split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    whyNow: formData.get("whyNow") || "",
    creator: "Community Member",
    location: "Global",
    supporters: [],
    tags: [],
  };

  state.customPlans.push(plan);
  state.plans = [...defaultPlans, ...state.customPlans];
  safeStorageSet(STORAGE_KEYS.plans, state.customPlans);

  populateCategoryFilter();
  renderPlans();
  updateHeroSection();
  showToast("Plan published to the showcase!");
  elements.profileForm.reset();
  resetProfilePreview();
}

function loadRoomMessages(roomId) {
  return state.messages[roomId] ?? [];
}

function saveRoomMessages(roomId, messages) {
  state.messages[roomId] = messages;
  safeStorageSet(STORAGE_KEYS.messages, state.messages);
}

function renderRooms() {
  elements.roomList.innerHTML = "";
  state.rooms.forEach((room) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.roomId = room.id;
    button.textContent = room.title;
    if (room.id === state.activeRoomId) {
      button.classList.add("is-active");
    }
    elements.roomList.appendChild(button);
  });
}

function renderMessages(roomId) {
  const messages = loadRoomMessages(roomId);
  elements.messageList.innerHTML = "";
  messages.forEach((message) => {
    const li = document.createElement("li");
    li.className = "chat__message";
    if (message.displayName === state.displayName && state.displayName) {
      li.classList.add("chat__message--self");
    }
    li.innerHTML = `
      <div class="chat__message-meta">
        <strong>${message.displayName || "Guest"}</strong>
        <span>${new Date(message.timestamp).toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        })}</span>
      </div>
      <p>${message.body}</p>
    `;
    elements.messageList.appendChild(li);
  });
  elements.messageList.scrollTop = elements.messageList.scrollHeight;

  const uniqueMembers = new Set(messages.map((msg) => msg.displayName).filter(Boolean));
  elements.activeRoomMembers.textContent = `${uniqueMembers.size} members`;
}

function setActiveRoom(roomId) {
  const room = state.rooms.find((roomItem) => roomItem.id === roomId);
  if (!room) return;
  state.activeRoomId = roomId;
  elements.activeRoomTitle.textContent = room.title;
  elements.activeRoomDesc.textContent = room.description;
  renderRooms();
  renderMessages(roomId);
  evaluateComposerState();
}

function handleRoomClick(event) {
  if (!(event.target instanceof HTMLButtonElement)) return;
  const roomId = event.target.dataset.roomId;
  if (!roomId) return;
  setActiveRoom(roomId);
}

function evaluateComposerState() {
  const ready = Boolean(state.activeRoomId && state.displayName);
  elements.messageInput.disabled = !ready;
  elements.messageSubmit.disabled = !ready;
  if (!ready) {
    elements.messageInput.placeholder = "Set your display name and select a room.";
  } else {
    elements.messageInput.placeholder = `Chat as ${state.displayName}`;
  }
}

function handleDisplayNameInput() {
  state.displayName = elements.displayNameInput.value.trim();
  evaluateComposerState();
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const body = elements.messageInput.value.trim();
  if (!body || !state.activeRoomId) return;

  const messages = loadRoomMessages(state.activeRoomId);
  const message = {
    id: `msg-${Date.now()}`,
    displayName: state.displayName || "Guest",
    body,
    timestamp: Date.now(),
  };
  messages.push(message);
  saveRoomMessages(state.activeRoomId, messages);
  elements.messageInput.value = "";
  renderMessages(state.activeRoomId);
}

function handleCreateRoom() {
  const title = prompt("Name your new room:");
  if (!title) return;
  const description =
    prompt("Describe the room’s purpose (optional):") ||
    "A community-created room for deeper collaboration.";
  const room = {
    id: `room-${Date.now()}`,
    title: title.trim(),
    description: description.trim(),
  };
  state.rooms.push(room);
  safeStorageSet(
    STORAGE_KEYS.rooms,
    state.rooms.filter((roomItem) => !defaultRooms.some((def) => def.id === roomItem.id))
  );
  renderRooms();
  setActiveRoom(room.id);
  showToast(`Room “${room.title}” created.`);
}

function handleModalClicks(event) {
  if (event.target.dataset.closeModal !== undefined || event.target === elements.planModal) {
    closeModal();
  }
}

function handleFeaturedButton() {
  if (state.featuredPlanId) {
    openPlanModal(state.featuredPlanId);
  }
}

function handleNavToggle() {
  const expanded = elements.navToggle.getAttribute("aria-expanded") === "true";
  elements.navToggle.setAttribute("aria-expanded", String(!expanded));
  elements.navMenu.classList.toggle("is-open");
}

function closeNavOnLinkClick(event) {
  if (event.target.tagName === "A" && elements.navMenu.classList.contains("is-open")) {
    elements.navMenu.classList.remove("is-open");
    elements.navToggle.setAttribute("aria-expanded", "false");
  }
}

function attachEventListeners() {
  elements.planGrid?.addEventListener("click", handlePlanActions);
  elements.planCategoryFilter?.addEventListener("change", updatePlanFilters);
  elements.planSearch?.addEventListener("input", handleSearchInput);
  elements.profileForm?.addEventListener("input", handleProfileInput);
  elements.profileForm?.addEventListener("reset", () => setTimeout(resetProfilePreview, 0));
  elements.profileForm?.addEventListener("submit", handleProfileSubmit);
  elements.planModal?.addEventListener("click", handleModalClicks);
  document.querySelectorAll("[data-close-modal]").forEach((btn) =>
    btn.addEventListener("click", closeModal)
  );
  document.querySelector("[data-open-featured]")?.addEventListener("click", handleFeaturedButton);
  elements.roomList?.addEventListener("click", handleRoomClick);
  elements.createRoomBtn?.addEventListener("click", handleCreateRoom);
  elements.displayNameInput?.addEventListener("input", handleDisplayNameInput);
  elements.messageForm?.addEventListener("submit", handleMessageSubmit);
  elements.navToggle?.addEventListener("click", handleNavToggle);
  elements.navMenu?.addEventListener("click", closeNavOnLinkClick);
  window.addEventListener("keydown", (evt) => {
    if (evt.key === "Escape") {
      closeModal();
    }
  });
}

function bootstrap() {
  initStateFromStorage();
  populateCategoryFilter();
  renderPlans();
  updateHeroSection();
  resetProfilePreview();
  renderRooms();
  if (state.rooms.length) {
    setActiveRoom(state.rooms[0].id);
  }
  evaluateComposerState();
  attachEventListeners();
}

document.addEventListener("DOMContentLoaded", bootstrap);
