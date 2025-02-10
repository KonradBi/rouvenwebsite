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
        
        // Click handler for portfolio items
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img) return;
            
            currentZoomedItem = item;
            
            // Pause all animations
            portfolioRows.forEach(row => {
                row.style.animationPlayState = 'paused';
            });
            
            // Setup lightbox
            const lightboxImg = document.createElement('img');
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;
            lightboxImg.className = 'lightbox-image';
            
            overlay.innerHTML = '';
            overlay.appendChild(lightboxImg);
            
            // Show overlay
            overlay.classList.add('active');
            closeButton.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Close handlers
    const closeOverlay = () => {
        if (!currentZoomedItem) return;
        
            overlay.classList.remove('active');
            closeButton.classList.remove('active');
            document.body.style.overflow = '';
        overlay.innerHTML = '';
            
        // Resume animations
            portfolioRows.forEach(row => {
                    row.style.animationPlayState = 'running';
            });
            
            currentZoomedItem = null;
    };
    
    closeButton.addEventListener('click', closeOverlay);
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeOverlay();
    });
    
    // Mobile swipe to close
    let touchStartX = 0;
    overlay.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    overlay.addEventListener('touchend', (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = Math.abs(touchEndX - touchStartX);
        
        if (swipeDistance > 50) {
            closeOverlay();
        }
    }, { passive: true });

    // Text-Sequence Animation
    const sequenceItems = document.querySelectorAll('.sequence-item');
    const footnote = document.querySelector('.sequence-footnote');
    let currentStep = 0;
    const totalSteps = sequenceItems.length;

    // Setze erste Sequenz sofort sichtbar
    sequenceItems[0].classList.add('active');

    function showSequenceStep(step) {
        // Entferne zuerst die aktive Klasse von allen Items
        sequenceItems.forEach(item => {
                item.classList.remove('active');
        });

        // Warte kurz, bevor das neue Item angezeigt wird
        setTimeout(() => {
            sequenceItems[step].classList.add('active');
        }, 500);

        if (step === totalSteps - 1) {
            setTimeout(() => {
                footnote.classList.add('active');
            }, 1000);
        } else {
            footnote.classList.remove('active');
        }
    }

    function nextSequenceStep() {
        currentStep = (currentStep + 1) % totalSteps;
        showSequenceStep(currentStep);
    }

    // Starte Sequenz mit längerem Intervall
    setInterval(nextSequenceStep, 6000); // Erhöht von 4000 auf 6000 ms

    // Typewriter effect for expertise quote
    const quote = document.querySelector('.expertise-quote blockquote');
    
    if (quote) {
        const text = "Die Neugierde treibt mich an. Ich suche Geschichten, die es wert sind, anderen darüber zu berichten. Dabei geht es immer um den Mehrwert. Es soll das Leben meiner Leserinnen und Leser bereichern.";
        let charIndex = 0;
        let isDeleting = false;
        let cursorVisible = true;

        // Cursor blink animation
        setInterval(() => {
            cursorVisible = !cursorVisible;
            if (charIndex >= text.length) {
                quote.innerHTML = `${text}${cursorVisible ? '<span class="cursor">|</span>' : ''}`;
            }
        }, 500);

        function typeWriter() {
            if (charIndex < text.length) {
                quote.innerHTML = `${text.substring(0, charIndex + 1)}${cursorVisible ? '<span class="cursor">|</span>' : ''}`;
                charIndex++;
                
                // Schnellere Geschwindigkeit für das Tippen
                const delay = Math.random() * 30 + 20; // 20-50ms statt 30-80ms
                setTimeout(typeWriter, delay);
            } else {
                // Pause am Ende des Texts
                setTimeout(() => {
                    isDeleting = true;
                    deleteText();
                }, 5000);
            }
        }

        function deleteText() {
            if (charIndex > 0) {
                quote.innerHTML = `${text.substring(0, charIndex)}${cursorVisible ? '<span class="cursor">|</span>' : ''}`;
                charIndex--;
                
                // Schnelleres Löschen
                setTimeout(deleteText, 15); // 15ms statt 20ms
            } else {
                isDeleting = false;
                setTimeout(typeWriter, 1000);
            }
        }

        // Ensure the element is ready and start animation
        requestAnimationFrame(() => {
            quote.innerHTML = '<span class="cursor">|</span>';
            setTimeout(typeWriter, 1000);
        });
    }
});

// Contact Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitButton = contactForm.querySelector('.submit-button');
            const originalButtonText = submitButton.innerHTML;
            submitButton.innerHTML = '<span>Wird gesendet...</span>';
            submitButton.disabled = true;

            try {
                const formData = {
                    name: contactForm.querySelector('#name').value,
                    email: contactForm.querySelector('#email').value,
                    subject: contactForm.querySelector('#subject').value,
                    message: contactForm.querySelector('#message').value
                };

                const response = await fetch('http://localhost:3001/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                const result = await response.json();

                if (result.success) {
                    alert('Ihre Nachricht wurde erfolgreich gesendet!');
                    contactForm.reset();
                } else {
                    throw new Error('Failed to send message');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Es gab einen Fehler beim Senden Ihrer Nachricht. Bitte versuchen Sie es später erneut.');
            } finally {
                submitButton.innerHTML = originalButtonText;
                submitButton.disabled = false;
            }
        });
    }
}); 