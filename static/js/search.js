const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

let fuse;

// Fetch the index
fetch('/index.json?v=' + new Date().getTime())
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log('Search index loaded:', data.length, 'items');
        const options = {
            keys: [
                { name: 'title', weight: 0.5 }, // Balanced weights
                { name: 'tags', weight: 0.3 },
                { name: 'categories', weight: 0.3 },
                { name: 'summary', weight: 0.4 },
                { name: 'contents', weight: 0.5 }
            ],
            threshold: 0.1, // Very strict matching to avoid irrelevant results
            minMatchCharLength: 1,
            ignoreLocation: true,
            useExtendedSearch: true
        };
        fuse = new Fuse(data, options);
    })
    .catch(error => {
        console.error('Error loading search index:', error);
        document.getElementById('search-results').innerHTML = '<p style="color:red">Erreur de chargement de la recherche. Vérifiez la console.</p>';
    });

// Handle input
searchInput.addEventListener('input', (e) => {
    if (!fuse) return;

    const query = e.target.value;
    const results = fuse.search(query);

    if (query.length === 0) {
        searchResults.innerHTML = '';
        return;
    }

    let html = '';
    if (results.length > 0) {
        results.slice(0, 10).forEach(result => { // Limit to top 10 results
            const item = result.item;
            // Ensure we have a string and strip any remaining HTML just in case
            let content = item.summary || item.contents || '';
            // Create a temporary element to strip HTML
            let tempDiv = document.createElement("div");
            tempDiv.innerHTML = content;
            let plainText = tempDiv.textContent || tempDiv.innerText || "";

            let snippet = plainText.substring(0, 80) + (plainText.length > 80 ? '...' : '');

            html += `
                <div class="search-result-item">
                    <h3><a href="${item.permalink}">${item.title}</a></h3>
                    <p>${snippet}</p>
                    <small>${new Date(item.date).toLocaleDateString('fr-FR')}</small>
                </div>
            `;
        });
    } else {
        html = '<p>Aucun résultat trouvé.</p>';
    }

    searchResults.innerHTML = html;
});
