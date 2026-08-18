/* ============================================
   HERO TITLE — split each line into per-letter
   spans for a staggered reveal on load.
   ============================================ */
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const heroLines = document.querySelectorAll(".hero-title .hero-line");

heroLines.forEach((lineEl, lineIndex) => {
  const text = lineEl.textContent;
  lineEl.textContent = "";

  let lastChar;
  [...text].forEach((char, charIndex) => {
    const charEl = document.createElement("span");
    charEl.className = "hero-char";
    charEl.textContent = char === " " ? " " : char;
    if (!reducedMotion) {
      charEl.style.animationDelay = `${0.45 + lineIndex * 0.12 + charIndex * 0.02}s`;
    }
    lineEl.appendChild(charEl);
    lastChar = charEl;
  });

  // overflow:hidden on the line only masks the slide-up reveal; once it's
  // done, lift it so descenders (e.g. the "g" in "Designer") aren't clipped.
  if (reducedMotion) {
    lineEl.classList.add("reveal-done");
  } else if (lastChar) {
    lastChar.addEventListener("animationend", () => lineEl.classList.add("reveal-done"), { once: true });
  }
});

/* ============================================
   STATEMENT — pinned section where vertical
   scroll drives the text leftward across the
   screen, revealing one letter at a time as it
   crosses a fixed point on screen.
   ============================================ */
const statementSection = document.querySelector(".statement");
const statementText = document.querySelector(".statement-text");

if (statementSection && statementText) {
  const fullText = statementText.textContent.trim();
  statementText.textContent = "";
  const accentStart = fullText.indexOf("Experience");

  // Characters are grouped into per-word wrapper spans so that, if the line
  // wraps (reduced-motion / narrow layouts), it only breaks between words.
  const chars = [];
  let idx = 0;
  fullText.split(" ").forEach((word, wordIndex, words) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "statement-word";
    statementText.appendChild(wordSpan);

    for (const char of word) {
      const span = document.createElement("span");
      span.className = "statement-char";
      if (accentStart !== -1 && idx >= accentStart) span.classList.add("is-accent");
      span.textContent = char;
      wordSpan.appendChild(span);
      chars.push(span);
      idx++;
    }

    if (wordIndex < words.length - 1) {
      const space = document.createElement("span");
      space.className = "statement-char";
      if (accentStart !== -1 && idx >= accentStart) space.classList.add("is-accent");
      space.textContent = " ";
      statementText.appendChild(space);
      chars.push(space);
      idx++;
    }
  });

  // Reduced motion: skip the scroll-linked pin/translate — the reduced-motion
  // CSS block renders these same spans statically, fully revealed.
  if (!reducedMotion) {
    const THRESHOLD_RATIO = 0.42; // where on screen (from left) letters reveal
    const SCROLL_FACTOR = 1.2; // >1 = more vertical scroll needed per px of horizontal travel
    let offsets = [];
    let startX = 0;
    let endX = 0;

    function layout() {
      offsets = chars.map((c) => c.offsetLeft);
      const textWidth = statementText.scrollWidth;
      const thresholdX = window.innerWidth * THRESHOLD_RATIO;
      startX = window.innerWidth;
      endX = thresholdX - textWidth - 80;
      const travel = startX - endX;
      statementSection.style.height = `${window.innerHeight + travel * SCROLL_FACTOR}px`;
    }

    function update() {
      const rect = statementSection.getBoundingClientRect();
      const scrollDistance = rect.height - window.innerHeight;
      const progress = scrollDistance > 0
        ? Math.min(1, Math.max(0, -rect.top / scrollDistance))
        : 0;

      const thresholdX = window.innerWidth * THRESHOLD_RATIO;
      const currentX = startX + (endX - startX) * progress;
      statementText.style.transform = `translateX(${currentX}px)`;

      chars.forEach((c, i) => {
        c.classList.toggle("is-revealed", currentX + offsets[i] <= thresholdX);
      });
    }

    layout();
    update();

    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    }, { passive: true });

    window.addEventListener("resize", () => {
      layout();
      update();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        layout();
        update();
      });
    }
  }
}

/* ============================================
   DESIGN WORK — data-driven gallery
   Add a new object here to add a new project;
   the first entry in the array renders large.
   ============================================ */
const designWork = [
  {
    title: "This Portfolio",
    category: "Web Design / UI-UX",
    year: "2026",
    description: "Editorial redesign of this site — typography-led layout, a restrained motion system, and a design language built to sit next to the code that runs it.",
  },
  {
    title: "The Phoenix News",
    category: "Editorial Layout",
    year: "2025 – 2026",
    description: "Print and digital page layouts for a student newsroom, balancing readability and hierarchy against real publication deadlines.",
  },
];

const gallery = document.getElementById("design-gallery");
if (gallery) {
  designWork.forEach((item, i) => {
    const card = document.createElement("article");
    card.className = "design-card reveal" + (i === 0 ? " featured" : "");
    card.innerHTML = `
      <div class="design-visual" data-cursor="EXPLORE"></div>
      <div class="design-meta"><span>${item.category}</span><span>${item.year}</span></div>
      <h3 class="design-card-title">${item.title}</h3>
      <p class="design-card-desc">${item.description}</p>
    `;
    gallery.appendChild(card);
  });
}

/* ============================================
   SCROLL REVEAL — one observer for every
   .reveal element, added after gallery render
   so dynamic cards are included.
   ============================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ============================================
   NAV — scroll background state + active link
   ============================================ */
const header = document.getElementById("site-header");
let lastScrollCheck = false;

function updateHeaderState() {
  const scrolled = window.scrollY > 10;
  if (scrolled !== lastScrollCheck) {
    header.classList.toggle("scrolled", scrolled);
    lastScrollCheck = scrolled;
  }
}
window.addEventListener("scroll", updateHeaderState, { passive: true });
updateHeaderState();

const navLinksByTarget = {};
document.querySelectorAll(".nav-links a[data-nav]").forEach((a) => {
  navLinksByTarget[a.dataset.nav] = a;
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = navLinksByTarget[entry.target.dataset.nav];
      if (!link) return;
      if (entry.isIntersecting) {
        Object.values(navLinksByTarget).forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
      }
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

document.querySelectorAll("[data-nav]").forEach((section) => {
  if (navLinksByTarget[section.dataset.nav]) sectionObserver.observe(section);
});

/* ============================================
   HAMBURGER MENU
   ============================================ */
const hamburger = document.getElementById("hamburger");
const navLinks = document.getElementById("nav-links");

if (hamburger && navLinks) {
  const closeMenu = () => {
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    navLinks.classList.remove("open");
  };

  hamburger.addEventListener("click", () => {
    const open = hamburger.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", String(open));
    navLinks.classList.toggle("open", open);
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) closeMenu();
  });
}

/* ============================================
   CUSTOM CURSOR — desktop pointer devices only,
   respects prefers-reduced-motion
   ============================================ */
const supportsCursor =
  window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (supportsCursor) {
  document.documentElement.classList.add("has-cursor");
  const dot = document.getElementById("cursor-dot");
  const label = dot.querySelector("span");
  let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function follow() {
    dotX += (mouseX - dotX) * 0.18;
    dotY += (mouseY - dotY) * 0.18;
    dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
    requestAnimationFrame(follow);
  }
  requestAnimationFrame(follow);

  document.addEventListener("mouseover", (e) => {
    const target = e.target.closest("[data-cursor]");
    if (target) {
      dot.classList.add("active");
      label.textContent = target.dataset.cursor;
    }
  });

  document.addEventListener("mouseout", (e) => {
    const target = e.target.closest("[data-cursor]");
    if (target && !e.relatedTarget?.closest("[data-cursor]")) {
      dot.classList.remove("active");
    }
  });
}

/* ============================================
   CONTACT FORM — opens email client prefilled
   ============================================ */
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("contact-name").value;
    const email = document.getElementById("contact-email").value;
    const message = document.getElementById("contact-message").value;

    const subject = `Portfolio Contact from ${name}`;
    const body = `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`;

    window.location.href =
      `mailto:chirayu.ahuja3108@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
