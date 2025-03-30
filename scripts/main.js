// Navigation und Scroll-Handling
let isScrolling;
let lastScrollTop = 0;
const nav = document.querySelector('.side-nav');
let isNavVisible = true;

// Ensure sequence items are visible
function ensureSequenceItemsVisible() {
    const sequenceItems = document.querySelectorAll('.sequence-item');
    if (sequenceItems.length > 0) {
        console.log('Ensuring sequence items are visible');
        sequenceItems.forEach((item, index) => {
            item.style.visibility = 'visible';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
            item.classList.add('active');
        });
    }
}

// Set a backup timeout to force display of sequence items
setTimeout(ensureSequenceItemsVisible, 2000);

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
    const textSequenceSection = document.querySelector('#text-sequence');
    
    if (textSequenceSection) {
        const sequenceItems = document.querySelectorAll('.sequence-item');
        let currentIndex = 0;
        let isAnimating = false;

        function showNextItem() {
            if (isAnimating || currentIndex >= sequenceItems.length) return;
            
            isAnimating = true;
            
            // Make all items visible initially to ensure they appear
            sequenceItems.forEach(item => {
                item.style.visibility = 'visible';
                item.style.opacity = '0.3';
            });
            
            // Then animate them one by one with full opacity
            if (currentIndex < sequenceItems.length) {
                sequenceItems[currentIndex].classList.add('active');
                
                // Wait for animation to complete
                setTimeout(() => {
                    isAnimating = false;
                    currentIndex++;
                    if (currentIndex < sequenceItems.length) {
                        showNextItem();
                    }
                }, 800);
            }
        }

        // Start showing items immediately without intersection observer
        // to ensure they're always visible
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(showNextItem, 500);
        });
        
        // Also keep the intersection observer as a backup
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && currentIndex === 0) {
                    showNextItem();
                }
            });
        }, { threshold: 0.1 });  // Lower threshold for earlier detection

        observer.observe(textSequenceSection);
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

                const response = await fetch('./api/contact', {
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
    // No additional implementation needed here - MailerLite Universal handles the form submission
    // The form with class ml-form and data-code attribute will be automatically handled

    // Show custom message function still available for other parts of the site
});

// Helper function to show messages
function showMessage(message, type = 'success') {
    // Remove any existing message
    const existingMessage = document.querySelector('.message-overlay');
    if (existingMessage) {
        existingMessage.remove();
    }

    // Create message element
    const messageElement = document.createElement('div');
    messageElement.className = `message-overlay ${type}`;
    messageElement.innerHTML = `
        <div class="message-content">
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">Schließen</button>
        </div>
    `;

    // Add to document
    document.body.appendChild(messageElement);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (messageElement.parentElement) {
            messageElement.remove();
        }
    }, 5000);
}