/* Portfolio page interactions and contact form. */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// Set these IDs from your EmailJS dashboard before publishing.
const EMAILJS_SERVICE_ID = "service_or5f5xr";
const EMAILJS_TEMPLATE_ID = "template_9ckw5ko";
const EMAILJS_PUBLIC_KEY = "N5y8JKgrpdKsKTE4A";

/* Reveal elements as they enter view; keep content visible if observers aren't supported. */
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.05, rootMargin: "0px 0px -40px 0px" });

  $$(".reveal").forEach((el) => io.observe(el));
} else {
  $$(".reveal").forEach((el) => el.classList.add("in"));
}


const nav = $("#nav"), links = $$("#links a");
const sections = links.map((a) => $(a.getAttribute("href")));

function onScroll() {
  if (nav) nav.classList.toggle("scrolled", scrollY > 20);

  let cur = 0;
  sections.forEach((s, i) => {
    if (s && s.getBoundingClientRect().top < innerHeight * 0.4) cur = i;
  });
  links.forEach((a, i) => a.classList.toggle("active", i === cur));
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();


$$("#navbarContent a").forEach((a) => a.addEventListener("click", () => {
  const navbarCollapseEl = $("#navbarContent");
  if (navbarCollapseEl && window.bootstrap) {
    const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseEl);
    if (bsCollapse) bsCollapse.hide();
  }
}));

const yearEl = $("#year");
if (yearEl) yearEl.textContent = new Date().getFullYear();



const form = $("#contactForm"), msg = $("#formMsg"), btn = $("#sendBtn"), toastEl = $("#toast");
function toast(text) {
  if (!toastEl) return;
  toastEl.innerHTML = `<div class="d-flex align-items-center gap-2"><i class="bi bi-check-circle-fill text-success fs-5"></i><span>${text}</span></div>`;
  toastEl.classList.add("show");
  setTimeout(() => toastEl.classList.remove("show"), 3800);
}

function setMsg(text, cls = "") {
  if (!msg) return;
  msg.textContent = text;
  msg.className = "form-msg " + cls;
}

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));
    $$("input,textarea", form).forEach((i) => i.classList.remove("bad"));
    const problems = [];
    if (!data.name || data.name.trim().length < 2) problems.push("name");
    if (!data.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email.trim())) problems.push("email");
    if (!data.message || data.message.trim().length < 10) problems.push("message");
    if (problems.length) {
      problems.forEach((n) => form.elements[n] && form.elements[n].classList.add("bad"));
      return setMsg("Please fix the highlighted fields (message needs 10+ characters).", "err");
    }
    if (data.website) return;
    if (!window.emailjs || [EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY].some((value) => value.startsWith("YOUR_"))) {
      return setMsg("The contact form is not configured yet. Please try again later.", "err");
    }

    btn.disabled = true;
    setMsg("Sending…");
    try {
      await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form, {
        publicKey: EMAILJS_PUBLIC_KEY
      });
      form.reset();
      setMsg("Thanks! Your message was sent.", "ok");
      toast("Message sent successfully!");
    } catch (error) {
      console.error("EmailJS send failed:", error);
      setMsg("Sorry, your message could not be sent. Please try again later.", "err");
    } finally {
      btn.disabled = false;
    }
  });
}
