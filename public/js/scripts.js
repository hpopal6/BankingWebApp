async function fetchExchangeRates() {
    let response = await fetch('/exchange-rates');
    let data = await response.json();
    return data.conversion_rates;
}

async function convertCurrency(amount, fromCurrency, toCurrency) {
    let rates = await fetchExchangeRates();
    let rate = rates[toCurrency] / rates[fromCurrency];
    return amount * rate;
}

async function fetchFinancialNews() {
    let response = await fetch('/financial-news');
    let articles = await response.json();
    displayNewsArticles(articles);
}

function displayNewsArticles(articles) {
    let newsSection = document.getElementById('news');
    articles.forEach(article => {
        let newsItem = document.createElement('div');
        newsItem.innerHTML = `
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        `;
        newsSection.appendChild(newsItem);
    });
}

// Example usage
convertCurrency(100, 'USD', 'EUR').then(amountInEUR => {
    console.log(`100 USD is equivalent to ${amountInEUR} EUR`);
});

// Fetch and display financial news on page load
fetchFinancialNews();

async function convertTransactions() {
    let currency = document.getElementById('currency').value;
    let amounts = document.querySelectorAll('.transaction-amount');
    for (let amount of amounts) {
        let originalAmount = parseFloat(amount.getAttribute('data-original-amount'));
        let originalCurrency = amount.getAttribute('data-original-currency');
        let convertedAmount = await convertCurrency(originalAmount, originalCurrency, currency);
        amount.textContent = `${convertedAmount.toFixed(2)} ${currency}`;
    }
}
