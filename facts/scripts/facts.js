// facts.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('facts.js завантажено');
  const factsList = document.getElementById('facts-list');
  if (factsList) {
    console.log('facts-list знайдено');
    fetch('/facts/articles/articles.json') // Абсолютний шлях
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(articles => {
        console.log('Статті:', articles);
        factsList.innerHTML = '';
        const articlesToDisplay = window.location.pathname.includes('facts.html') ? articles : articles.slice(0, 6);
        if (articlesToDisplay.length === 0) {
          factsList.innerHTML = '<p>Немає доступних статей.</p>';
          return;
        }
        articlesToDisplay.forEach(article => {
          const factItem = document.createElement('div');
          factItem.className = 'fact-item';
          factItem.innerHTML = `
            <a href="${article.url}" class="fact-link">
              <img src="${article.image}" alt="${article.title}" class="thumbnail-img" loading="lazy">
              <h3>${article.title}</h3>
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
  } else {
    console.log('facts-list не знайдено');
  }

  // Логіка для "Читайте також"
  const relatedArticlesList = document.getElementById('related-articles');
  if (relatedArticlesList) {
    // ... (без змін)
  }
});
