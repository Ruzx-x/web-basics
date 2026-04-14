const STORAGE_KEY = "habitflow-data-v1";

    const todayText = document.getElementById("todayText");
    const habitForm = document.getElementById("habitForm");
    const habitInput = document.getElementById("habitInput");
    const habitList = document.getElementById("habitList");
    const emptyState = document.getElementById("emptyState");
    const weekStrip = document.getElementById("weekStrip");
    const chart = document.getElementById("chart");

    const globalStreakEl = document.getElementById("globalStreak");
    const todayCompletedEl = document.getElementById("todayCompleted");
    const todayCompletedSubEl = document.getElementById("todayCompletedSub");
    const weekCompletionEl = document.getElementById("weekCompletion");
    const weekCompletionSubEl = document.getElementById("weekCompletionSub");
    const bestDayLabelEl = document.getElementById("bestDayLabel");
    const bestDaySubEl = document.getElementById("bestDaySub");

    const dayNamesShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    function getTodayInfo() {
      const now = new Date();
      const dayIndex = (now.getDay() + 6) % 7;
      const dateStr = now.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      return { now, dayIndex, dateStr };
    }

    function getWeekKey(date = new Date()) {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
      return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
    }

    function loadData() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
          return {
            habits: [],
            weeks: {},
          };
        }
        const parsed = JSON.parse(raw);
        if (!parsed.habits) parsed.habits = [];
        if (!parsed.weeks) parsed.weeks = {};
        return parsed;
      } catch (e) {
        return {
          habits: [],
          weeks: {},
        };
      }
    }

    function saveData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    let state = loadData();

    function ensureWeekStructure(weekKey) {
      if (!state.weeks[weekKey]) {
        state.weeks[weekKey] = {
          days: Array.from({ length: 7 }, () => []),
        };
      }
    }

    function initWeekStrip() {
      const { dayIndex } = getTodayInfo();
      weekStrip.innerHTML = "";
      dayNamesShort.forEach((name, idx) => {
        const el = document.createElement("div");
        el.className = "week-day-label" + (idx === dayIndex ? " today" : "");
        el.textContent = name;
        weekStrip.appendChild(el);
      });
    }

    function renderHabits() {
      const { dayIndex } = getTodayInfo();
      const weekKey = getWeekKey();
      ensureWeekStructure(weekKey);

      habitList.innerHTML = "";
      const habits = state.habits;

      if (!habits.length) {
        emptyState.style.display = "block";
      } else {
        emptyState.style.display = "none";
      }

      const weekData = state.weeks[weekKey];

      habits.forEach((habit) => {
        const row = document.createElement("div");
        row.className = "habit";

        const name = document.createElement("div");
        name.className = "habit-name";
        const initial = document.createElement("span");
        initial.textContent = habit.name.charAt(0).toUpperCase();
        name.appendChild(initial);
        name.appendChild(document.createTextNode(habit.name));
        row.appendChild(name);

        for (let i = 0; i < 7; i++) {
          const dot = document.createElement("button");
          dot.type = "button";
          dot.className = "day-dot";
          const span = document.createElement("span");
          span.textContent = i === dayIndex ? "●" : "";
          dot.appendChild(span);

          const completed = weekData.days[i].includes(habit.id);
          if (completed) {
            dot.classList.add("completed");
          }

          dot.addEventListener("click", () => {
            toggleHabitDay(habit.id, i);
          });

          row.appendChild(dot);
        }

        const actions = document.createElement("div");
        actions.className = "habit-actions";

        const badge = document.createElement("div");
        badge.className = "badge";
        badge.textContent = `${habit.streak || 0} day streak`;
        actions.appendChild(badge);

        const del = document.createElement("button");
        del.className = "delete-btn";
        del.textContent = "×";
        del.title = "Delete habit";
        del.addEventListener("click", () => {
          deleteHabit(habit.id);
        });
        actions.appendChild(del);

        row.appendChild(actions);

        habitList.appendChild(row);
      });

      updateStats();
    }

    function toggleHabitDay(habitId, dayIndex) {
      const weekKey = getWeekKey();
      ensureWeekStructure(weekKey);
      const weekData = state.weeks[weekKey];

      const dayArr = weekData.days[dayIndex];
      const idx = dayArr.indexOf(habitId);
      if (idx === -1) {
        dayArr.push(habitId);
      } else {
        dayArr.splice(idx, 1);
      }

      recalcStreaks();
      saveData();
      renderHabits();
      renderChart();
    }

    function deleteHabit(habitId) {
      state.habits = state.habits.filter((h) => h.id !== habitId);
      Object.values(state.weeks).forEach((week) => {
        week.days.forEach((dayArr) => {
          const idx = dayArr.indexOf(habitId);
          if (idx !== -1) {
            dayArr.splice(idx, 1);
          }
        });
      });
      recalcStreaks();
      saveData();
      renderHabits();
      renderChart();
    }

    function recalcStreaks() {
      const todayWeekKey = getWeekKey();
      const { dayIndex } = getTodayInfo();

      state.habits.forEach((habit) => {
        let streak = 0;
        let currentDate = new Date();
        let currentDayIndex = dayIndex;
        let currentWeekKey = todayWeekKey;

        while (true) {
          ensureWeekStructure(currentWeekKey);
          const weekData = state.weeks[currentWeekKey];
          const dayArr = weekData.days[currentDayIndex];

          if (dayArr.includes(habit.id)) {
            streak++;
          } else {
            break;
          }

          currentDayIndex--;
          if (currentDayIndex < 0) {
            currentDayIndex = 6;
            currentDate.setDate(currentDate.getDate() - 1);
            currentWeekKey = getWeekKey(currentDate);
          }
        }

        habit.streak = streak;
      });

      let globalStreak = 0;
      state.habits.forEach((h) => {
        if (h.streak > globalStreak) globalStreak = h.streak;
      });
      globalStreakEl.textContent = globalStreak;
    }

    function updateStats() {
      const { dayIndex } = getTodayInfo();
      const weekKey = getWeekKey();
      ensureWeekStructure(weekKey);
      const weekData = state.weeks[weekKey];

      const habitsCount = state.habits.length;
      const todayCompleted = habitsCount
        ? weekData.days[dayIndex].length
        : 0;

      todayCompletedEl.textContent = `${todayCompleted} / ${habitsCount}`;
      if (!habitsCount) {
        todayCompletedSubEl.textContent = "Add a habit to start tracking.";
      } else if (todayCompleted === habitsCount) {
        todayCompletedSubEl.textContent = "Perfect day. All habits done.";
      } else if (todayCompleted === 0) {
        todayCompletedSubEl.textContent = "You still have time. Pick one habit to start.";
      } else {
        todayCompletedSubEl.textContent = "Nice progress. Keep going.";
      }

      let totalSlots = habitsCount * 7;
      let totalCompleted = 0;
      weekData.days.forEach((dayArr) => {
        totalCompleted += dayArr.length;
      });

      const weekPercent = totalSlots ? Math.round((totalCompleted / totalSlots) * 100) : 0;
      weekCompletionEl.textContent = `${weekPercent}%`;
      weekCompletionSubEl.textContent = `${totalCompleted} of ${totalSlots || 0} check-ins`;

      let bestDayIndex = -1;
      let bestDayValue = -1;
      weekData.days.forEach((dayArr, idx) => {
        if (dayArr.length > bestDayValue) {
          bestDayValue = dayArr.length;
          bestDayIndex = idx;
        }
      });

      if (!habitsCount || bestDayValue <= 0) {
        bestDayLabelEl.textContent = "–";
        bestDaySubEl.textContent = "Waiting for your first check-in.";
      } else {
        bestDayLabelEl.textContent = dayNamesShort[bestDayIndex];
        bestDaySubEl.textContent = `${bestDayValue} of ${habitsCount} habits done.`;
      }
    }

    function renderChart() {
      const weekKey = getWeekKey();
      ensureWeekStructure(weekKey);
      const weekData = state.weeks[weekKey];
      const habitsCount = state.habits.length;

      chart.innerHTML = "";

      if (!habitsCount) {
        const msg = document.createElement("div");
        msg.className = "empty-state";
        msg.style.marginTop = "0";
        msg.textContent = "Once you add habits, this chart will show how each day of the week is going.";
        chart.appendChild(msg);
        return;
      }

      const maxPossible = habitsCount;
      const { dayIndex: todayIdx } = getTodayInfo();

      for (let i = 0; i < 7; i++) {
        const bar = document.createElement("div");
        bar.className = "chart-bar";

        const fill = document.createElement("div");
        fill.className = "chart-bar-fill";

        const completed = weekData.days[i].length;
        const heightPercent = maxPossible ? (completed / maxPossible) * 100 : 0;
        fill.style.height = `${heightPercent}%`;

        const label = document.createElement("div");
        label.className = "chart-label";
        label.textContent = completed;

        const dayLabel = document.createElement("div");
        dayLabel.className = "chart-day";
        dayLabel.textContent = dayNamesShort[i];

        if (i === todayIdx) {
          bar.style.borderColor = "rgba(34, 197, 94, 0.8)";
          bar.style.boxShadow = "0 0 14px rgba(34, 197, 94, 0.4)";
        }

        bar.appendChild(fill);
        bar.appendChild(label);
        bar.appendChild(dayLabel);
        chart.appendChild(bar);
      }
    }

    habitForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = habitInput.value.trim();
      if (!name) return;

      const habit = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
        name,
        streak: 0,
      };
      state.habits.push(habit);
      saveData();
      habitInput.value = "";
      recalcStreaks();
      renderHabits();
      renderChart();
    });

    function initTodayText() {
      const { dateStr } = getTodayInfo();
      todayText.innerHTML = `<strong>${dateStr}</strong><br/><span>Tap circles to mark today as done.</span>`;
    }

    function init() {
      initTodayText();
      initWeekStrip();
      recalcStreaks();
      renderHabits();
      renderChart();
    }

    init();