:root {
    --background-color: #f8f8f8;const themeSwitch = document.getElementById('checkbox');
const body = document.body;

function setTheme(themeName) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(themeName);
    localStorage.setItem('theme', themeName);
    if (themeSwitch) { // Check if themeSwitch exists before setting checked property
        themeSwitch.checked = (themeName === 'dark-theme');
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    // Determine default theme based on user's system preference if no theme saved
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark-theme');
    } else {
        setTheme('light-theme');
    }
}

if (themeSwitch) { // Ensure themeSwitch exists before adding event listener
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            setTheme('dark-theme');
        } else {
            setTheme('light-theme');
        }
    });
}


// Intersection Observer for fade-in animations
const sections = document.querySelectorAll('section');
// Use a more specific selector for news items on the news page to avoid conflicts if IDs are similar
const newsItemsOnNewsPage = document.querySelectorAll('#news .news-item'); 
const contactListItems = document.querySelectorAll('#contact ul li');
const mapContainer = document.getElementById('map-container');

const observerOptions = {
    threshold: 0.1 // Trigger when 10% of the element is visible
};

const generalObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            generalObserver.unobserve(entry.target); // Stop observing once animated
        }
    });
}, observerOptions);

// Observe sections on all pages
sections.forEach(section => {
    generalObserver.observe(section);
});

// Observe news items ONLY if they are on the current page (news.html)
if (window.location.pathname.includes('news.html')) {
    newsItemsOnNewsPage.forEach(item => {
        generalObserver.observe(item);
    });
}

// Observe contact list items
contactListItems.forEach(item => {
    generalObserver.observe(item);
});

// Observe map container
if (mapContainer) { // Check if mapContainer exists before observing
    generalObserver.observe(mapContainer);
}


// Smooth page transitions
document.addEventListener('DOMContentLoaded', () => {
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        // Only apply to internal links that are not anchor links on the same page
        // and do not have "target=_blank" (which means opening in a new tab)
        if (link.hostname === window.location.hostname && 
            link.getAttribute('href') && 
            !link.getAttribute('href').startsWith('#') &&
            link.getAttribute('target') !== '_blank') {
            
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                if (href) { // Ensure href is not null
                    event.preventDefault(); // Prevent default link behavior
                    document.body.classList.add('fade-out'); // Add fade-out class to body

                    setTimeout(() => {
                        window.location.href = href; // Navigate after fade-out
                    }, 300); // Match this duration with your fadeOut animation duration in CSS
                }
            });
        }
    });

    // Remove fade-out class when page loads to show content
    // This handles initial page load and when navigating back/forward in history
    if (document.body.classList.contains('fade-out')) {
        document.body.classList.remove('fade-out');
    }

    // --- Slider functionality (only on index.html) ---
    const newsSliderSection = document.getElementById('news-slider');
    if (newsSliderSection) { // Ensure this section exists on the current page (index.html)
        const sliderWrapper = newsSliderSection.querySelector('.slider-wrapper');
        const prevButton = newsSliderSection.querySelector('.slider-button.prev');
        const nextButton = newsSliderSection.querySelector('.slider-button.next');
        const sliderDotsContainer = newsSliderSection.querySelector('.slider-dots');

        let newsData = [];
        let currentSlide = 0;
        const numberOfSlidesToShow = 3; // We explicitly want to show the first 3 news items from news.html

        async function fetchNewsData() {
            try {
                // Ensure news.html is in the same directory or provide correct path
                const response = await fetch('news.html');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const text = await response.text();
                const parser = new DOMParser();
                const doc = parser.parseFromString(text, 'text/html');
                // Select all news items from the parsed news.html content
                const newsArticlesFromFetchedPage = doc.querySelectorAll('#news .news-item'); 

                // Take only the first `numberOfSlidesToShow` (i.e., 3) news items for the slider
                Array.from(newsArticlesFromFetchedPage).slice(0, numberOfSlidesToShow).forEach(article => {
                    const imageElement = article.querySelector('.news-image img');
                    const linkElement = article.querySelector('.news-content a');
                    const titleElement = article.querySelector('.news-content h3 a');
                    const descriptionElement = article.querySelector('.news-content p');

                    const imageSrc = imageElement ? imageElement.src : '';
                    const imageAlt = imageElement ? imageElement.alt : '';
                    const linkHref = linkElement ? linkElement.href : '';
                    const title = titleElement ? titleElement.textContent.trim() : '';
                    const description = descriptionElement ? descriptionElement.textContent.trim() : '';

                    if (linkHref && title) { // Only add if essential data (link and title) is present
                        newsData.push({ imageSrc, imageAlt, linkHref, title, description });
                    }
                });

                if (newsData.length > 0) {
                    displayNewsForSlider(); // Display the selected news items
                    startAutoSlide(); // Start auto-slide only after news are loaded
                } else {
                    sliderWrapper.innerHTML = '<p style="text-align: center; color: var(--text-color);">Не знайдено новин для слайдера.</p>';
                }

            } catch (error) {
                console.error('Помилка при завантаженні новин для слайдера:', error);
                sliderWrapper.innerHTML = '<p style="text-align: center; color: var(--text-color);">Не вдалося завантажити новини для слайдера. Переконайтеся, що файл news.html існує та доступний через локальний веб-сервер.</p>';
            }
        }

        // Function to display the news items in the slider
        function displayNewsForSlider() {
            if (newsData.length === 0) return;

            sliderWrapper.innerHTML = ''; // Clear previous items in the wrapper
            sliderDotsContainer.innerHTML = ''; // Clear previous dots

            newsData.forEach((news, index) => {
                const slideItem = document.createElement('div');
                slideItem.classList.add('slider-item');
                slideItem.innerHTML = `
                    <div class="news-image">
                        <a href="${news.linkHref}" target="_blank" rel="noopener noreferrer">
                            <img src="${news.imageSrc}" alt="${news.imageAlt}" onerror="this.onerror=null;this.src='https://via.placeholder.com/220x220?text=Зображення+не+знайдено';" />
                        </a>
                    </div>
                    <div class="news-content">
                        <h3><a href="${news.linkHref}" target="_blank" rel="noopener noreferrer">${news.title}</a></h3>
                        <p>${news.description}</p>
                    </div>
                `;
                sliderWrapper.appendChild(slideItem);

                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.dataset.slideIndex = index;
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
                sliderDotsContainer.appendChild(dot);
            });

            currentSlide = 0; // Reset to the first slide
            updateSlider(); // Update slider position and dot active state

            // Show/hide navigation buttons and dots based on number of slides
            if (newsData.length > 1) {
                if (prevButton) prevButton.style.display = 'block';
                if (nextButton) nextButton.style.display = 'block';
                if (sliderDotsContainer) sliderDotsContainer.style.display = 'flex';
            } else {
                if (prevButton) prevButton.style.display = 'none';
                if (nextButton) nextButton.style.display = 'none';
                if (sliderDotsContainer) sliderDotsContainer.style.display = 'none';
            }
        }

        function updateSlider() {
            // Only attempt to transform if there are slides
            if (newsData.length === 0) {
                return;
            }
            const offset = -currentSlide * 100; // Each slide takes 100% width
            sliderWrapper.style.transform = `translateX(${offset}%)`;

            document.querySelectorAll('#news-slider .dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function goToSlide(index) {
            if (index < 0 || index >= newsData.length) {
                return; // Prevent out-of-bounds index
            }
            currentSlide = index;
            updateSlider();
        }

        // Add event listeners for slider buttons
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                // Calculate previous slide index, wrapping around to the end if at the beginning
                currentSlide = (currentSlide - 1 + newsData.length) % newsData.length;
                updateSlider();
            });
        }

        if (nextButton) {
            nextButton.addEventListener('click', () => {
                // Calculate next slide index, wrapping around to the beginning if at the end
                currentSlide = (currentSlide + 1) % newsData.length;
                updateSlider();
            });
        }

        let autoSlideInterval;
        function startAutoSlide() {
            // Only start auto-slide if there's more than one slide
            if (newsData.length > 1) {
                clearInterval(autoSlideInterval); // Clear any existing interval to prevent duplicates
                autoSlideInterval = setInterval(() => {
                    if (nextButton) nextButton.click(); // Simulate click on next button
                }, 5000); // Change slide every 5 seconds (5000 milliseconds)
            }
        }

        const sliderContainer = document.querySelector('#news-slider .slider-container');
        if (sliderContainer) { // Check if slider container exists
            // Pause auto-slide on mouse enter, resume on mouse leave
            sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
            sliderContainer.addEventListener('mouseleave', startAutoSlide);
        }

        // Initial call to fetch and display news when the DOM is fully loaded, ONLY on index.html
        fetchNewsData();
    }
});
    --text-color: #333;
    --header-gradient-start: #e0e0e0;
    --header-gradient-middle: #f0f0f0;
    --header-gradient-end: #e0e0e0;
    --section-bg: #ffffff;
    --heading-color: #4a4a4a;
    --border-color: #d0d0d0;
    --accent-color: #a0522d;
    --news-item-bg: #ffffff;
    --news-heading-color: #555;
    --news-text-color: #666;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    --news-item-border: 1px solid #e5e5e5;
    --hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    --header-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

body.dark-theme {
    --background-color: #2b2b2b;
    --text-color: #e0e0e0;
    --header-gradient-start: #3a3a3a;
    --header-gradient-middle: #4a4a4a;
    --header-gradient-end: #3a3a3a;
    --section-bg: #3c3c3c;
    --heading-color: #d2b48c;
    --border-color: #8b4513;
    --accent-color: #8b4513;
    --news-item-bg: #4a4a4a;
    --news-heading-color: #f5deb3;
    --news-text-color: #c0c0c0;
    --box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    --news-item-border: 1px solid #5a5a5a;
    --hover-shadow: 0 8px 20px rgba(0, 0, 0, 0.6);
    --header-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

body {
    font-family: 'Roboto', sans-serif;
    margin: 0;
    background-color: var(--background-color);
    color: var(--text-color);
    line-height: 1.6;
    scroll-behavior: smooth;
    transition: background-color 0.5s ease, color 0.5s ease;
    overflow-x: hidden;
}

/* Animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
}

@keyframes fadeOut {
    from { opacity: 1; }
    to { opacity: 0; }
}

.fade-out {
    animation: fadeOut 0.3s ease-out forwards;
}

header {
    background: linear-gradient(90deg, var(--header-gradient-start), var(--header-gradient-middle), var(--header-gradient-end));
    color: var(--text-color);
    padding: 1.5rem 1rem;
    text-align: center;
    box-shadow: var(--header-shadow);
    position: sticky;
    top: 0;
    z-index: 1000;
    animation: fadeIn 1s ease-out;
    transition: background 0.5s ease, color 0.5s ease, box-shadow 0.5s ease;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-left {
    display: flex;
    align-items: center;
    margin-left: 20px;
}

.logo-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: inherit;
    transition: transform 0.3s ease, color 0.3s ease;
}

.logo-link:hover {
    transform: scale(1.05);
    color: var(--accent-color);
}

.header-logo {
    height: 40px;
    width: 40px;
    margin-right: 10px;
    transition: transform 0.3s ease;
}

.logo-link:hover .header-logo {
    transform: rotate(5deg);
}

.site-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.8rem;
    color: var(--text-color);
    white-space: nowrap;
    text-decoration: none;
    text-decoration-color: transparent;
    text-underline-offset: 4px;
    text-decoration-thickness: 2px;
    transition: color 0.3s ease, text-decoration-color 0.3s ease;
}

.logo-link:hover .site-title {
    text-decoration: underline;
    text-decoration-color: var(--accent-color);
    color: var(--accent-color);
}

nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    justify-content: flex-end;
    margin-right: 20px;
}

nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
    gap: 3rem;
}

nav ul li {
    font-weight: 700;
    font-size: 1.2rem;
}

nav ul li a {
    color: var(--text-color);
    text-decoration: none;
    transition: color 0.3s ease, transform 0.2s ease, text-decoration-color 0.3s ease;
    position: relative;
}

nav ul li a:hover {
    color: var(--accent-color);
    transform: translateY(-2px);
    animation: pulse 0.5s infinite alternate;
    text-decoration: underline;
    text-decoration-color: var(--accent-color);
    text-underline-offset: 5px;
    text-decoration-thickness: 3px;
}

.theme-switch-wrapper {
    display: flex;
    align-items: center;
    z-index: 1001;
    margin-left: 30px;
}

.theme-switch {
    display: inline-block;
    height: 34px;
    position: relative;
    width: 60px;
}

.theme-switch input {
    display: none;
}

.slider {
    background-color: #ccc;
    bottom: 0;
    cursor: pointer;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    transition: .4s;
    border-radius: 34px;
}

.slider:before {
    background-color: #fff;
    bottom: 4px;
    content: "";
    height: 26px;
    left: 4px;
    position: absolute;
    transition: .4s;
    width: 26px;
    border-radius: 50%;
}

input:checked + .slider {
    background-color: var(--accent-color);
}

input:checked + .slider:before {
    transform: translateX(26px);
}

.theme-switch-wrapper span {
    margin-right: 10px;
    font-size: 1.1rem;
    color: var(--text-color);
    font-weight: 500;
    transition: color 0.5s ease;
}

main {
    max-width: 1200px;
    margin: 3rem auto;
    padding: 0 1.5rem;
}

section {
    background: var(--section-bg);
    padding: 2.5rem;
    border-radius: 12px;
    box-shadow: var(--box-shadow);
    margin-bottom: 3rem;
    transition: background-color 0.5s ease, box-shadow 0.5s ease;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeIn 0.8s ease-out forwards;
}

#about { animation-delay: 0.2s; }
#news-slider { animation-delay: 0.4s; }
#news { animation-delay: 0.6s; }
#contact { animation-delay: 0.8s; }

section h2 {
    color: var(--heading-color);
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 2.5rem;
    margin-bottom: 1.8rem;
    border-bottom: 4px solid var(--border-color);
    padding-bottom: 0.5rem;
    text-align: center;
    position: relative;
    transition: color 0.5s ease, border-color 0.5s ease;
}

section h2::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -8px;
    width: 50px;
    height: 8px;
    background-color: var(--accent-color);
    border-radius: 5px;
    transition: background-color 0.5s ease;
}

#about p {
    font-size: 1.15rem;
    max-width: 950px;
    margin: 0 auto 1.5rem;
    color: var(--text-color);
    text-align: justify;
    line-height: 1.8;
    transition: color 0.5s ease;
}

.news-list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2.5rem;
}

.news-item {
    background: var(--news-item-bg);
    border-radius: 15px;
    box-shadow: var(--box-shadow);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.5s ease, background-color 0.5s ease, border-color 0.5s ease;
    cursor: pointer;
    border: var(--news-item-border);
    opacity: 0;
    transform: translateY(20px);
    animation: fadeIn 0.8s ease-out forwards;
}

#news .news-item:nth-child(1) { animation-delay: 1.0s; }
#news .news-item:nth-child(2) { animation-delay: 1.1s; }
#news .news-item:nth-child(3) { animation-delay: 1.2s; }
#news .news-item:nth-child(4) { animation-delay: 1.3s; }
#news .news-item:nth-child(5) { animation-delay: 1.4s; }
#news .news-item:nth-child(6) { animation-delay: 1.5s; }
#news .news-item:nth-child(7) { animation-delay: 1.6s; }
#news .news-item:nth-child(8) { animation-delay: 1.7s; }


.news-item:hover {
    transform: translateY(-10px) scale(1.02);
    box-shadow: var(--hover-shadow);
}

.news-image {
    position: relative;
    overflow: hidden;
}

.news-image img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    transition: transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.news-item:hover .news-image img {
    transform: scale(1.1);
}

.news-image::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--news-overlay-color, rgba(0, 82, 212, 0.2));
    opacity: 0;
    transition: opacity 0.3s ease, background-color 0.5s ease;
}

body.dark-theme .news-image::before {
    --news-overlay-color: rgba(139, 69, 19, 0.4);
}


.news-item:hover .news-image::before {
    opacity: 1;
}

.news-content {
    padding: 1.5rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.news-content h3 {
    color: var(--news-heading-color);
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    margin: 0 0 1rem;
    font-size: 1.45rem;
    line-height: 1.3;
    transition: color 0.5s ease;
}

.news-content p {
    flex: 1;
    font-size: 1.05rem;
    color: var(--news-text-color);
    margin-bottom: 1.2rem;
    transition: color 0.5s ease;
}

.news-content a {
    align-self: flex-start;
    font-weight: 700;
    color: var(--heading-color);
    text-decoration: underline;
    text-decoration-color: transparent;
    text-underline-offset: 5px;
    text-decoration-thickness: 3px;
    padding: 0.6rem 0;
    transition: text-decoration-color 0.3s ease, color 0.3s ease;
}

.news-content a:hover {
    color: var(--accent-color);
    text-decoration-color: var(--accent-color);
}


#contact {
    background: var(--section-bg);
    padding: 3rem 1rem;
    margin-top: 4rem;
    border-radius: 12px;
    box-shadow: var(--box-shadow);
    max-width: 1000px;
    margin-left: auto;
    margin-right: auto;
}

#contact h2 {
    margin-top: 0;
}

#contact ul {
    list-style: none;
    padding: 0;
    font-size: 1.15rem;
    color: var(--text-color);
    margin-bottom: 2rem;
    transition: color 0.5s ease;
}

#contact ul li {
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    opacity: 0;
    transform: translateX(-20px);
    animation: slideInFromLeft 0.8s ease-out forwards;
}
#contact ul li:nth-child(1) { animation-delay: 0.8s; }
#contact ul li:nth-child(2) { animation-delay: 0.9s; }
#contact ul li:nth-child(3) { animation-delay: 1.0s; }
#contact ul li:nth-child(4) { animation-delay: 1.1s; }
#contact ul li:nth-child(5) { animation-delay: 1.2s; }

#contact ul li strong {
    margin-right: 0.5rem;
    color: var(--heading-color);
    transition: color 0.5s ease;
    margin-bottom: 0.5rem;
}

#contact ul li .contact-text {
    font-size: 1.1rem;
    color: var(--text-color);
    transition: color 0.5s ease;
    line-height: 1.6;
}

#contact ul li .message-content {
    font-style: italic;
    margin-top: 0.5rem;
    line-height: 1.6;
    text-align: justify;
    color: var(--news-text-color);
    transition: color 0.5s ease;
}

#contact ul li .author-signature {
    font-weight: 700;
    margin-top: 0.8rem;
    color: var(--accent-color);
    transition: color 0.5s ease;
}

#contact a {
    color: var(--heading-color);
    text-decoration: none;
    font-weight: 600;
    transition: color 0.3s ease, text-decoration-color 0.3s ease;
}

#contact a:hover {
    color: var(--accent-color);
    text-decoration: underline;
    text-decoration-color: var(--accent-color);
    text-underline-offset: 3px;
    text-decoration-thickness: 2px;
}

#map-container {
    margin-top: 2rem;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    border: 1px solid var(--news-item-border);
    opacity: 0;
    transform: translateY(20px);
    animation: fadeIn 0.8s ease-out forwards;
    animation-delay: 1.3s;
    transition: border-color 0.5s ease;
}

iframe {
    width: 100%;
    height: 350px;
    border: none;
}

footer {
    background: linear-gradient(90deg, var(--header-gradient-start), var(--header-gradient-middle), var(--header-gradient-end));
    color: var(--text-color);
    text-align: center;
    padding: 1.5rem 1rem;
    margin-top: 3rem;
    font-size: 0.95rem;
    border-top: 1px solid var(--news-item-border);
    transition: background 0.5s ease, color 0.5s ease, border-color 0.5s ease;
}

/* Slider styles */
#news-slider {
    position: relative;
    padding-bottom: 5rem;
}

.slider-container {
    position: relative;
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    overflow: hidden;
    border-radius: 15px;
    box-shadow: var(--box-shadow);
    background: var(--news-item-bg);
}

.slider-wrapper {
    display: flex;
    transition: transform 0.5s ease-in-out;
    padding: 1.5rem;
}

.slider-item {
    min-width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.slider-item .news-image {
    width: 100%;
    max-height: 300px;
    overflow: hidden;
    border-radius: 10px;
    margin-bottom: 1rem;
}

.slider-item .news-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.news-image::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--news-overlay-color, rgba(0, 82, 212, 0.2));
    opacity: 0;
    transition: opacity 0.3s ease, background-color 0.5s ease;
}

body.dark-theme .news-image::before {
    --news-overlay-color: rgba(139, 69, 19, 0.4);
}


.news-item:hover .news-image::before {
    opacity: 1;
}


.slider-item .news-content {
    padding: 0 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.slider-item .news-content h3 {
    font-size: 1.6rem;
    margin-bottom: 0.8rem;
}

.slider-item .news-content p {
    font-size: 1.1rem;
    color: var(--news-text-color);
    margin-bottom: 1.5rem;
    max-width: 80%;
}

.slider-item .news-content a {
    font-size: 1.1rem;
    white-space: nowrap;
}

.slider-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    border: none;
    padding: 1rem;
    cursor: pointer;
    font-size: 1.5rem;
    border-radius: 50%;
    z-index: 10;
    transition: background-color 0.3s ease;
    display: block; /* Ensure it's not initially hidden by default */
}

.slider-button:hover {
    background-color: rgba(0, 0, 0, 0.8);
}

.slider-button.prev {
    left: 10px;
}

.slider-button.next {
    right: 10px;
}

.slider-dots {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    z-index: 10;
    /* This will be managed by JS based on number of slides */
    display: none;
}

.dot {
    width: 12px;
    height: 12px;
    background-color: rgba(0, 0, 0, 0.3);
    border-radius: 50%;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
}

.dot.active {
    background-color: var(--accent-color);
    transform: scale(1.2);
}

/* Responsive adjustments for slider */
@media (max-width: 768px) {
    .header-left {
        margin-left: 10px;
    }

    .header-logo {
        height: 30px;
        width: 30px;
    }

    .site-title {
        font-size: 1.5rem;
    }

    nav {
        margin-right: 10px;
        flex-direction: column;
        align-items: flex-end;
    }

    nav ul {
        gap: 1rem;
        margin-bottom: 10px;
    }

    nav ul li {
        font-size: 0.9rem;
    }

    .theme-switch-wrapper {
        margin-left: 0;
    }

    main {
        margin: 2rem 1rem;
        padding: 0;
    }

    section {
        padding: 1.5rem;
        margin-bottom: 2rem;
    }

    section h2 {
        font-size: 2rem;
    }

    .news-list {
        grid-template-columns: 1fr;
    }

    .news-item {
        max-width: 90%;
        margin: 0 auto;
    }

    .news-image img {
        height: 180px;
    }

    .news-content h3 {
        font-size: 1.25rem;
    }

    #contact {
        padding: 2rem 1rem;
    }

    #contact ul li {
        align-items: flex-start;
    }

    .slider-item .news-content h3 {
        font-size: 1.4rem;
    }
    .slider-item .news-content p {
        font-size: 1rem;
    }
    .slider-button {
        padding: 0.8rem;
        font-size: 1.2rem;
    }
    .slider-button.prev {
        left: 5px;
    }
    .slider-button.next {
        right: 5px;
    }
    .slider-dots {
        bottom: 10px;
    }
}

@media (max-width: 480px) {
    .header-left {
        margin-left: 5px;
    }
    .site-title {
        font-size: 1.2rem;
    }
    nav ul {
        gap: 0.5rem;
        margin-bottom: 5px;
    }
    nav ul li {
        font-size: 0.8rem;
    }
    .theme-switch-wrapper {
        margin-right: 5px;
    }
    .slider-container {
        padding: 0 10px;
    }
    .slider-item .news-content h3 {
        font-size: 1.2rem;
    }
    .slider-item .news-content p {
        font-size: 0.9rem;
    }
    .slider-button {
        padding: 0.6rem;
        font-size: 1rem;
    }
    .slider-dots {
        bottom: 10px;
    }
}
