const themeSwitch = document.getElementById('checkbox');
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
            generalObserver.unobserve(entry.target); // Corrected: use generalObserver instead of undefined 'observer'
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
                // If there's only one slide, hide buttons and dots
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
