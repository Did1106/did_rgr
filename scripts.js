const themeSwitch = document.getElementById('checkbox');
const body = document.body;

function setTheme(themeName) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(themeName);
    localStorage.setItem('theme', themeName);
    if (themeSwitch) {
        themeSwitch.checked = (themeName === 'dark-theme');
    }
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark-theme');
    } else {
        setTheme('light-theme');
    }
}

if (themeSwitch) {
    themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            setTheme('dark-theme');
        } else {
            setTheme('light-theme');
        }
    });
}


const sections = document.querySelectorAll('section');
const newsItemsOnNewsPage = document.querySelectorAll('#news .news-item');
const contactListItems = document.querySelectorAll('#contact ul li');
const mapContainer = document.getElementById('map-container');

const observerOptions = {
    threshold: 0.1
};

const generalObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            generalObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

sections.forEach(section => {
    generalObserver.observe(section);
});

if (window.location.pathname.includes('news.html')) {
    newsItemsOnNewsPage.forEach(item => {
        generalObserver.observe(item);
    });
}

contactListItems.forEach(item => {
    generalObserver.observe(item);
});

if (mapContainer) {
    generalObserver.observe(mapContainer);
}


document.addEventListener('DOMContentLoaded', () => {
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        if (link.hostname === window.location.hostname && 
            link.getAttribute('href') && 
            !link.getAttribute('href').startsWith('#') &&
            link.getAttribute('target') !== '_blank') {
            
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                if (href) {
                    event.preventDefault();
                    document.body.classList.add('fade-out');

                    setTimeout(() => {
                        window.location.href = href;
                    }, 300);
                }
            });
        }
    });

    if (document.body.classList.contains('fade-out')) {
        document.body.classList.remove('fade-out');
    }

    // --- Slider functionality (only on index.html) ---
    const newsSliderSection = document.getElementById('news-slider');
    if (newsSliderSection) {
        const sliderWrapper = newsSliderSection.querySelector('.slider-wrapper');
        const prevButton = newsSliderSection.querySelector('.slider-button.prev');
        const nextButton = newsSliderSection.querySelector('.slider-button.next');
        const sliderDotsContainer = newsSliderSection.querySelector('.slider-dots');

        // Static data for the slider images and text with specific article URLs
        const imageData = [
            {
                imageSrc: 'https://ictv.ua/wp-content/uploads/2025/03/24/AD_visuals_8x_1200h628-copy-1.jpg',
                imageAlt: 'AI Day 2025',
                title: 'AI Day 2025: Майбутнє в Україні',
                description: 'На конференції AI Day 2025 обговорювалися ключові зміни, які штучний інтелект принесе в державу, бізнес та освіту в Україні.',
                articleUrl: 'https://ictv.ua/ua/2025/03/24/ai-day-2025-yak-shtuchnyj-intelekt-zminyt-derzhavu-biznes-ta-osvitu-ukrayiny/' // Specific article URL
            },
            {
                imageSrc: 'https://i.ytimg.com/vi/MWucCbCx_TM/maxresdefault.jpg',
                imageAlt: 'Nvidia AI виступ',
                title: 'Наступний стрибок у ШІ від Nvidia',
                description: 'Керівник Nvidia AI Technology Centre Саймон Сі поділився своїм баченням еволюції штучного інтелекту – від хмарних рішень до персональних агентів.',
                articleUrl: 'https://forbes.ua/innovations/nastupniy-stribok-u-shi-vid-nvidia-kerivnik-nvidia-ai-technology-centre-saymon-si-rozpoviv-pro-maybutne-galuzi-19122024-25501' // Specific article URL
            },
            {
                imageSrc: 'https://pub-e93d5c9fdf134c89830082377f6df465.r2.dev/2025/04/Zhipu-AI-Reveals-Free-AI-Agent-in-China-1024x576.webp',
                imageAlt: 'Zhipu AI',
                title: 'Китайський стартап Zhipu AI випустив AutoGLM',
                description: 'Zhipu AI представив безкоштовного ШІ-агента AutoGLM, який може стати альтернативою західним розробкам.',
                articleUrl: 'https://forbes.ua/innovations/kitayskiy-startap-zhipu-ai-vipustiv-auto-glm-z-mozhlivistyu-samostiy-no-vikonuvati-komandi-29042025-27464' // Specific article URL
            },
            {
                imageSrc: 'https://miro.medium.com/v2/resize:fit:1400/0*5Ty8Mau36Px3Ha5u',
                imageAlt: 'Perplexity AI',
                title: 'Perplexity AI прагне до смартфонів',
                description: 'Компанія Perplexity AI веде переговори з Samsung та Motorola щодо інтеграції свого помічника безпосередньо в мобільні пристрої.',
                articleUrl: 'https://forbes.ua/innovations/perplexity-ai-pragne-do-smartfoniv-chi-zaminit-vin-google-u-ponovi-galuzi-20052025-27855' // Specific article URL
            },
            {
                imageSrc: 'https://www.actuia.com/storage/uploads/2021/12/Clearview-AI.jpg',
                imageAlt: 'Clearview AI',
                title: 'Clearview AI: суперечлива, але корисна',
                description: 'Технологія розпізнавання облич від Clearview AI викликає дебати, але активно використовується українськими військовими.',
                articleUrl: 'https://forbes.ua/innovations/polemika-navkolo-clearview-ai-chi-mozhut-ukrainski-viyskovi-vikoristovuvati-tekhnologiyu-rozpiznavannya-oblich-iz-ssha-13052025-27757' // Specific article URL
            }
        ];

        let currentSlide = 0;

        function displaySliderContent() {
            if (imageData.length === 0) {
                sliderWrapper.innerHTML = '<p style="text-align: center; color: var(--text-color);">Зображення для слайдера не знайдено.</p>';
                if (prevButton) prevButton.style.display = 'none';
                if (nextButton) nextButton.style.display = 'none';
                if (sliderDotsContainer) sliderDotsContainer.style.display = 'none';
                return;
            }

            sliderWrapper.innerHTML = '';
            sliderDotsContainer.innerHTML = '';

            imageData.forEach((item, index) => {
                const slideItem = document.createElement('div');
                slideItem.classList.add('slider-item');
                slideItem.innerHTML = `
                    <div class="news-image">
                        <a href="${item.articleUrl}" target="_blank" rel="noopener noreferrer">
                            <img src="${item.imageSrc}" alt="${item.imageAlt}" onerror="this.onerror=null;this.src='https://via.placeholder.com/220x220?text=Зображення+не+знайдено';" />
                        </a>
                    </div>
                    <div class="news-content">
                        <h3><a href="${item.articleUrl}" target="_blank" rel="noopener noreferrer">${item.title}</a></h3>
                        <p>${item.description}</p>
                        <a href="${item.articleUrl}"  style="z-index:100">Читати далі</a>
                    </div>
                `;
                sliderWrapper.appendChild(slideItem);
                generalObserver.observe(slideItem); // Observe newly created slider items

                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.dataset.slideIndex = index;
                dot.addEventListener('click', () => {
                    goToSlide(index);
                });
                sliderDotsContainer.appendChild(dot);
            });

            currentSlide = 0;
            updateSlider();

            if (imageData.length > 1) {
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
            if (imageData.length === 0) {
                return;
            }
            const offset = -currentSlide * 100;
            sliderWrapper.style.transform = `translateX(${offset}%)`;

            document.querySelectorAll('#news-slider .dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }

        function goToSlide(index) {
            if (index < 0 || index >= imageData.length) {
                return;
            }
            currentSlide = index;
            updateSlider();
        }

        if (prevButton) {
            prevButton.addEventListener('click', () => {
                currentSlide = (currentSlide - 1 + imageData.length) % imageData.length;
                updateSlider();
            });
        }

        if (nextButton) {
            nextSlide = () => {
                currentSlide = (currentSlide + 1) % imageData.length;
                updateSlider();
            };
            nextButton.addEventListener('click', nextSlide);
        }

        let autoSlideInterval;
        function startAutoSlide() {
            if (imageData.length > 1) {
                clearInterval(autoSlideInterval);
                autoSlideInterval = setInterval(() => {
                    if (nextButton) nextSlide(); // Call nextSlide function directly
                }, 5000);
            }
        }

        const sliderContainer = document.querySelector('#news-slider .slider-container');
        if (sliderContainer) {
            sliderContainer.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
            sliderContainer.addEventListener('mouseleave', startAutoSlide);
        }

        // Initial call to display slider content
        displaySliderContent();
        startAutoSlide(); // Start auto-slide after content is displayed
    }
});
