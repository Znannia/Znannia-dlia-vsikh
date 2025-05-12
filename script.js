const API_KEYS = ['AIzaSyBUIKh8TbT05XmLQTsQq9aXwf0RsiB-GR0', 'AIzaSyBIsnxOgHVW7AbYsYLZ6yMUF8f3PZFQFqc'],
      CHANNEL_ID = "UC0usNaN5iwML35qPxASBDWQ";
let currentKeyIndex = 0;

const playlistIds = {
  "Географія": "PLOI77RmcxMp7iQywXcinPbgpl4kTXx_oV",
  "Історія": "PLOI77RmcxMp57Hj3qFR8kv0D1rYs-MJNO",
  "Біблія": "PLOI77RmcxMp6bsY12dqBZ9tdf-EMf6lpY",
  "Україна": "PLOI77RmcxMp7umvhlyP8jIgvCk_9gKUFN",
  "Загальні знання": "PLOI77RmcxMp40BcW7EImRhMEtLFieW9B7",
  "Логіка": "PLOI77RmcxMp69eZQe-B51PXjk-hG123nE",
  "Що зайве": "PLOI77RmcxMp6jhCedjZf7QYOscN3KuMIO",
  "Не програєш": "PLOI77RmcxMp5FIXH2Z9OGFTEhrGQjBi_S"
};

const categoryDescriptions = {
  "Загальні знання": "Перевірте свою ерудицію з тестами на загальні знання! Від історії до науки — ці вікторини ідеальні для дітей і дорослих, щоб весело провести час і дізнатися щось нове разом із родиною. Пройдіть тест прямо зараз!",
  "Біблія": "Зануртеся у світ Святого Письма з вікторинами про Біблію! Перевірте, як добре ви знаєте біблійні сюжети та персонажів разом із сім’єю. Пройдіть тест і поглибте свої знання!",
  "Не програєш": "Готові до сміху та веселощів? Ці вікторини з несподіваними питаннями ідеальні для гри з друзями чи родиною. Дізнайтесь цікаве один про одного та пройдіть тест разом!",
  "Що зайве": "Потренуйте мозок із тестами на пошук зайвого чи подібного разом із родиною! Ці завдання покращують концентрацію та увагу. Прийміть виклик і перевірте свої навички!",
  "Логіка": "Перевірте свою кмітливість із тестами на логіку разом із сім’єю! Ці загадки — чудовий спосіб потренувати розум і весело провести час. Спробуйте розв’язати всі завдання!",
  "Історія": "Досліджуйте минуле з вікторинами про історію, міфи та легенди разом із родиною! Перевірте знання про давні цивілізації й таємничі сюжети. Пройдіть тест і дізнайтесь більше!",
  "Географія": "Мандруйте світом із географічними тестами разом із сім’єю! Від країн до природних чудес — ці вікторини підходять усім, хто любить географію. Перевірте свої знання вже зараз!",
  "Україна": "Поглибте знання про Україну з тестами про її історію та культуру разом із родиною! Дізнайтесь більше про традиції, події та видатних постатей. Пройдіть вікторину прямо зараз!"
};

async function fetchWithKey(e) {
  try {
    const t = await fetch(`${e}&key=${API_KEYS[currentKeyIndex]}`);
    if (!t.ok && (t.status === 403 || t.status === 429)) {
      currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
      return fetchWithKey(e);
    }
    return t;
  } catch (t) {
    throw t;
  }
}

async function fetchSubscribers() {
  const e = document.getElementById("subscribers");
  if (!e) return;
  const t = "subscribersCount", a = "subscribersTime", n = 864e5, s = new Date, i = s.getTime(), r = s.getHours() === 17;
  const c = localStorage.getItem(t), o = localStorage.getItem(a);
  if (c && o && i - o < n && !r) {
    e.innerHTML = `Нас уже понад<br><span class="subscribers-count">${c}</span>`;
    return;
  }
  try {
    const n = await fetchWithKey(`https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${CHANNEL_ID}`);
    if (!n.ok) throw new Error("Не вдалося отримати дані про підписників");
    const s = await n.json(), r = s.items[0].statistics.subscriberCount;
    localStorage.setItem(t, r);
    localStorage.setItem(a, i.toString());
    e.innerHTML = `Нас уже понад<br><span class="subscribers-count">${r}</span>`;
  } catch (t) {
    e.innerHTML = "Помилка завантаження підписників";
  }
}

async function filterNonShorts(e, t) {
  if (!e.length) return [];
  if (t === "Логіка") return e;
  try {
    const a = await fetchWithKey(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${e.join(",")}`);
    if (!a.ok) return e;
    const n = await a.json(), s = [];
    n.items.forEach((t, a) => {
      const n = t.contentDetails.duration, i = (n.match(/PT(\d+H)?(\d+M)?(\d+S)?/) || [0, 0, 0, 0]).slice(1).map(e => parseInt(e) || 0), r = i[0] * 3600 + i[1] * 60 + i[2];
      if (r >= 60) s.push(e[a]);
    });
    return s;
  } catch (a) {
    return e;
  }
}

function cleanDescription(e) {
  return e.replace(/#[\wА-Яа-я]+/g, "").replace(/Вітаємо на каналі "Знання для всіх"/gi, "").trim();
}

async function renderVideos(e, t, a = false) {
  t.innerHTML = "";
  if (e.length === 0) {
    t.innerHTML = "<p>Немає доступних відео. Спробуйте пізніше.</p>";
    return;
  }
  const n = document.createElement("script");
  n.type = "application/ld+json";
  const s = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": a ? "Вікторини та тести для всієї родини - Знання для всіх" : `Вікторини з ${t.dataset.category || "Категорії"} - Знання для всіх`,
    "description": a ? "Тести та вікторини з географії, історії, Біблії, України та логіки для родини та друзів. Пізнавайте світ через розваги!" : categoryDescriptions[t.dataset.category] || "Цікаві тести та вікторини для всієї родини!",
    "thumbnailUrl": "https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg",
    "uploadDate": "2025-05-01",
    "contentUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
  };
  if (e[0]) {
    const i = a ? e[0].id.videoId : e[0].snippet.resourceId.videoId;
    s.thumbnailUrl = `https://img.youtube.com/vi/${i}/maxresdefault.jpg`;
    s.contentUrl = `https://www.youtube.com/watch?v=${i}`;
    n.text = JSON.stringify(s);
    document.head.appendChild(n);
  }
  for (const i of e) {
    const r = a ? i.id.videoId : i.snippet.resourceId.videoId, c = i.snippet.title, o = `https://img.youtube.com/vi/${r}/maxresdefault.jpg`;
    let l = "";
    try {
      const e = await fetchWithKey(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${r}`);
      if (e.ok) {
        const t = await e.json();
        l = cleanDescription(t.items[0].snippet.description);
      }
    } catch (e) {}
    const d = document.createElement("div");
    d.className = "video-item";
    d.innerHTML = `
      <div class="video-container">
        <img src="${o}" alt="${c}" class="thumbnail" data-video-id="${r}" loading="lazy">
      </div>
      <p class="video-title" data-video-id="${r}">${c}${a ? ' <span class="new">Нове</span>' : ""}</p>
      <div class="video-actions">
        <button class="comment-btn">Коментар</button>
        <button class="more-btn" data-video-id="${r}">Більше</button>
      </div>
      <div class="comment-box" style="display:none">
        <textarea placeholder="Ваш коментар..." rows="4"></textarea>
        <button class="submit-comment">Відправити</button>
        <div class="comment-list"></div>
      </div>
      <div class="description-box" style="display:none" data-video-id="${r}">
        <p>${l || "Опис недоступний"}</p>
      </div>`;
    t.appendChild(d);
    const m = d.querySelector(".comment-list"), g = JSON.parse(localStorage.getItem(`comments_${r}`) || "[]");
    g.forEach(e => {
      const t = document.createElement("p");
      t.textContent = e;
      m.appendChild(t);
    });
  }
  t.addEventListener("click", e => {
    const a = e.target;
    if (a.matches(".video-title,.thumbnail")) {
      const n = a.getAttribute("data-video-id"), s = a.closest(".video-item").querySelector(".video-container"), i = s.dataset.playerActive === "true";
      if (!i) {
        s.innerHTML = `<iframe src="https://www.youtube.com/embed/${n}?rel=0&autoplay=1" frameborder="0" allowfullscreen loading="lazy"></iframe>`;
        s.dataset.playerActive = "true";
      }
    } else if (a.matches(".comment-btn")) {
      const e = a.parentElement.nextElementSibling;
      e.style.display = e.style.display === "none" ? "block" : "none";
    } else if (a.matches(".submit-comment")) {
      const e = a.previousElementSibling, n = a.closest(".video-item").querySelector(".thumbnail").getAttribute("data-video-id"), s = a.nextElementSibling;
      if (e.value.trim()) {
        const t = document.createElement("p");
        t.textContent = e.value.trim();
        s.appendChild(t);
        const a = JSON.parse(localStorage.getItem(`comments_${n}`) || "[]");
        a.push(e.value.trim());
        localStorage.setItem(`comments_${n}`, JSON.stringify(a));
        e.value = "";
      }
    } else if (a.matches(".more-btn")) {
      const e = a.getAttribute("data-video-id"), t = a.parentElement.nextElementSibling.nextElementSibling;
      t.style.display = t.style.display === "none" ? "block" : "none";
      a.textContent = t.style.display === "none" ? "Більше" : "Менше";
    }
  });
}

const VIDEOS_PER_PAGE = 3; // Обмежено до 3 для .latest-videos

async function fetchLatestVideos() {
  const e = document.getElementById("latest-videos");
  if (!e) return;
  const t = "latestVideos", a = "latestVideosTime", n = 864e5;
  e.classList.add("loading");
  const s = localStorage.getItem(t), i = localStorage.getItem(a), r = Date.now();
  try {
    const n = await fetchWithKey(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&maxResults=10&order=date&type=video`);
    if (!n.ok) throw new Error(`Помилка API: ${n.status}`);
    const s = await n.json();
    let i = s.items.filter(e => e.id && e.id.videoId && e.snippet && e.snippet.title !== "Private video" && e.snippet.title !== "Deleted video"),
        r = i.map(e => e.id.videoId), c = await filterNonShorts(r);
    i = i.filter(e => c.includes(e.id.videoId));
    const paginatedVideos = i.slice(0, VIDEOS_PER_PAGE);
    if (paginatedVideos.length === 0) {
      e.innerHTML = "<p>Немає доступних відео. Спробуйте пізніше.</p>";
      e.classList.remove("loading");
      return;
    }
    await renderVideos(paginatedVideos, e, true);
    localStorage.setItem(t, JSON.stringify(i));
    localStorage.setItem(a, r.toString());
  } catch (t) {
    e.innerHTML = `<p>Помилка завантаження відео: ${t.message}. Спробуйте пізніше.</p>`;
  } finally {
    e.classList.remove("loading");
  }
}

async function fetchRandomVideos() {
  const e = document.getElementById("random-videos");
  if (!e) return;
  const t = "randomVideos", a = "randomVideosTime", n = 864e5;
  e.classList.add("loading");
  const s = localStorage.getItem(t), i = localStorage.getItem(a), r = Date.now();
  let currentPage = 1;
  if (s && i && r - i < n) {
    let videos = JSON.parse(s).filter(e => e.snippet && e.snippet.resourceId && e.snippet.resourceId.videoId && e.snippet.title !== "Private video" && e.snippet.title !== "Deleted video");
    const paginatedVideos = videos.slice(0, VIDEOS_PER_PAGE * 3); // Завантажуємо 3 ряди
    await renderVideos(paginatedVideos, e);
    if (videos.length > VIDEOS_PER_PAGE * 3) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.textContent = "Завантажити ще";
      loadMoreBtn.className = "more-btn load-more";
      loadMoreBtn.style.display = "block";
      loadMoreBtn.style.margin = "20px auto";
      loadMoreBtn.style.padding = "12px 24px";
      loadMoreBtn.style.fontSize = "18px";
      loadMoreBtn.style.fontWeight = "bold";
      loadMoreBtn.style.backgroundColor = "#ff0000";
      loadMoreBtn.style.color = "#ffffff";
      loadMoreBtn.style.border = "none";
      loadMoreBtn.style.borderRadius = "5px";
      loadMoreBtn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      loadMoreBtn.style.cursor = "pointer";
      loadMoreBtn.onmouseover = () => loadMoreBtn.style.backgroundColor = "#cc0000";
      loadMoreBtn.onmouseout = () => loadMoreBtn.style.backgroundColor = "#ff0000";
      loadMoreBtn.onclick = () => {
        currentPage++;
        const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE * 3;
        const endIndex = startIndex + VIDEOS_PER_PAGE * 3;
        const nextVideos = videos.slice(startIndex, endIndex);
        renderVideos(nextVideos, e);
        if (endIndex >= videos.length) loadMoreBtn.remove();
      };
      e.after(loadMoreBtn);
    }
    localStorage.setItem(t, JSON.stringify(videos));
    e.classList.remove("loading");
    return;
  }
  try {
    const n = window.innerWidth;
    let s = 15; // 3 ряди по 5 відео для широких екранів
    if (n >= 600 && n < 900) s = 12; // 3 ряди по 4 відео
    else if (n < 600) s = 9; // 3 ряди по 3 відео
    const i = [], r = Object.keys(playlistIds);
    for (const t of r) {
      const a = playlistIds[t], n = await fetchWithKey(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${a}&maxResults=50`);
      if (!n.ok) continue;
      const s = await n.json(), r = s.items.filter(e => e.snippet && e.snippet.resourceId && e.snippet.resourceId.videoId && e.snippet.title !== "Private video" && e.snippet.title !== "Deleted video" && e.status && e.status.privacyStatus === "public");
      i.push(...r);
    }
    const c = i.map(e => e.snippet.resourceId.videoId), o = await filterNonShorts(c);
    const l = i.filter(e => o.includes(e.snippet.resourceId.videoId));
    l.sort(() => Math.random() - 0.5);
    const paginatedVideos = l.slice(0, s); // Завантажуємо 9, 12 або 15 відео
    if (paginatedVideos.length === 0) {
      e.innerHTML = "<p>Немає доступних відео. Спробуйте пізніше.</p>";
      e.classList.remove("loading");
      return;
    }
    await renderVideos(paginatedVideos, e);
    if (l.length > s) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.textContent = "Завантажити ще";
      loadMoreBtn.className = "more-btn load-more";
      loadMoreBtn.style.display = "block";
      loadMoreBtn.style.margin = "20px auto";
      loadMoreBtn.style.padding = "12px 24px";
      loadMoreBtn.style.fontSize = "18px";
      loadMoreBtn.style.fontWeight = "bold";
      loadMoreBtn.style.backgroundColor = "#ff0000";
      loadMoreBtn.style.color = "#ffffff";
      loadMoreBtn.style.border = "none";
      loadMoreBtn.style.borderRadius = "5px";
      loadMoreBtn.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.3)";
      loadMoreBtn.style.cursor = "pointer";
      loadMoreBtn.onmouseover = () => loadMoreBtn.style.backgroundColor = "#cc0000";
      loadMoreBtn.onmouseout = () => loadMoreBtn.style.backgroundColor = "#ff0000";
      loadMoreBtn.onclick = () => {
        currentPage++;
        const startIndex = (currentPage - 1) * s;
        const endIndex = startIndex + s;
        const nextVideos = l.slice(startIndex, endIndex);
        renderVideos(nextVideos, e);
        if (endIndex >= l.length) loadMoreBtn.remove();
      };
      e.after(loadMoreBtn);
    }
    localStorage.setItem(t, JSON.stringify(l));
    localStorage.setItem(a, r.toString());
  } catch (t) {
    e.innerHTML = `<p>Помилка завантаження відео: ${t.message}. Спробуйте пізніше.</p>`;
  } finally {
    e.classList.remove("loading");
  }
}

async function fetchCategoryVideos() {
  const e = document.getElementById("category-videos");
  if (!e) return;
  let t = e.dataset.category || "", a = playlistIds[t] || "";
  if (!t || !(t = new URLSearchParams(window.location.search).get("category") || "", a = playlistIds[t] || "", Object.keys(playlistIds).includes(t)) && window.location.pathname.includes("category.html")) {
    window.location.replace("https://znannia.github.io/test/");
    return;
  }
  const n = document.getElementById("category-title");
  if (n) n.textContent = t || "Вікторини та тести";
  const s = document.getElementById("category-description");
  if (s) s.textContent = categoryDescriptions[t] || "Цікаві тести та вікторини для всієї родини!";
  document.title = `Вікторини з ${t || "Категорії"} - Знання для всіх`;
  const i = document.querySelector('meta[name="description"]');
  if (i) i.setAttribute("content", categoryDescriptions[t] || "Дивіться вікторини та тести з категорії на YouTube-каналі Знання для всіх. Цікаво для всієї родини!");
  const r = document.querySelector('meta[name="keywords"]') || document.createElement("meta");
  r.name = "keywords";
  r.content = `знання для всіх, вікторини, тести, ${t || "категорії"}, освіта, розваги для родини`;
  document.head.appendChild(r);
  const c = document.createElement("link");
  c.rel = "canonical";
  c.href = window.location.href;
  document.head.appendChild(c);
  const o = `categoryVideos_${t}`, l = `categoryVideosTime_${t}`, d = 864e5;
  e.classList.add("loading");
  const m = localStorage.getItem(o), g = localStorage.getItem(l), h = Date.now();
  let currentPage = 1;
  if (m && g && h - g < d) {
    let videos = JSON.parse(m).filter(e => e.snippet && e.snippet.title && e.snippet.title !== "Private video" && e.snippet.title !== "Deleted video" && e.snippet.resourceId && e.snippet.resourceId.videoId);
    const paginatedVideos = videos.slice(0, VIDEOS_PER_PAGE);
    if (paginatedVideos.length === 0) {
      e.innerHTML = "<p>Немає доступних відео.</p>";
      e.classList.remove("loading");
      return;
    }
    await renderVideos(paginatedVideos, e);
    if (videos.length > VIDEOS_PER_PAGE) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.textContent = "Завантажити ще";
      loadMoreBtn.className = "more-btn load-more";
      loadMoreBtn.onclick = () => {
        currentPage++;
        const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
        const endIndex = startIndex + VIDEOS_PER_PAGE;
        const nextVideos = videos.slice(startIndex, endIndex);
        renderVideos(nextVideos, e);
        if (endIndex >= videos.length) loadMoreBtn.remove();
      };
      e.after(loadMoreBtn);
    }
    localStorage.setItem(o, JSON.stringify(videos));
    e.classList.remove("loading");
    return;
  }
  try {
    if (!a) throw new Error("Категорія не знайдена");
    const n = await fetchWithKey(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,status&playlistId=${a}&maxResults=50`);
    if (!n.ok) throw new Error(`Помилка API: ${n.status}`);
    const s = await n.json();
    let i = s.items.filter(e => e.snippet && e.snippet.resourceId && e.snippet.resourceId.videoId && e.snippet.title && e.snippet.title !== "Private video" && e.snippet.title !== "Deleted video" && e.status && e.status.privacyStatus === "public"),
        r = i.map(e => e.snippet.resourceId.videoId), c = await filterNonShorts(r, t);
    i = i.filter(e => c.includes(e.snippet.resourceId.videoId));
    const paginatedVideos = i.slice(0, VIDEOS_PER_PAGE);
    if (paginatedVideos.length === 0) {
      const t = await fetch("/fallback-videos.json");
      if (t.ok) i = await t.json();
      else {
        e.innerHTML = "<p>Немає доступних відео.</p>";
        e.classList.remove("loading");
        return;
      }
    }
    await renderVideos(paginatedVideos, e);
    if (i.length > VIDEOS_PER_PAGE) {
      const loadMoreBtn = document.createElement("button");
      loadMoreBtn.textContent = "Завантажити ще";
      loadMoreBtn.className = "more-btn load-more";
      loadMoreBtn.onclick = () => {
        currentPage++;
        const startIndex = (currentPage - 1) * VIDEOS_PER_PAGE;
        const endIndex = startIndex + VIDEOS_PER_PAGE;
        const nextVideos = i.slice(startIndex, endIndex);
        renderVideos(nextVideos, e);
        if (endIndex >= i.length) loadMoreBtn.remove();
      };
      e.after(loadMoreBtn);
    }
    localStorage.setItem(o, JSON.stringify(i));
    localStorage.setItem(l, h.toString());
  } catch (t) {
    try {
      const a = await fetch("/fallback-videos.json");
      if (a.ok) await renderVideos(await a.json(), e);
      else e.innerHTML = `<p>Помилка завантаження відео: ${t.message}. Спробуйте пізніше.</p>`;
    } catch (a) {
      e.innerHTML = `<p>Помилка завантаження відео: ${t.message}. Спробуйте пізніше.</p>`;
    }
  } finally {
    e.classList.remove("loading");
  }
}

document.getElementById("categories-btn")?.addEventListener("click", () => {
  const e = document.getElementById("categories-list"), t = e.style.display === "none";
  e.style.display = t ? "block" : "none";
  e.previousElementSibling.setAttribute("aria-expanded", t);
});

// Оновлена логіка для завантаження статей
document.addEventListener('DOMContentLoaded', () => {
  const factsList = document.getElementById('facts-list');
  if (!factsList) return;

  fetch('facts/articles/articles.json')
    .then(response => response.json())
    .then(articles => {
      factsList.innerHTML = ''; // Очищаємо статичний контент

      // Відображаємо всі статті на facts.html, 6 статей на інших сторінках
      const articlesToDisplay = window.location.pathname.includes('facts.html') ? articles : articles.slice(0, 6);

      articlesToDisplay.forEach(article => {
        const factItem = document.createElement('div');
        factItem.className = 'fact-item';
        factItem.innerHTML = `
          <a href="${article.url}" class="fact-link">
            <img src="${article.thumbnail}" alt="${article.title}" class="thumbnail" loading="lazy">
            <h4>${article.title}</h4>
          </a>
          <div class="fact-lead">
            <p>${article.description}...</p>
            <a href="${article.url}" class="read-more-btn">Читати далі</a>
          </div>
        `;
        factsList.appendChild(factItem);
      });
    })
    .catch(error => {
      console.error('Помилка завантаження статей:', error);
      factsList.innerHTML = '<p>Не вдалося завантажити статті. Спробуйте пізніше.</p>';
    });
});

fetchSubscribers();
document.getElementById("latest-videos") && fetchLatestVideos();
document.getElementById("random-videos") && fetchRandomVideos();
document.getElementById("category-videos") && fetchCategoryVideos();
