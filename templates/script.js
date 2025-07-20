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

// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    loadAllNews();
    fetchWeather();
    
    // Reload all news every 30 minutes
    setInterval(loadAllNews, 1800000);
});