document.addEventListener('DOMContentLoaded', () => {
    // Hamburger Menu
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('toggle');
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            navLinks.classList.remove('active'); // Close mobile menu on click

            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // Animate Numbers if it's the stats container
                if (entry.target.classList.contains('stats-container') && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    const stats = entry.target.querySelectorAll('.stat-number');
                    stats.forEach(stat => {
                        const target = +stat.getAttribute('data-target');
                        const duration = 2000; // ms
                        const increment = target / (duration / 16); // 60fps

                        let current = 0;
                        const updateCount = () => {
                            current += increment;
                            if (current < target) {
                                stat.innerText = Math.ceil(current);
                                requestAnimationFrame(updateCount);
                            } else {
                                stat.innerText = target;
                            }
                        };
                        updateCount();
                    });
                }
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // Contact Form Handling
    // Try to find the form with either old or new class
    const contactForm = document.querySelector('.contact-form') || document.querySelector('.contact-form-full');
    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerText;

            // Validate inputs (basic)
            const name = document.getElementById('name').value;
            const mobile = document.getElementById('mobile').value;
            const model = document.getElementById('model').value;
            const engine = document.getElementById('engine').value;
            const year = document.getElementById('year').value;
            const ecuid = document.getElementById('ecuid').value;
            const calibration = document.getElementById('calibration').value;
            const message = document.getElementById('message').value;

            // Simple validation
            if (!name || !mobile || !model) return;

            // Simulate sending
            btn.innerText = 'Invio in corso...';
            btn.style.opacity = '0.7';
            btn.disabled = true;

            setTimeout(() => {
                // Success state
                btn.innerText = 'Messaggio Inviato!';
                btn.style.backgroundColor = '#28a745'; // Green success color
                btn.style.borderColor = '#28a745';
                btn.style.opacity = '1';

                // Construct mailto as a fallback/demo
                const subject = `Richiesta: ${model} - ${calibration}`;
                const body = `Nome: ${name}%0D%0ACellulare: ${mobile}%0D%0A%0D%0ADati Veicolo:%0D%0AAuto: ${model}%0D%0AAnno: ${year}%0D%0ACod. Motore: ${engine}%0D%0AECU ID: ${ecuid}%0D%0A%0D%0ARichiesta: ${calibration}%0D%0AMessaggio: ${message}`;

                // Open email client with pre-filled checks
                window.location.href = `mailto:customspeeditalia1981@gmail.com?subject=${subject}&body=${body}`;

                contactForm.reset();

                // Reset button after 3 seconds
                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = ''; // Revert to CSS default
                    btn.style.borderColor = '';
                    btn.disabled = false;
                }, 3000);
            }, 1500);
        });
    }

    // Review System - Star Rating Widget
    const stars = document.querySelectorAll('.stars-rating i');
    const ratingValue = document.getElementById('rating-value');
    const ratingError = document.getElementById('rating-error');

    // Define highlightStars in outer scope so it can be used by both modules
    function highlightStars(value) {
        stars.forEach(star => {
            if (parseInt(star.getAttribute('data-value')) <= parseInt(value)) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    if (stars.length > 0) {
        stars.forEach(star => {
            // Hover effect
            star.addEventListener('mouseover', function () {
                const value = this.getAttribute('data-value');
                highlightStars(value);
            });

            // Remove hover effect
            star.addEventListener('mouseout', function () {
                const currentRating = ratingValue.value;
                highlightStars(currentRating);
            });

            // Click to select
            star.addEventListener('click', function () {
                const value = this.getAttribute('data-value');
                ratingValue.value = value;
                highlightStars(value);
                if (ratingError) ratingError.style.display = 'none';
            });
        });
    }

    // Reviews Modal System
    const modal = document.getElementById('reviews-modal');
    const satisfactionStat = document.getElementById('satisfaction-stat');
    const closeModal = document.querySelector('.close-modal');
    const reviewsContainer = document.getElementById('reviews-container');
    let allReviews = [];

    // Open modal when clicking on Satisfaction stat
    if (satisfactionStat) {
        satisfactionStat.addEventListener('click', function () {
            modal.style.display = 'block';
            loadReviews();
        });
    }

    // Close modal
    if (closeModal) {
        closeModal.addEventListener('click', function () {
            modal.style.display = 'none';
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Function to load reviews from CSV and localStorage
    async function loadReviews() {
        reviewsContainer.innerHTML = '<div class="loading-spinner">Caricamento recensioni...</div>';

        try {
            // Load CSV reviews
            const response = await fetch('reviews.csv');
            const csvText = await response.text();
            const csvReviews = parseCSV(csvText);

            // Load localStorage reviews
            const localReviews = JSON.parse(localStorage.getItem('localReviews') || '[]');

            // Combine all reviews
            allReviews = [...csvReviews, ...localReviews];

            displayReviews(allReviews);
        } catch (error) {
            reviewsContainer.innerHTML = '<div class="loading-spinner">Errore nel caricamento delle recensioni.</div>';
            console.error('Error loading reviews:', error);
        }
    }

    // Parse CSV content
    function parseCSV(csv) {
        const lines = csv.split('\n').filter(line => line.trim());
        const reviews = [];

        // Skip header line
        for (let i = 1; i < lines.length; i++) {
            const match = lines[i].match(/^([^,]+),(\d+),"(.+)"$/);
            if (match) {
                reviews.push({
                    name: match[1].trim(),
                    rating: parseInt(match[2]),
                    text: match[3].trim()
                });
            }
        }

        return reviews;
    }

    // Display reviews in the modal
    function displayReviews(reviews) {
        if (reviews.length === 0) {
            reviewsContainer.innerHTML = '<div class="loading-spinner">Nessuna recensione disponibile.</div>';
            return;
        }

        reviewsContainer.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-name">${escapeHtml(review.name)}</span>
                    <span class="review-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
                </div>
                <p class="review-text">"${escapeHtml(review.text)}"</p>
            </div>
        `).join('');
    }

    // Helper function to escape HTML
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Modify review form submission to save to localStorage
    const reviewForm = document.querySelector('.review-form');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const rating = ratingValue.value;
            const name = document.getElementById('review-name').value;
            const text = document.getElementById('review-text').value;
            const btn = this.querySelector('button[type="submit"]');

            if (rating === "0") {
                if (ratingError) {
                    ratingError.style.display = 'block';
                }
                return;
            }

            // Simulate sending
            const originalText = btn.innerText;
            btn.innerText = 'Invio...';
            btn.disabled = true;

            setTimeout(() => {
                // Save to localStorage
                const localReviews = JSON.parse(localStorage.getItem('localReviews') || '[]');
                localReviews.push({
                    name: name,
                    rating: parseInt(rating),
                    text: text
                });
                localStorage.setItem('localReviews', JSON.stringify(localReviews));

                btn.innerText = 'Grazie per la Recensione!';
                btn.style.backgroundColor = '#28a745';
                btn.style.borderColor = '#28a745';

                // Construct mailto (optional notification)
                const subject = `Nuova Recensione da ${name}`;
                const body = `Voto: ${rating}/5%0D%0ANome: ${name}%0D%0ACommento: ${text}`;
                window.location.href = `mailto:customspeeditalia1981@gmail.com?subject=${subject}&body=${body}`;

                reviewForm.reset();
                ratingValue.value = "0";
                highlightStars(0);

                setTimeout(() => {
                    btn.innerText = originalText;
                    btn.style.backgroundColor = '';
                    btn.disabled = false;
                }, 6900);
            }, 1000);
        });
    }

    // Testimonial Carousel
    const carouselSlides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-control.prev');
    const nextBtn = document.querySelector('.carousel-control.next');

    // Debug logging
    console.log('Carousel Debug: Slides found:', carouselSlides.length);
    console.log('Carousel Debug: Prev Button found:', !!prevBtn);
    console.log('Carousel Debug: Next Button found:', !!nextBtn);

    if (carouselSlides.length > 0) {
        let currentSlide = 0;
        const totalSlides = carouselSlides.length;
        let slideInterval;

        // Force first slide active immediately
        carouselSlides[0].classList.add('active');

        function showSlide(index) {
            console.log('Carousel Debug: Showing slide', index);

            // Remove active class from CURRENT slide only (optimization)
            // or safer: remove from all
            carouselSlides.forEach(s => s.classList.remove('active'));

            // Wrap index
            if (index >= totalSlides) {
                currentSlide = 0;
            } else if (index < 0) {
                currentSlide = totalSlides - 1;
            } else {
                currentSlide = index;
            }

            // Verify element exists before adding class
            if (carouselSlides[currentSlide]) {
                carouselSlides[currentSlide].classList.add('active');
            }
        }

        function nextSlide() {
            console.log('Carousel Debug: Next Slide Triggered');
            showSlide(currentSlide + 1);
        }

        function prevSlide() {
            console.log('Carousel Debug: Prev Slide Triggered');
            showSlide(currentSlide - 1);
        }

        function startAutoSlide() {
            // Clear any existing interval just in case
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 5000);
            console.log('Carousel Debug: Auto-slide started');
        }

        function resetTimer() {
            clearInterval(slideInterval);
            startAutoSlide();
        }

        // Event Listeners
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent any default button behavior
                nextSlide();
                resetTimer();
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                prevSlide();
                resetTimer();
            });
        }

        // Start
        startAutoSlide();
    }
});
