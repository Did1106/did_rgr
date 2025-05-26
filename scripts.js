const themeSwitch = document.getElementById('checkbox');
const body = document.body;

function setTheme(themeName) {
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(themeName);
    localStorage.setItem('theme', themeName);
    themeSwitch.checked = (themeName === 'dark-theme');
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    setTheme(savedTheme);
} else {
    setTheme('light-theme');
}

themeSwitch.addEventListener('change', function() {
    if (this.checked) {
        setTheme('dark-theme');
    } else {
        setTheme('light-theme');
    }
});

const sections = document.querySelectorAll('section');
const newsItems = document.querySelectorAll('.news-item');
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

newsItems.forEach(item => {
    generalObserver.observe(item);
});

contactListItems.forEach(item => {
    generalObserver.observe(item);
});

if (mapContainer) { 
    generalObserver.observe(mapContainer);
}

document.addEventListener('DOMContentLoaded', () => {
    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {
        if (link.hostname === window.location.hostname) { 
            link.addEventListener('click', function(event) {
                const href = this.getAttribute('href');
                if (href && href !== '#' && !href.startsWith('#')) { 
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
});
