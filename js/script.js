// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize AOS animation library
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true
    });
    
    // Initialize particles.js
    particlesJS('particles-js', {
        particles: {
            number: {
                value: 80,
                density: {
                    enable: true,
                    value_area: 800
                }
            },
            color: {
                value: "#00f0ff"
            },
            shape: {
                type: "circle",
                stroke: {
                    width: 0,
                    color: "#000000"
                },
                polygon: {
                    nb_sides: 5
                }
            },
            opacity: {
                value: 0.5,
                random: true,
                anim: {
                    enable: true,
                    speed: 1,
                    opacity_min: 0.1,
                    sync: false
                }
            },
            size: {
                value: 3,
                random: true,
                anim: {
                    enable: true,
                    speed: 2,
                    size_min: 0.1,
                    sync: false
                }
            },
            line_linked: {
                enable: true,
                distance: 150,
                color: "#00f0ff",
                opacity: 0.2,
                width: 1
            },
            move: {
                enable: true,
                speed: 1,
                direction: "none",
                random: true,
                straight: false,
                out_mode: "out",
                bounce: false,
                attract: {
                    enable: false,
                    rotateX: 600,
                    rotateY: 1200
                }
            }
        },
        interactivity: {
            detect_on: "canvas",
            events: {
                onhover: {
                    enable: true,
                    mode: "grab"
                },
                onclick: {
                    enable: true,
                    mode: "push"
                },
                resize: true
            },
            modes: {
                grab: {
                    distance: 140,
                    line_linked: {
                        opacity: 0.5
                    }
                },
                bubble: {
                    distance: 400,
                    size: 40,
                    duration: 2,
                    opacity: 8,
                    speed: 3
                },
                repulse: {
                    distance: 200,
                    duration: 0.4
                },
                push: {
                    particles_nb: 4
                },
                remove: {
                    particles_nb: 2
                }
            }
        },
        retina_detect: true
    });
    
    // Animated counter for stats
    const counters = document.querySelectorAll('.counter');
    const speed = 200;
    
    counters.forEach(counter => {
        const updateCount = () => {
            const target = +counter.getAttribute('data-target');
            const count = +counter.innerText;
            const increment = target / speed;
            
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 1);
            } else {
                counter.innerText = target.toLocaleString();
            }
        };
        
        // Start counter when element is in viewport
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                updateCount();
                observer.unobserve(counter);
            }
        });
        
        observer.observe(counter);
    });
    
    // Current year for copyright
    document.getElementById('year').textContent = new Date().getFullYear();
    
    // Terminal typing effect
    const terminalLines = [
        "$ npm init codecracker",
        "Initializing your coding journey...",
        "✓ Dependencies installed",
        "✓ Skills configured",
        "✓ Career path generated"
    ];
    
    const terminalContent = document.querySelector('.terminal-content');
    let currentLine = 0;
    let currentChar = 0;
    let isDeleting = false;
    let isWaiting = false;
    
    function typeTerminal() {
        if (currentLine >= terminalLines.length) {
            // Blinking cursor effect after typing is done
            const cursor = document.querySelector('.blinking-cursor');
            if (cursor) cursor.style.display = 'inline-block';
            return;
        }
        
        const line = terminalLines[currentLine];
        
        if (!isDeleting && currentChar <= line.length) {
            // Typing
            terminalContent.children[currentLine].textContent = line.substring(0, currentChar);
            currentChar++;
            setTimeout(typeTerminal, Math.random() * 100 + 50);
        } else if (isDeleting && currentChar >= 0) {
            // Deleting
            terminalContent.children[currentLine].textContent = line.substring(0, currentChar);
            currentChar--;
            setTimeout(typeTerminal, 30);
        } else {
            // Switch between lines
            isDeleting = false;
            currentLine++;
            currentChar = 0;
            
            if (currentLine < terminalLines.length) {
                // Add new line
                const newLine = document.createElement('p');
                terminalContent.appendChild(newLine);
                isWaiting = true;
                setTimeout(typeTerminal, 1000);
            }
        }
    }
    
    // Start typing effect when terminal is in view
    const terminalObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
            // Clear terminal content and recreate lines
            terminalContent.innerHTML = '';
            terminalLines.forEach((line, index) => {
                const p = document.createElement('p');
                if (index === 0) p.innerHTML = '<span class="prompt">$</span> ';
                terminalContent.appendChild(p);
            });
            
            // Add blinking cursor to last line
            const cursor = document.createElement('span');
            cursor.className = 'blinking-cursor';
            cursor.textContent = '_';
            terminalContent.lastElementChild.appendChild(cursor);
            
            // Start typing effect
            currentLine = 0;
            currentChar = 0;
            typeTerminal();
            
            terminalObserver.unobserve(entries[0].target);
        }
    });
    
    terminalObserver.observe(document.querySelector('.terminal-preview'));
    
    // Liquid button effect
    const startButton = document.getElementById('btn');
    if (startButton) {
        startButton.addEventListener('mousemove', (e) => {
            const rect = startButton.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const liquid = startButton.querySelector('.liquid');
            liquid.style.left = `${x}px`;
            liquid.style.top = `${y}px`;
        });
    }
    
    // Newsletter form submission
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const successMsg = document.querySelector('.newsletter-success');
            
            // Simulate submission
            newsletterForm.style.display = 'none';
            successMsg.style.display = 'flex';
            
            // Reset after 3 seconds
            setTimeout(() => {
                newsletterForm.style.display = 'flex';
                successMsg.style.display = 'none';
                newsletterForm.reset();
            }, 3000);
        });
    }
});