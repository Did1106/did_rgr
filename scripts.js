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
const contactListItems = document.querySelectorAll('#contact ul li'); const mapContainer = document.getElementById('map-container');

const observerOptions = {
    threshold: 0.1 };

const generalObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
                                                            observer.unobserve(entry.target);
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

generalObserver.observe(mapContainer);
