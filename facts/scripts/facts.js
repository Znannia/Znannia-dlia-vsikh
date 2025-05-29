// facts.js - Скрипт для обробки статей і секції "Читайте також"

document.addEventListener('DOMContentLoaded', () => {
  // 1. Обробка списку статей для facts.html
  const factsList = document.getElementById('facts-list');
  if (factsList) {
    fetch('facts/articles/articles.json')
      .then(response => {
        if (!response.ok) throw new Error('Не вдалося завантажити articles.json');
        return response.json();
      })
      .then(articles => {
        factsList.innerHTML = ''; // Очищаємо контейнер
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
  }

  // 2. Обробка секції "Читайте також" для окремих статей
  const relatedArticlesList = document.getElementById('related-articles');
  if (relatedArticlesList) {
    // Визначаємо поточну статтю за URL
    const currentPath = window.location.pathname;
    const currentSlug = currentPath.split('/').slice(-2, -1)[0]; // Наприклад, 'space-facts'

    fetch('facts/articles/articles.json')
      .then(response => {
        if (!response.ok) throw new Error('Не вдалося завантажити articles.json');
        return response.json();
      })
      .then(articles => {
        // Фільтруємо статті, виключаючи поточну
        const availableArticles = articles.filter(
          article => !article.url.includes(currentSlug)
        );

        // Отримуємо категорію поточної статті (якщо є)
        const currentArticle = articles.find(article => article.url.includes(currentSlug));
        const currentCategory = currentArticle?.category || '';

        // Вибираємо статті: спочатку з тієї ж категорії, потім випадкові
        let relatedArticles = [];
        if (currentCategory) {
          relatedArticles = availableArticles
            .filter(article => article.category === currentCategory)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);
        }
        // Якщо недостатньо статей у категорії, додаємо випадкові
        if (relatedArticles.length < 3) {
          const extraArticles = availableArticles
            .filter(article => !relatedArticles.some(r => r.url === article.url))
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - relatedArticles.length);
          relatedArticles.push(...extraArticles);
        }

        // Зберігаємо вибрані статті в localStorage для уникнення повторів
        const usedArticlesKey = `used_related_articles_${currentSlug}`;
        localStorage.setItem(usedArticlesKey, JSON.stringify(relatedArticles.map(a => a.url)));

        // Рендеримо статті
        relatedArticlesList.innerHTML = '';
        relatedArticles.forEach(article => {
          const li = document.createElement('li');
          li.innerHTML = `<a href="/${article.url}">${article.title}</a>`;
          relatedArticlesList.appendChild(li);
        });
      })
      .catch(error => {
        console.error('Помилка завантаження "Читайте також":', error);
        relatedArticlesList.innerHTML = '<li>Не вдалося завантажити статті</li>';
      });
  }
});
