// Initialize Lenis Smooth Scroll
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Integrate Lenis with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Custom Cursor (GSAP for smoothness)
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mouseX = 0, mouseY = 0;
let ringX = 0, ringY = 0;

window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out"
    });
});

// Render loop for ring
gsap.ticker.add(() => {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    gsap.set(ring, { x: ringX, y: ringY });
});

// Nav Blur on Scroll
const nav = document.getElementById('nav');
lenis.on('scroll', (e) => {
    if (e.scroll > 50) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// GSAP Animations
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

// Active Nav Link Logic
const currentPage = window.location.pathname.split('/').pop() || 'index.html';
const navLinks = document.querySelectorAll('.nav-links a');
navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
        link.classList.add('active');
        link.style.color = 'var(--text)'; // Highlight active link
    }
});

// Initial Load Animation
const tl = gsap.timeline();
tl.fromTo(".nav-logo, .nav-links li, .nav-cta",
    { y: -20, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" }
)
    .fromTo(".hero-glow",
        { scale: 0, opacity: 0 },
        { scale: 1, opacity: 1, duration: 2, ease: "power2.out" }, "-=0.5"
    )
    .fromTo(".gs-hero",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out" }, "-=1.5"
    );

// Ticker Parallax
const tickerText = document.getElementById("tickerText");
if (tickerText) {
    gsap.to("#tickerText", {
        xPercent: -20,
        ease: "none",
        scrollTrigger: {
            trigger: "#home",
            start: "top top",
            end: "bottom top",
            scrub: 1
        }
    });
}

// Scroll Animations (Fade Up)
const fadeUps = document.querySelectorAll('.gs-up');
fadeUps.forEach(elem => {
    gsap.fromTo(elem,
        { y: 50, opacity: 0 },
        {
            y: 0, opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
                trigger: elem,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        }
    );
});

// Service Cards Stagger
gsap.fromTo(".gs-card",
    { y: 60, opacity: 0 },
    {
        y: 0, opacity: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
            trigger: ".services-grid",
            start: "top 80%",
        }
    }
);

// Marquee Parallax
gsap.to(".marquee-track", {
    xPercent: -50,
    ease: "none",
    duration: 20,
    repeat: -1
});

// About Image Parallax
const aboutImg = document.getElementById("aboutImg");
if (aboutImg) {
    gsap.fromTo("#aboutImg",
        { scale: 1.2, y: -50 },
        {
            scale: 1, y: 50,
            ease: "none",
            scrollTrigger: {
                trigger: ".about-visual",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        }
    );
}

// Number Counter Animation
const counters = document.querySelectorAll('.counter');
counters.forEach(counter => {
    ScrollTrigger.create({
        trigger: counter,
        start: "top 80%",
        once: true,
        onEnter: () => {
            const target = +counter.getAttribute('data-target');
            gsap.to(counter, {
                innerText: target,
                duration: 2,
                snap: { innerText: 1 },
                ease: "power2.out",
                onUpdate: function () {
                    counter.innerHTML = Math.round(this.targets()[0].innerText) + "<span>+</span>";
                }
            });
        }
    });
});

// Portfolio filter logic (Vanilla JS)
window.filterPortfolio = function (cat, btn) {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.portfolio-item').forEach(item => {
        if (cat === 'all' || item.dataset.category === cat) {
            item.style.display = 'block';
            gsap.fromTo(item,
                { autoAlpha: 0, scale: 0.95 },
                { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power2.out" }
            );
        } else {
            item.style.display = 'none';
        }
    });
    // Force ScrollTrigger to recalculate layout
    setTimeout(() => ScrollTrigger.refresh(), 100);
}

// Contact Form Submission (AJAX)
const contactForm = document.getElementById('contactForm');
const formResult = document.getElementById('form-result');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        // UI Feedback: Show "Sending..."
        const submitBtn = contactForm.querySelector('.form-submit');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = "<span>Sending...</span>";
        submitBtn.style.pointerEvents = "none";
        submitBtn.style.opacity = "0.7";

        const formData = new FormData(contactForm);
        const object = Object.fromEntries(formData);
        const json = JSON.stringify(object);

        formResult.innerHTML = "Please wait...";
        formResult.style.color = "var(--light)";

        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: json
        })
            .then(async (response) => {
                let json = await response.json();
                if (response.status == 200) {
                    formResult.innerHTML = "Message sent successfully! We'll be in touch soon.";
                    formResult.style.color = "#4CAF50"; // Green for success
                    contactForm.reset();
                } else {
                    console.log(response);
                    formResult.innerHTML = json.message || "Something went wrong. Please try again.";
                    formResult.style.color = "#f44336"; // Red for error
                }
            })
            .catch(error => {
                console.log(error);
                formResult.innerHTML = "Something went wrong. Please check your connection.";
                formResult.style.color = "#f44336";
            })
            .then(function () {
                // Restore button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.style.pointerEvents = "all";
                submitBtn.style.opacity = "1";

                // Clear message after 5 seconds
                setTimeout(() => {
                    formResult.innerHTML = "";
                }, 5000);
            });
    });
}
