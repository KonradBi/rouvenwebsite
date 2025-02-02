// Navigation und Scroll-Handling
let isScrolling;
let lastScrollTop = 0;
const nav = document.querySelector('.side-nav');
let isNavVisible = true;

// Scroll-Event-Handler für Navigation
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Bestimme Scroll-Richtung und verstecke Navigation
    if (currentScroll > lastScrollTop) {
        // Scrolling nach unten
        nav.classList.add('hidden');
        isNavVisible = false;
    } else {
        // Scrolling nach oben
        nav.classList.add('hidden');
        isNavVisible = false;
    }
    
    lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    
    // Clear bestehenden Timer
    clearTimeout(isScrolling);
    
    // Setze neuen Timer
    isScrolling = setTimeout(() => {
        nav.classList.remove('hidden');
        isNavVisible = true;
    }, 2000); // 2 Sekunden Verzögerung
});

// Touch-Events für Mobile
if (window.innerWidth <= 768) {
    nav.addEventListener('touchstart', () => {
        if (!isNavVisible) {
            nav.classList.remove('hidden');
            isNavVisible = true;
        }
    });
}

// Portfolio Funktionalität
document.addEventListener('DOMContentLoaded', () => {
    const portfolioRows = document.querySelectorAll('.portfolio-row-inner');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const overlay = document.querySelector('.overlay');
    const closeButton = document.querySelector('.close-button');
    let currentZoomedItem = null;
    
    // Hover-Effekt für jedes Portfolio-Item
    portfolioItems.forEach(item => {
        const row = item.closest('.portfolio-row-inner');
        
        item.addEventListener('mouseenter', () => {
            row.style.animationPlayState = 'paused';
        });
        
        item.addEventListener('mouseleave', () => {
            if (!currentZoomedItem) {
                row.style.animationPlayState = 'running';
            }
        });
        
        // Klick-Event für Zoom
        item.addEventListener('click', () => {
            currentZoomedItem = item;
            item.classList.add('zoomed');
            overlay.classList.add('active');
            closeButton.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            portfolioRows.forEach(row => {
                row.style.animationPlayState = 'paused';
            });
        });
    });
    
    function closeZoom() {
        if (currentZoomedItem) {
            currentZoomedItem.classList.remove('zoomed');
            overlay.classList.remove('active');
            closeButton.classList.remove('active');
            document.body.style.overflow = '';
            
            portfolioRows.forEach(row => {
                if (!row.querySelector('.portfolio-item:hover')) {
                    row.style.animationPlayState = 'running';
                }
            });
            
            currentZoomedItem = null;
        }
    }
    
    // Schließen-Events
    closeButton.addEventListener('click', closeZoom);
    overlay.addEventListener('click', closeZoom);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeZoom();
        }
    });

    // Text-Sequence Animation
    const sequenceItems = document.querySelectorAll('.sequence-item');
    const footnote = document.querySelector('.sequence-footnote');
    let currentStep = 0;
    const totalSteps = sequenceItems.length;

    // Setze erste Sequenz sofort sichtbar
    sequenceItems[0].classList.add('active');

    function showSequenceStep(step) {
        sequenceItems.forEach((item, index) => {
            if (index === step) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        if (step === totalSteps - 1) {
            setTimeout(() => {
                footnote.classList.add('active');
            }, 500);
        } else {
            footnote.classList.remove('active');
        }
    }

    function nextSequenceStep() {
        currentStep = (currentStep + 1) % totalSteps;
        showSequenceStep(currentStep);
    }

    // Starte Sequenz
    setInterval(nextSequenceStep, 4000);
}); 