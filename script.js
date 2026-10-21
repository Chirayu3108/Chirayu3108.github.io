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
   STATEMENT — pinned three-stage scroll:
   1) the headline slides in from the right at an
      enlarged size, each letter sliding up into
      place as it's revealed
   2) once fully revealed, it shrinks down to its
      natural full-width size and stops — it never
      gets any smaller than that, however far you
      keep scrolling
   3) the paragraph below then slowly rises up and
      fades in over its own generous scroll budget
   ============================================ */
const statementSection = document.querySelector(".statement");
const statementHeadline = document.querySelector(".statement-headline");
const statementParagraph = document.querySelector(".statement-paragraph");

if (statementSection && statementHeadline) {
  const fullText = statementHeadline.textContent.trim();
  statementHeadline.textContent = "";
  const accentStart = fullText.indexOf("Experience");

  const chars = [...fullText].map((char, i) => {
    const span = document.createElement("span");
    span.className = "statement-char";
    if (char === "+" || char === "=") span.classList.add("is-operator");
    if (accentStart !== -1 && i >= accentStart) span.classList.add("is-accent");
    span.textContent = char === " " ? " " : char;
    statementHeadline.appendChild(span);
    return span;
  });

  // Reduced motion: skip the scroll-linked pin/translate — the reduced-motion
  // CSS block renders these same spans statically, fully revealed and settled.
  if (!reducedMotion) {
    const BIG_SCALE = 1.7; // how much larger the headline is while entering/revealing
    const SETTLE_GAP_VW = 0.08; // fraction of viewport width short of home where it parks, still big
    const SCROLL_FACTOR = 1.2; // >1 = more vertical scroll needed per px of travel
    const SHRINK_TRAVEL_VH = 0.4; // stage-2 (shrink to natural full-width size) scroll budget
    const PARAGRAPH_REVEAL_VH = 0.7; // stage-3 (paragraph rise-reveal) scroll budget — generous, so it plays out slowly
    const CHAR_RISE_EM = 0.55; // how far below rest each letter starts, in em
    const CHAR_REVEAL_WINDOW = 0.09; // fraction of stage-1 progress over which one letter fades/slides in
    const PARAGRAPH_RISE_EM = 2.5; // how far below rest the paragraph starts, in em

    let offsets = [];
    let maxOffset = 1;
    let startXOffset = 0;
    let parkX = 0;
    let s1 = 0.3; // progress fraction: end of stage 1 (enter + reveal)
    let s2 = 0.5; // progress fraction: end of stage 2 (shrink to natural size — headline is fully settled, full width, and stops changing)

    function layout() {
      offsets = chars.map((c) => c.offsetLeft);
      maxOffset = Math.max(...offsets, 1);
      startXOffset = window.innerWidth; // headline starts one viewport-width right of its natural spot
      parkX = window.innerWidth * SETTLE_GAP_VW;

      const weightEnter = (startXOffset - parkX) * SCROLL_FACTOR;
      const weightShrink = window.innerHeight * SHRINK_TRAVEL_VH * SCROLL_FACTOR;
      const weightReveal = window.innerHeight * PARAGRAPH_REVEAL_VH * SCROLL_FACTOR;
      const total = weightEnter + weightShrink + weightReveal;
      s1 = weightEnter / total;
      s2 = (weightEnter + weightShrink) / total;

      statementSection.style.height = `${window.innerHeight + total}px`;
    }

    function update() {
      const rect = statementSection.getBoundingClientRect();
      const scrollDistance = rect.height - window.innerHeight;
      const progress = scrollDistance > 0
        ? Math.min(1, Math.max(0, -rect.top / scrollDistance))
        : 0;

      const stage1 = Math.min(1, progress / s1);
      const stage2 = s1 < s2
        ? Math.min(1, Math.max(0, (progress - s1) / (s2 - s1)))
        : (progress >= s1 ? 1 : 0);
      const stage3 = s2 < 1
        ? Math.min(1, Math.max(0, (progress - s2) / (1 - s2)))
        : (progress >= s2 ? 1 : 0);

      const currentX = progress <= s1
        ? startXOffset + (parkX - startXOffset) * stage1
        : parkX + (0 - parkX) * stage2;
      // Shrinks from BIG_SCALE down to 1 (its natural, full-width CSS size) and
      // stops there — once stage2 hits 1 the headline is frozen for good, no
      // matter how much further you scroll.
      const currentScale = progress <= s1
        ? BIG_SCALE
        : BIG_SCALE + (1 - BIG_SCALE) * stage2;
      statementHeadline.style.transform = `translateX(${currentX}px) scale(${currentScale})`;

      // Each letter fades and slides up into place over a short window as
      // stage-1 progress passes its left-to-right position in the phrase.
      chars.forEach((c, i) => {
        // Scaled by (1 - CHAR_REVEAL_WINDOW) so the last character's own
        // reveal window still finishes exactly at stage1 = 1, instead of
        // being cut off mid-transition when stage 2 (shrink) begins.
        const charThreshold = (offsets[i] / maxOffset) * (1 - CHAR_REVEAL_WINDOW);
        const t = Math.min(1, Math.max(0, (stage1 - charThreshold) / CHAR_REVEAL_WINDOW));
        c.style.opacity = String(t);
        c.style.transform = `translateY(${(1 - t) * CHAR_RISE_EM}em)`;
      });

      // Paragraph rises up and fades in slowly, once the headline has
      // fully settled (stage 3, spread over its own generous scroll budget).
      if (statementParagraph) {
        statementParagraph.style.opacity = String(stage3);
        statementParagraph.style.transform = `translateY(${(1 - stage3) * PARAGRAPH_RISE_EM}em)`;
      }
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
      <div class="design-visual"></div>
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
