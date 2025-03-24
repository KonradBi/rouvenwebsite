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
    const textSequenceSection = document.querySelector('#text-sequence');
    
    // Add safety check - only run sequence code if the section exists
    if (textSequenceSection) {
        const sequenceItems = document.querySelectorAll('.sequence-item');
        
        // Check if we have any sequence items
        if (sequenceItems && sequenceItems.length > 0) {
            let currentStep = 0;
            const totalSteps = sequenceItems.length;
            let isAnimating = false;
            let autoRotationInterval;
            let userInteracted = false;
            const AUTO_ROTATION_DELAY = 12000; // 12 seconds between automatic transitions
            
            // Check if we're on mobile
            const isMobile = window.innerWidth <= 768;

            // Erstelle Navigationspunkte
            const navigation = document.createElement('div');
            navigation.className = 'sequence-navigation';
            sequenceItems.forEach((_, index) => {
                const dot = document.createElement('div');
                dot.className = `sequence-dot${index === 0 ? ' active' : ''}`;
                dot.addEventListener('click', () => {
                    if (!isAnimating && index !== currentStep) {
                        pauseAutoRotation();
                        updateSequence(index);
                        restartAutoRotationAfterDelay();
                    }
                });
                navigation.appendChild(dot);
            });
            
            // Add a check to ensure container exists
            const sequenceContainer = textSequenceSection ? textSequenceSection.querySelector('.sequence-container') : null;
            if (sequenceContainer) {
                sequenceContainer.appendChild(navigation);
            } else {
                console.error('Sequence container not found');
            }

            // Setze erste Sequenz
            if (sequenceItems.length > 0 && sequenceItems[0]) {
                sequenceItems[0].classList.add('active');
            }
            
            // Initialize height for the sequence container based on content
            function updateContainerHeight() {
                const activeItem = document.querySelector('.sequence-item.active');
                if (activeItem && sequenceContainer) {
                    // Add small buffer for spacing
                    const containerHeight = activeItem.offsetHeight + 80;
                    sequenceContainer.style.minHeight = `${containerHeight}px`;
                }
            }
            
            // Set initial height
            setTimeout(updateContainerHeight, 100);
            
            // Update height on window resize
            window.addEventListener('resize', () => {
                setTimeout(updateContainerHeight, 200);
            });

            function startAutoRotation() {
                if (!autoRotationInterval) {
                    autoRotationInterval = setInterval(() => {
                        if (!userInteracted && !isAnimating) {
                            const nextIndex = (currentStep + 1) % totalSteps;
                            if (nextIndex >= 0 && nextIndex < totalSteps) {
                                updateSequence(nextIndex);
                            }
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

            function updateSequence(newIndex) {
                if (isAnimating) return;
                
                // Ensure newIndex is valid
                if (newIndex < 0 || newIndex >= totalSteps) {
                    console.warn('Invalid sequence index:', newIndex);
                    return;
                }
                
                isAnimating = true;

                // Safely update navigation dots
                const dots = document.querySelectorAll('.sequence-dot');
                if (dots && dots.length > 0) {
                    dots.forEach((dot, index) => {
                        if (dot) {
                            dot.classList.toggle('active', index === newIndex);
                        }
                    });
                }

                // Same animation for mobile and desktop - simpler fade & slide
                // Remove active class from current item safely
                if (currentStep >= 0 && currentStep < sequenceItems.length && sequenceItems[currentStep]) {
                    sequenceItems[currentStep].classList.remove('active');
                }
                
                // Add active class to new item safely
                if (newIndex >= 0 && newIndex < sequenceItems.length && sequenceItems[newIndex]) {
                    sequenceItems[newIndex].classList.add('active');
                    currentStep = newIndex;
                } else {
                    console.error('Sequence item missing:', newIndex);
                    isAnimating = false;
                    return;
                }
                
                // Allow next animation after transition
                setTimeout(() => {
                    isAnimating = false;
                    // Update container height after animation completes
                    updateContainerHeight();
                }, 600);
            }

            // Add touch swipe for mobile
            let sequenceTouchStartX = 0;
            let sequenceTouchEndX = 0;
            
            textSequenceSection.addEventListener('touchstart', (e) => {
                sequenceTouchStartX = e.touches[0].clientX;
            }, { passive: true });
            
            textSequenceSection.addEventListener('touchend', (e) => {
                if (isAnimating) return;
                
                sequenceTouchEndX = e.changedTouches[0].clientX;
                const swipeDistance = sequenceTouchEndX - sequenceTouchStartX;
                
                if (Math.abs(swipeDistance) > 50) {
                    pauseAutoRotation();
                    
                    // Calculate next index based on swipe direction
                    let nextIndex;
                    if (swipeDistance > 0) {
                        // Swipe right - go to previous
                        nextIndex = (currentStep - 1 + totalSteps) % totalSteps;
                    } else {
                        // Swipe left - go to next
                        nextIndex = (currentStep + 1) % totalSteps;
                    }
                    
                    // Check if nextIndex is valid before updating
                    if (nextIndex >= 0 && nextIndex < totalSteps) {
                        updateSequence(nextIndex);
                        restartAutoRotationAfterDelay();
                    }
                }
            }, { passive: true });

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
            }, { threshold: 0.3 });

            observer.observe(textSequenceSection);

            // Handle window resize - update container height rather than reloading
            window.addEventListener('resize', () => {
                setTimeout(updateContainerHeight, 200);
            });

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
                            const nextIndex = (currentStep + Math.sign(scrollDifference)) % totalSteps;
                            if (nextIndex >= 0 && nextIndex < totalSteps) {
                                updateSequence(nextIndex);
                            }
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
                    let nextIndex = currentStep;
                    
                    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                        nextIndex = (currentStep + 1) % totalSteps;
                    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                        nextIndex = (currentStep - 1 + totalSteps) % totalSteps;
                    } else {
                        return; // Not a navigation key
                    }
                    
                    if (nextIndex >= 0 && nextIndex < totalSteps) {
                        pauseAutoRotation();
                        updateSequence(nextIndex);
                        restartAutoRotationAfterDelay();
                    }
                }
            });

            // Typewriter effect for expertise quote
            const quote = document.querySelector('.expertise-quote blockquote');
            
            if (quote) {
                const text = "Die Neugierde treibt mich an. Ich suche Geschichten, die es wert sind, anderen darüber zu berichten. Dabei geht es immer um den Mehrwert. Es soll das Leben meiner Leserinnen und Leser bereichern.";
                let charIndex = 0;
                let isTypingComplete = false;
                let cursorVisible = true;

                // Cursor blink animation
                setInterval(() => {
                    if (isTypingComplete) {
                        cursorVisible = !cursorVisible;
                        quote.innerHTML = `${text}${cursorVisible ? '<span class="cursor">|</span>' : ''}`;
                    }
                }, 500);

                function typeWriter() {
                    if (charIndex < text.length) {
                        quote.innerHTML = `${text.substring(0, charIndex + 1)}${cursorVisible ? '<span class="cursor">|</span>' : ''}`;
                        charIndex++;
                        
                        // Schnellere Geschwindigkeit für das Tippen
                        const delay = Math.random() * 30 + 20; // 20-50ms
                        setTimeout(typeWriter, delay);
                    } else {
                        // Animation is complete, set flag
                        isTypingComplete = true;
                        // Display the full text with blinking cursor
                        quote.innerHTML = `${text}${cursorVisible ? '<span class="cursor">|</span>' : ''}`;
                        
                        // Optional: After 5 seconds, hide the cursor completely
                        setTimeout(() => {
                            const cursorInterval = setInterval(() => {
                                cursorVisible = !cursorVisible;
                                if (!cursorVisible) {
                                    quote.innerHTML = text;
                                    clearInterval(cursorInterval);
                                } else {
                                    quote.innerHTML = `${text}<span class="cursor">|</span>`;
                                }
                            }, 500);
                        }, 5000);
                    }
                }

                // Ensure the element is ready and start animation
                requestAnimationFrame(() => {
                    quote.innerHTML = '<span class="cursor">|</span>';
                    setTimeout(typeWriter, 1000);
                });
            }
        }
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
                const response = await fetch('/api/subscribe', {
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