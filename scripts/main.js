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
    const textSequenceSection = document.querySelector('#text-sequence');
    let currentStep = 0;
    const totalSteps = sequenceItems.length;
    let isAnimating = false;
    let autoRotationInterval;
    let userInteracted = false;
    const AUTO_ROTATION_DELAY = 8000; // Increased from 5000 to 8000 milliseconds

    // Erstelle Navigationspunkte
    const navigation = document.createElement('div');
    navigation.className = 'sequence-navigation';
    sequenceItems.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.className = `sequence-dot${index === 0 ? ' active' : ''}`;
        dot.addEventListener('click', () => {
            if (!isAnimating && index !== currentStep) {
                pauseAutoRotation();
                updateSequence(index > currentStep ? 'next' : 'prev', index);
                restartAutoRotationAfterDelay();
            }
        });
        navigation.appendChild(dot);
    });
    textSequenceSection.querySelector('.sequence-container').appendChild(navigation);

    // Setze erste Sequenz
    sequenceItems[0].classList.add('active');
    if (sequenceItems[1]) sequenceItems[1].classList.add('next');
    if (sequenceItems[totalSteps - 1]) sequenceItems[totalSteps - 1].classList.add('prev');

    function startAutoRotation() {
        if (!autoRotationInterval) {
            autoRotationInterval = setInterval(() => {
                if (!userInteracted && !isAnimating) {
                    updateSequence('next');
                }
            }, AUTO_ROTATION_DELAY);
        }
    }

    function pauseAutoRotation() {
        userInteracted = true;
        if (autoRotationInterval) {
            clearInterval(autoRotationInterval);
            autoRotationInterval = null;
        }
    }

    function restartAutoRotationAfterDelay() {
        setTimeout(() => {
            userInteracted = false;
            startAutoRotation();
        }, AUTO_ROTATION_DELAY);
    }

    function updateSequence(direction, targetIndex = null) {
        if (isAnimating) return;
        isAnimating = true;

        const prevStep = currentStep;
        if (targetIndex !== null) {
            currentStep = targetIndex;
        } else {
            currentStep = direction === 'next' 
                ? (currentStep + 1) % totalSteps 
                : (currentStep - 1 + totalSteps) % totalSteps;
        }

        // Update navigation dots
        document.querySelectorAll('.sequence-dot').forEach((dot, index) => {
            dot.classList.toggle('active', index === currentStep);
        });

        // Remove all transition classes
        sequenceItems.forEach(item => {
            item.classList.remove('active', 'prev', 'next');
        });

        // Add new classes
        sequenceItems[currentStep].classList.add('active');
        sequenceItems[(currentStep + 1) % totalSteps].classList.add('next');
        sequenceItems[(currentStep - 1 + totalSteps) % totalSteps].classList.add('prev');

        // Allow next animation after transition
        setTimeout(() => {
            isAnimating = false;
        }, 1000); // Increased from 800 to 1000 milliseconds
    }

    // Start auto-rotation when the section is in view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                userInteracted = false; // Reset user interaction when section comes into view
                startAutoRotation();
            } else {
                pauseAutoRotation();
            }
        });
    }, { threshold: 0.5 });

    observer.observe(textSequenceSection);

    // Scroll and Key Navigation
    let lastScrollPosition = window.pageYOffset;
    let scrollThreshold = 50;
    let scrollTimeout;

    window.addEventListener('scroll', () => {
        if (!textSequenceSection || isAnimating) return;

        const rect = textSequenceSection.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            clearTimeout(scrollTimeout);
            
            scrollTimeout = setTimeout(() => {
                const currentScrollPosition = window.pageYOffset;
                const scrollDifference = currentScrollPosition - lastScrollPosition;

                if (Math.abs(scrollDifference) > scrollThreshold) {
                    pauseAutoRotation();
                    updateSequence(scrollDifference > 0 ? 'next' : 'prev');
                    restartAutoRotationAfterDelay();
                    lastScrollPosition = currentScrollPosition;
                }
            }, 50);
        }
    });

    // Keyboard Navigation
    document.addEventListener('keydown', (e) => {
        if (!textSequenceSection || isAnimating) return;
        const rect = textSequenceSection.getBoundingClientRect();
        
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                pauseAutoRotation();
                updateSequence('next');
                restartAutoRotationAfterDelay();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                pauseAutoRotation();
                updateSequence('prev');
                restartAutoRotationAfterDelay();
            }
        }
    });

    // Touch Navigation for sequence
    let sequenceTouchStartX = 0;
    let sequenceTouchStartY = 0;

    textSequenceSection.addEventListener('touchstart', (e) => {
        sequenceTouchStartX = e.touches[0].clientX;
        sequenceTouchStartY = e.touches[0].clientY;
        pauseAutoRotation();
    }, { passive: true });

    textSequenceSection.addEventListener('touchend', (e) => {
        if (isAnimating) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const deltaX = touchEndX - sequenceTouchStartX;
        const deltaY = touchEndY - sequenceTouchStartY;

        // Ensure horizontal swipe is more significant than vertical
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            updateSequence(deltaX < 0 ? 'next' : 'prev');
            restartAutoRotationAfterDelay();
        }
    }, { passive: true });

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

                const response = await fetch('https://www.rouvenzietz.de/api/contact', {
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

// Newsletter Form Handler
document.addEventListener('DOMContentLoaded', () => {
    const newsletterForm = document.getElementById('newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const emailInput = document.getElementById('newsletter-email');
            const submitButton = newsletterForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.innerHTML;
            
            // Disable form while submitting
            emailInput.disabled = true;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span>Wird angemeldet...</span>';
            
            try {
                const response = await fetch('https://www.rouvenzietz.de/api/subscribe', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: emailInput.value
                    })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Vielen Dank für Ihre Anmeldung! Sie erhalten in Kürze eine Bestätigungs-E-Mail.');
                    newsletterForm.reset();
                } else {
                    throw new Error(result.error || 'Anmeldung fehlgeschlagen');
                }
            } catch (error) {
                console.error('Newsletter subscription error:', error);
                alert('Es gab einen Fehler bei der Anmeldung. Bitte versuchen Sie es später erneut.');
            } finally {
                // Re-enable form
                emailInput.disabled = false;
                submitButton.disabled = false;
                submitButton.innerHTML = originalButtonText;
            }
        });
    }
}); 