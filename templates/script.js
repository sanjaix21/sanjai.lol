// News API functions
async function fetchHackerNews() {
    try {
        const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const storyIds = await response.json();
        
        const stories = [];
        for (let i = 0; i < 5; i++) {
            try {
                const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`);
                const story = await storyResponse.json();
                if (story && story.title) {
                    stories.push(story);
                }
            } catch (error) {
                console.error('Error fetching story:', error);
            }
        }
        return stories;
    } catch (error) {
        console.error('Error fetching Hacker News:', error);
        return [];
    }
}

async function fetchArxivPapers() {
    try {
        const response = await fetch('https://export.arxiv.org/api/query?search_query=all:artificial+intelligence&start=0&max_results=3&sortBy=submittedDate&sortOrder=descending');
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'text/xml');
        const entries = xml.querySelectorAll('entry');
        
        const papers = [];
        entries.forEach(entry => {
            const title = entry.querySelector('title')?.textContent?.trim();
            const summary = entry.querySelector('summary')?.textContent?.trim();
            const published = entry.querySelector('published')?.textContent?.trim();
            
            if (title && summary) {
                papers.push({
                    title: title,
                    summary: summary.substring(0, 200) + '...',
                    published: published ? new Date(published).toLocaleDateString() : 'Recent'
                });
            }
        });
        
        return papers;
    } catch (error) {
        console.error('Error fetching arXiv papers:', error);
        return [];
    }
}

async function fetchRedditPosts() {
    try {
        const subreddits = ['technology', 'linux', 'programming'];
        const randomSub = subreddits[Math.floor(Math.random() * subreddits.length)];
        const response = await fetch(`https://www.reddit.com/r/${randomSub}/hot.json?limit=3`);
        const data = await response.json();
        
        const posts = [];
        if (data.data && data.data.children) {
            data.data.children.forEach(child => {
                const post = child.data;
                if (post.title && !post.over_18) {
                    posts.push({
                        title: post.title,
                        score: post.score,
                        subreddit: post.subreddit,
                        created: new Date(post.created_utc * 1000).toLocaleDateString()
                    });
                }
            });
        }
        
        return posts;
    } catch (error) {
        console.error('Error fetching Reddit posts:', error);
        return [];
    }
}

function createNewsArticle(title, content, byline, timestamp) {
    return `
        <div class="article">
            <div class="article-title">${title}</div>
            ${byline ? `<div class="byline">${byline}</div>` : ''}
            <div class="article-text">${content}</div>
            ${timestamp ? `<div class="byline">Published: ${timestamp}</div>` : ''}
        </div>
    `;
}

function displayTechNews(stories) {
    const techNewsDiv = document.getElementById('techNews');
    let html = '';
    
    stories.forEach(story => {
        const timestamp = story.time ? new Date(story.time * 1000).toLocaleDateString() : '';
        html += createNewsArticle(
            story.title,
            `Breaking developments in technology sector. Industry experts weigh in on implications for the digital future.`,
            'By Tech Correspondent',
            timestamp
        );
    });
    
    techNewsDiv.innerHTML = html;
}

function displayScienceNews(papers) {
    const scienceNewsDiv = document.getElementById('scienceNews');
    let html = '';
    
    papers.forEach(paper => {
        html += createNewsArticle(
            paper.title,
            paper.summary,
            'By Research Correspondent',
            paper.published
        );
    });
    
    scienceNewsDiv.innerHTML = html;
}

function displayAltNews(posts) {
    const altNewsDiv = document.getElementById('altNews');
    let html = '';
    
    posts.forEach(post => {
        html += createNewsArticle(
            post.title,
            `Community discussion gaining traction on r/${post.subreddit}. Score: ${post.score} points.`,
            'By Alternative Media',
            post.created
        );
    });
    
    // Add some fake weird news
    html += createNewsArticle(
        'Local Developer Discovers Coffee Machine API',
        'In a shocking turn of events, a programmer has successfully reverse-engineered their office coffee machine, leading to unprecedented caffeine optimization.',
        'By Weird News Bureau',
        'Today'
    );
    
    altNewsDiv.innerHTML = html;
}

async function loadAllNews() {
    try {
        const [hackerNews, arxivPapers, redditPosts] = await Promise.all([
            fetchHackerNews(),
            fetchArxivPapers(),
            fetchRedditPosts()
        ]);
        
        displayTechNews(hackerNews);
        displayScienceNews(arxivPapers);
        displayAltNews(redditPosts);
        
    } catch (error) {
        console.error('Error loading news:', error);
        // Fallback content
        document.getElementById('techNews').innerHTML = createNewsArticle(
            'Digital Infrastructure Expands Globally',
            'Technology companies continue to push the boundaries of what\'s possible in the digital realm.',
            'By Tech Correspondent',
            'Today'
        );
    }
}

// Weather fetching function
async function fetchWeather() {
    const weatherElement = document.getElementById('weatherInfo');
    
    try {
        const response = await fetch('https://wttr.in/Phagwara?format=3');
        if (response.ok) {
            const weatherData = await response.text();
            weatherElement.textContent = `Weather Today ${weatherData.trim()}`;
        } else {
            throw new Error('Weather service unavailable');
        }
    } catch (error) {
        weatherElement.textContent = 'Could not fetch weather today.';
    }
}

async function fetchGoldPrice() {
    const goldElement = document.getElementById('goldPrice');
    if (!goldElement) return;

    try {
        const headers = new Headers();
        headers.append("x-access-token", "goldapi-84xysmdat7oe4-io");
        headers.append("Content-Type", "application/json");

        const requestOptions = {
            method: 'GET',
            headers: headers,
            redirect: 'follow'
        };

        const response = await fetch("https://www.goldapi.io/api/XAU/INR", requestOptions);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Extract 24k gold price per gram
        const goldPrice24k = data.price_gram_24k;
        const changePercent = data.chp;
        const changeAmount = data.ch;
        
        // Format the display
        const changeIndicator = changeAmount >= 0 ? '↗' : '↘';
        const changeColor = changeAmount >= 0 ? '#4CAF50' : '#F44336';
        
        goldElement.innerHTML = `
            <div style="font-size: 1.3rem; font-weight: bold; margin-bottom: 5px;">
                ₹${goldPrice24k.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}/g
            </div>
            <div style="font-size: 0.9rem; color: ${changeColor};">
                ${changeIndicator} ${changePercent.toFixed(2)}% (₹${Math.abs(changeAmount).toFixed(2)})
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                24K Gold • Live Rates
            </div>
        `;
        
    } catch (error) {
        console.error('Gold price fetch error:', error);
        goldElement.innerHTML = `
            <div style="font-size: 1.2rem; font-weight: bold;">
                ₹9,388/g
            </div>
            <div style="font-size: 0.8rem; color: #666; margin-top: 5px;">
                Rates may be delayed
            </div>
        `;
    }
}

async function addRandomImages() {
    const newspaper = document.querySelector('.newspaper');
    const validImages = [];
    
    // Find all existing images starting from image_1.jpg
    for (let i = 1; i <= 200; i++) { // Check up to image_200.jpg, adjust as needed
        const img = new Image();
        const imageName = `image_${i}.jpg`;
        img.src = `img/front_page/${imageName}`;
        
        try {
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    validImages.push(imageName);
                    resolve();
                };
                img.onerror = () => reject();
                setTimeout(() => reject(), 500); // Timeout after 500ms
            });
        } catch (e) {
            // Image doesn't exist, continue checking
            continue;
        }
    }
    
    // Now randomly place the found images
    const numImages = Math.floor(Math.random() * 8) + 5;
    for (let i = 0; i < numImages && validImages.length > 0; i++) {
        const img = document.createElement('img');
        const randomImage = validImages[Math.floor(Math.random() * validImages.length)];
        
        img.src = `img/front_page/${randomImage}`;
        img.className = 'random-front-page-img';
        img.style.left = Math.random() * 85 + '%';
        img.style.top = Math.random() * 80 + 20 + '%';
        img.style.transform = `rotate(${(Math.random() - 0.5) * 30}deg)`;
        img.style.opacity = 0.1 + Math.random() * 0.15;
        
        newspaper.appendChild(img);
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    loadAllNews();
    fetchWeather();
    fetchGoldPrice();
    addRandomImages();
    // Reload all news every 30 minutes
    //
    setInterval(() => {
        loadAllNews();
        fetchGoldPrice();
    }, 1800000);
});
