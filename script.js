/* ========================================
   script.js – Load data, generate elements, and handle interactions
   ======================================== */

// ---------- Formspree Configuration ----------
// ✅ Your Formspree endpoint – replace with your own form URL if needed
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mwvrngez';

// ---------- Wait for DOM to load ----------
document.addEventListener('DOMContentLoaded', function() {
    // Extract data from the embedded JSON element
    const dataElement = document.getElementById('site-data');
    if (!dataElement) {
        console.error('❌ Data element not found!');
        return;
    }
    
    let siteData;
    try {
        siteData = JSON.parse(dataElement.textContent);
    } catch (e) {
        console.error('❌ Error parsing JSON:', e);
        return;
    }
    
    // Initialize all site sections
    initThemeToggle();                       // Dark/light mode switcher
    initStickyDownload();                     // Sticky download button
    initMobileMenu();                          // Mobile hamburger menu
    populateStats(siteData.profile.stats);     // Statistics cards
    populateEducation(siteData.education);      // Education timeline
    populateSkills(siteData.skills);            // Skills slider
    populateCertifications(siteData.certifications, siteData.languages); // Certifications & languages
    initCompanyTabs(siteData.experiences);      // Company tabs and experience details
    populateProjects(siteData.projects);         // Projects grid
    populateResearch(siteData.research);         // Research cards
    populateTestimonials(siteData.testimonials); // Testimonials slider
    populateContact(siteData.contact);           // Contact info & form (Formspree)
    initSmoothScroll();                          // Smooth scroll for anchor links
    initActiveNav();                             // Active navigation highlight on scroll
    setCurrentYear();                            // Current year in footer
});

// ---------- Theme Toggle (Dark/Light) ----------
function initThemeToggle() {
    const toggle = document.getElementById('darkmode-toggle');
    if (!toggle) return;
    
    // Retrieve saved preference
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        toggle.checked = true;
    }
    
    toggle.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    });
}

// ---------- Sticky Download Button (appears on scroll) ----------
function initStickyDownload() {
    const sticky = document.querySelector('.sticky-download');
    const hero = document.querySelector('#home');
    if (!sticky || !hero) return;
    
    window.addEventListener('scroll', function() {
        const heroBottom = hero.offsetTop + hero.offsetHeight;
        if (window.scrollY > heroBottom - 100) {
            sticky.classList.add('visible');
        } else {
            sticky.classList.remove('visible');
        }
    });
}

// ---------- Mobile Hamburger Menu ----------
function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (!hamburger || !navMenu) return;
    
    hamburger.addEventListener('click', function() {
        navMenu.classList.toggle('active');
        // Animate hamburger icon
        const spans = this.querySelectorAll('span');
        spans.forEach(span => span.classList.toggle('active'));
    });
    
    // Close menu when clicking a link
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
        });
    });
}

// ---------- Populate Statistics ----------
function populateStats(stats) {
    const container = document.getElementById('stats-grid');
    if (!container || !stats) return;
    
    const statItems = [
        { label: 'Years of Experience', value: stats.yearsOfExperience },
        { label: 'Projects Completed', value: stats.projectsCompleted },
        { label: 'Sectors Served', value: stats.sectorsServed },
        { label: 'Research Projects', value: stats.researchProjects },
        { label: 'Certifications', value: stats.certifications }
    ];
    
    container.innerHTML = statItems.map(item => `
        <div class="stat-card">
            <span class="stat-number">${item.value}</span>
            <span class="stat-label">${item.label}</span>
        </div>
    `).join('');
}

// ---------- Populate Education Timeline ----------
function populateEducation(education) {
    const container = document.getElementById('education-timeline');
    if (!container || !education) return;
    
    container.innerHTML = education.map((edu, index) => `
        <div class="timeline-item" style="--item-index: ${index}">
            <div class="timeline-icon"><i class="fas fa-graduation-cap"></i></div>
            <div class="timeline-content">
                <h4>${edu.degree}</h4>
                <p class="institution">${edu.institution} · ${edu.period}</p>
                <p>${edu.details}</p>
            </div>
        </div>
    `).join('');
}

// ---------- Populate Skills Slider ----------
function populateSkills(skills) {
    const container = document.getElementById('skills-slider');
    if (!container || !skills) return;
    
    container.innerHTML = skills.map(skill => `
        <div class="skill-card">
            <i class="fas fa-${skill.icon}"></i>
            <h4>${skill.name}</h4>
            <p>${skill.description}</p>
        </div>
    `).join('');
    
    // Initialize skills slider
    setupSlider('.skills-slider', '.skills-slider-container .prev', '.skills-slider-container .next');
}

// ---------- Populate Certifications & Languages ----------
function populateCertifications(certifications, languages) {
    const container = document.getElementById('cert-lang');
    if (!container) return;
    
    let certsHtml = '<div class="certifications"><h3 class="subsection-title">Certifications</h3>';
    certifications.forEach(cert => {
        certsHtml += `
            <div class="cert-item">
                <div class="cert-icon"><i class="fas fa-${cert.icon}"></i></div>
                <div class="cert-info">
                    <h4>${cert.name}</h4>
                    <p>${cert.issuer} · ${cert.year}</p>
                </div>
            </div>
        `;
    });
    certsHtml += '</div>';
    
    let langsHtml = '<div class="languages"><h3 class="subsection-title">Languages</h3>';
    languages.forEach(lang => {
        langsHtml += `
            <div class="language-item">
                <span>${lang.name}</span>
                <span>${lang.level}</span>
            </div>
        `;
    });
    langsHtml += '</div>';
    
    container.innerHTML = certsHtml + langsHtml;
}

// ---------- Initialize Company Tabs (Horizontal Scrolling) ----------
function initCompanyTabs(experiences) {
    const tabsContainer = document.getElementById('companyTabs');
    const detailDiv = document.getElementById('expDetail');
    if (!tabsContainer || !detailDiv || !experiences) return;
    
    // Create tab buttons
    tabsContainer.innerHTML = experiences.map((exp, index) => `
        <button class="tab-btn ${index === 0 ? 'active' : ''}" data-company-id="${exp.id}">
            ${exp.company}
        </button>
    `).join('');
    
    // Show first company by default
    if (experiences.length > 0) {
        showExperienceDetail(experiences[0].id);
    }
    
    // Add click event to each tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const companyId = this.dataset.companyId;
            showExperienceDetail(companyId);
        });
    });
    
    // Setup tab scrolling arrows
    setupTabScrolling();
}

// Show experience details based on company ID
function showExperienceDetail(companyId) {
    const dataElement = document.getElementById('site-data');
    if (!dataElement) return;
    const siteData = JSON.parse(dataElement.textContent);
    const exp = siteData.experiences.find(e => e.id === companyId);
    if (!exp) return;
    
    const detailDiv = document.getElementById('expDetail');
    const achievementsHtml = exp.achievements.map(ach => `<li>${ach}</li>`).join('');
    
    detailDiv.innerHTML = `
        <h3>${exp.company}</h3>
        <h4>${exp.role}</h4>
        <div class="exp-meta">
            <span><i class="fas fa-calendar-alt"></i> ${exp.period}</span>
            <span><i class="fas fa-map-marker-alt"></i> ${exp.location}</span>
        </div>
        <p>${exp.summary}</p>
        <h5>Key Achievements</h5>
        <ul>${achievementsHtml}</ul>
        <h5>Contribution to the Company</h5>
        <p>${exp.contribution}</p>
        <h5>Professional Growth</h5>
        <p>${exp.growth}</p>
    `;
}

// Horizontal scrolling for company tabs
function setupTabScrolling() {
    const container = document.querySelector('.company-tabs');
    const prevBtn = document.querySelector('.tab-scroll-btn.prev');
    const nextBtn = document.querySelector('.tab-scroll-btn.next');
    if (!container || !prevBtn || !nextBtn) return;
    
    const scrollAmount = 200;
    
    prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    // Update button states (enable/disable) on scroll
    const updateButtons = () => {
        prevBtn.disabled = container.scrollLeft <= 10;
        nextBtn.disabled = container.scrollLeft + container.clientWidth >= container.scrollWidth - 10;
    };
    
    container.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons(); // Initial check
}

// ---------- Populate Projects (9 projects) ----------
function populateProjects(projects) {
    const container = document.getElementById('projectsGrid');
    if (!container || !projects) return;
    
    container.innerHTML = projects.map((project, index) => {
        // Format start and end dates
        const start = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : '';
        const end = project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 'Present';
        const dateRange = start ? `${start} – ${end}` : project.duration;
        
        return `
        <div class="project-card" data-project-id="${project.id}" style="--card-index: ${index}">
            <img src="${project.image}" alt="${project.title}" onerror="this.src='https://placehold.co/600x400'">
            <div class="project-info">
                <h3>${project.title}</h3>
                <div class="project-meta">
                    <span><i class="fas fa-clock"></i> ${dateRange}</span>
                    <span><i class="fas fa-tag"></i> ${project.status}</span>
                </div>
                <p class="project-summary">${project.summary}</p>
                <button class="btn-details">View Case Study <i class="fas fa-chevron-right"></i></button>
            </div>
        </div>
    `}).join('');
    
    // Add click event to project cards to open modal
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('click', function(e) {
            const projectId = this.dataset.projectId;
            showProjectModal(projectId);
        });
    });
}

// Show project details in modal
function showProjectModal(projectId) {
    const dataElement = document.getElementById('site-data');
    if (!dataElement) return;
    const siteData = JSON.parse(dataElement.textContent);
    const project = siteData.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const caseStudy = project.caseStudy || {};
    
    // Format dates
    const start = project.startDate ? new Date(project.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
    const end = project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Present';
    const dateRange = start ? `${start} – ${end}` : project.duration;
    
    modalBody.innerHTML = `
        <h2>${project.title}</h2>
        <p><strong>Company:</strong> ${getCompanyName(project.companyId)}</p>
        <p><strong>Duration:</strong> ${dateRange}</p>
        <p><strong>Status:</strong> ${project.status}</p>
        <p><strong>Summary:</strong> ${project.summary}</p>
        
        <h3>Situation</h3>
        <p>${caseStudy.situation || 'No details provided.'}</p>
        
        <h3>Problem</h3>
        <p>${caseStudy.problem || 'No details provided.'}</p>
        
        <h3>Analysis</h3>
        <p>${caseStudy.analysis || 'No details provided.'}</p>
        
        <h3>Solution</h3>
        <p>${caseStudy.solution || 'No details provided.'}</p>
        
        <h3>Execution</h3>
        <p>${caseStudy.execution || 'No details provided.'}</p>
        
        <h3>Results</h3>
        <p>${caseStudy.results || 'No details provided.'}</p>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Get company name from company ID
function getCompanyName(companyId) {
    const dataElement = document.getElementById('site-data');
    if (!dataElement) return '';
    const siteData = JSON.parse(dataElement.textContent);
    const exp = siteData.experiences.find(e => e.id === companyId);
    return exp ? exp.company : '';
}

// ---------- Populate Research ----------
function populateResearch(research) {
    const container = document.getElementById('researchGrid');
    if (!container || !research) return;
    
    container.innerHTML = research.map(item => `
        <div class="research-card" data-research-id="${item.id}">
            <img src="${item.image}" alt="${item.title}" onerror="this.src='https://placehold.co/600x400'">
            <h3>${item.title}</h3>
            <p>${item.abstract.substring(0, 120)}...</p>
            <button class="btn-research">Read More <i class="fas fa-arrow-right"></i></button>
        </div>
    `).join('');
    
    // Add click event to research buttons
    document.querySelectorAll('.research-card').forEach(card => {
        const btn = card.querySelector('.btn-research');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const researchId = card.dataset.researchId;
                showResearchModal(researchId);
            });
        }
    });
}

// Show research details in modal
function showResearchModal(researchId) {
    const dataElement = document.getElementById('site-data');
    if (!dataElement) return;
    const siteData = JSON.parse(dataElement.textContent);
    const research = siteData.research.find(r => r.id === researchId);
    if (!research) return;
    
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    
    modalBody.innerHTML = `
        <h2>${research.title}</h2>
        <p><strong>Abstract:</strong> ${research.abstract}</p>
        <h3>Methodology</h3>
        <p>${research.methodology}</p>
        <h3>Outcomes</h3>
        <p>${research.outcomes}</p>
    `;
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// ---------- Populate Testimonials Slider ----------
function populateTestimonials(testimonials) {
    const container = document.getElementById('testimonialsSlider');
    if (!container || !testimonials) return;
    
    container.innerHTML = testimonials.map(t => `
        <div class="testimonial-card">
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-author">
                <strong>${t.name}</strong>
                <span>${t.relation}</span>
                <div class="author-links">
                    <a href="${t.linkedin}" target="_blank"><i class="fab fa-linkedin"></i></a>
                    <a href="mailto:${t.email}"><i class="fas fa-envelope"></i></a>
                </div>
            </div>
        </div>
    `).join('');
    
    // Initialize testimonials slider
    setupSlider('.testimonials-slider', '.testimonials-slider-container .prev', '.testimonials-slider-container .next');
}

// ---------- Generic Slider Setup ----------
function setupSlider(sliderSelector, prevBtnSelector, nextBtnSelector) {
    const slider = document.querySelector(sliderSelector);
    const prevBtn = document.querySelector(prevBtnSelector);
    const nextBtn = document.querySelector(nextBtnSelector);
    if (!slider || !prevBtn || !nextBtn) return;
    
    const scrollAmount = 350;
    
    prevBtn.addEventListener('click', () => {
        slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    
    nextBtn.addEventListener('click', () => {
        slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });
    
    const updateButtons = () => {
        prevBtn.disabled = slider.scrollLeft <= 10;
        nextBtn.disabled = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10;
    };
    
    slider.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    updateButtons();
}

// ---------- Populate Contact Info & Form (Formspree) ----------
function populateContact(contact) {
    const wrapper = document.getElementById('contactWrapper');
    if (!wrapper || !contact) return;
    
    wrapper.innerHTML = `
        <div class="contact-info">
            <div class="contact-item"><i class="fas fa-envelope"></i> <a href="mailto:${contact.email}">${contact.email}</a></div>
            <div class="contact-item"><i class="fas fa-phone-alt"></i> <a href="tel:${contact.phone}">${contact.phone}</a></div>
            <div class="contact-item"><i class="fab fa-linkedin"></i> <a href="${contact.linkedin}" target="_blank">LinkedIn</a></div>
            <div class="contact-item"><i class="fab fa-github"></i> <a href="${contact.github}" target="_blank">GitHub</a></div>
            <div class="contact-item"><i class="fas fa-map-marker-alt"></i> ${contact.location}</div>
        </div>
        <form class="contact-form" id="contactForm" action="${FORMSPREE_ENDPOINT}" method="POST">
            <input type="text" name="name" placeholder="Your name" required>
            <input type="email" name="email" placeholder="Your email" required>
            <textarea name="message" rows="5" placeholder="Your message" required></textarea>
            <button type="submit" class="btn btn-primary">Send Message</button>
        </form>
    `;
    
    // Formspree handles the submission and shows a default thank you page
    // Optional: add a success message handler (not recommended as it conflicts)
    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            // Do not prevent default – Formspree handles it
            console.log('Form submitted to Formspree');
        });
    }
}

// ---------- Modal Setup ----------
(function setupModal() {
    const modal = document.getElementById('modal');
    const closeBtn = document.querySelector('.close-modal');
    if (!modal || !closeBtn) return;
    
    closeBtn.addEventListener('click', function() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
})();

// ---------- Smooth Scroll for Navigation ----------
function initSmoothScroll() {
    document.querySelectorAll('.nav-menu a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ---------- Active Navigation Highlight on Scroll ----------
function initActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= sectionTop && pageYOffset < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ---------- Set Current Year in Footer ----------
function setCurrentYear() {
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
}