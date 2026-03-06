import "./style.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const body = document.body;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const saveData = navigator.connection?.saveData === true;
const richMediaEnabled = !prefersReducedMotion && !saveData;

const splashScreen = document.querySelector(".splash-screen");
const progressBar = document.querySelector(".progress-bar span");
const cursor = document.querySelector(".cursor");
const heroVideo = document.querySelector(".hero__video");
const heroDepth = document.querySelector(".hero__depth");
const magneticItems = document.querySelectorAll(".magnetic");
const revealItems = document.querySelectorAll("[data-reveal]");
const floatingCards = Array.from(document.querySelectorAll(".floating-card"));
const impactTrack = document.querySelector(".impact__track");
const impactSection = document.querySelector(".impact");
const impactViewport = document.querySelector(".impact__viewport");
const contactForm = document.getElementById("contact-form");
const contactStatus = document.getElementById("contact-status");
const donationCustom = document.getElementById("donation-custom");
const donationLink = document.getElementById("donate-link");
const donationStatus = document.getElementById("donation-status");
const donationAmountButtons = Array.from(document.querySelectorAll("[data-amount]"));
const donationFrequencyButtons = Array.from(document.querySelectorAll("[data-frequency]"));

const pointer = {
  x: window.innerWidth * 0.5,
  y: window.innerHeight * 0.5,
};

const donationState = {
  amount: 25,
  frequency: "one-time",
};

let scrollProgress = 0;

body.classList.add("is-loading");

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const createMailtoUrl = (subject, bodyText) =>
  `mailto:hello@limitlessart.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;

const startIntro = () => {
  if (!richMediaEnabled || !splashScreen) {
    body.classList.remove("is-loading");
    return;
  }

  const timeline = gsap.timeline({
    defaults: { ease: "power3.out" },
    onComplete: () => {
      splashScreen.remove();
      body.classList.remove("is-loading");
    },
  });

  timeline
    .from(".splash-screen__label", { opacity: 0, y: 20, duration: 0.65 })
    .from(".splash-screen__title span", { opacity: 0, yPercent: 115, stagger: 0.08, duration: 0.8 }, "-=0.3")
    .from(".splash-screen__line", { scaleX: 0, duration: 0.7 }, "-=0.55")
    .to(".splash-screen__core", { opacity: 0, y: -24, duration: 0.65, delay: 0.18 })
    .to(".splash-screen", { opacity: 0, duration: 0.5 }, "-=0.25");
};

const initPointerTracking = () => {
  window.addEventListener("pointermove", (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
};

const initCursor = () => {
  if (prefersReducedMotion || window.matchMedia("(hover: none)").matches || !cursor) {
    return;
  }

  const moveX = gsap.quickTo(cursor, "x", { duration: 0.2, ease: "power3" });
  const moveY = gsap.quickTo(cursor, "y", { duration: 0.2, ease: "power3" });

  window.addEventListener("pointermove", (event) => {
    cursor.style.opacity = "1";
    moveX(event.clientX);
    moveY(event.clientY);
  });

  document.querySelectorAll("a, button, .glass").forEach((element) => {
    element.addEventListener("pointerenter", () => {
      gsap.to(cursor, { scale: 2.6, duration: 0.25, ease: "power2.out" });
    });

    element.addEventListener("pointerleave", () => {
      gsap.to(cursor, { scale: 1, duration: 0.25, ease: "power2.out" });
    });
  });
};

const initMagnetic = () => {
  if (prefersReducedMotion) {
    return;
  }

  magneticItems.forEach((item) => {
    const depth = Number(item.dataset.depth || 0.12);

    item.addEventListener("pointermove", (event) => {
      const rect = item.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;

      gsap.to(item, {
        x: offsetX * depth,
        y: offsetY * depth,
        rotateX: -offsetY * 0.045,
        rotateY: offsetX * 0.045,
        duration: 0.55,
        ease: "power3.out",
        transformPerspective: 900,
      });
    });

    item.addEventListener("pointerleave", () => {
      gsap.to(item, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "elastic.out(1, 0.4)",
      });
    });
  });
};

const initReveals = () => {
  if (prefersReducedMotion) {
    revealItems.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    return;
  }

  revealItems.forEach((item) => {
    gsap.fromTo(
      item,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: item,
          start: "top 82%",
        },
      },
    );
  });
};

const initHeroMotion = () => {
  if (!richMediaEnabled) {
    return;
  }

  gsap.to(".hero__video", {
    scale: 1,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".hero__copy", {
    yPercent: -18,
    opacity: 0.5,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".hero__stats", {
    yPercent: -24,
    rotate: -6,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });
};

const initImpactScroll = () => {
  if (prefersReducedMotion || !impactTrack || !impactSection || !impactViewport) {
    return;
  }

  ScrollTrigger.matchMedia({
    "(min-width: 861px)": () => {
      const getDistance = () =>
        Math.max(0, impactTrack.scrollWidth - impactViewport.clientWidth - 24);

      const tween = gsap.to(impactTrack, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: impactSection,
          start: "top top",
          end: () => `+=${getDistance() + window.innerHeight * 1.1}`,
          scrub: true,
          pin: impactViewport,
          invalidateOnRefresh: true,
        },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        gsap.set(impactTrack, { clearProps: "transform" });
      };
    },
    "(max-width: 860px)": () => {
      gsap.set(impactTrack, { clearProps: "transform" });
    },
  });
};

const initProgressBar = () => {
  if (!progressBar) {
    return;
  }

  gsap.to(progressBar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      start: 0,
      end: "max",
      scrub: true,
    },
  });
};

const initDepthParallax = () => {
  if (!richMediaEnabled || !heroDepth) {
    return;
  }

  const layers = heroDepth.querySelectorAll(".depth-layer");

  window.addEventListener("pointermove", (event) => {
    const offsetX = (event.clientX / window.innerWidth - 0.5) * 36;
    const offsetY = (event.clientY / window.innerHeight - 0.5) * 24;

    layers.forEach((layer, index) => {
      const scale = (index + 1) * 0.7;
      gsap.to(layer, {
        x: offsetX * scale,
        y: offsetY * scale,
        duration: 1.4,
        ease: "power3.out",
      });
    });
  });
};

const initVideoPlayback = () => {
  if (!heroVideo) {
    return;
  }

  if (!richMediaEnabled) {
    heroVideo.pause();
    heroVideo.closest(".hero__video-shell")?.classList.add("is-static");
    return;
  }

  heroVideo.play().catch(() => {
    heroVideo.closest(".hero__video-shell")?.classList.add("is-static");
  });
};

const initContactForm = () => {
  if (!contactForm || !contactStatus) {
    return;
  }

  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const organization = String(formData.get("organization") || "").trim() || "Not provided";
    const interest = String(formData.get("interest") || "Workshop Booking");
    const message = String(formData.get("message") || "").trim();

    const subject = `Limitless Art inquiry — ${interest}`;
    const bodyText = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Organization: ${organization}`,
      `Interest: ${interest}`,
      "",
      "Project details:",
      message,
    ].join("\n");

    contactStatus.textContent = "Opening your email app with a prefilled inquiry.";
    window.location.href = createMailtoUrl(subject, bodyText);
  });
};

const initDonationFlow = () => {
  if (!donationLink || !donationStatus) {
    return;
  }

  const syncDonationUi = () => {
    const customAmount = Number.parseInt(String(donationCustom?.value || ""), 10);
    const hasCustomAmount = Number.isFinite(customAmount) && customAmount >= 10;
    const amount = hasCustomAmount ? customAmount : donationState.amount;
    const amountLabel = currencyFormatter.format(amount);
    const frequencyLabel = donationState.frequency === "monthly" ? "monthly" : "one-time";

    donationFrequencyButtons.forEach((button) => {
      const isActive = button.dataset.frequency === donationState.frequency;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    donationAmountButtons.forEach((button) => {
      const isActive = !hasCustomAmount && Number(button.dataset.amount) === donationState.amount;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    donationLink.textContent =
      donationState.frequency === "monthly" ? `Pledge ${amountLabel}/mo` : `Pledge ${amountLabel}`;
    donationLink.href = createMailtoUrl(
      `Limitless Art ${frequencyLabel} donation`,
      [
        `I want to support Limitless Art with a ${amountLabel} ${frequencyLabel} gift.`,
        "",
        "Name:",
        "Preferred contact:",
        "Notes:",
      ].join("\n"),
    );
    donationStatus.textContent = `${amountLabel} ${frequencyLabel} gift opens as a prefilled email draft.`;
  };

  donationAmountButtons.forEach((button) => {
    button.addEventListener("click", () => {
      donationState.amount = Number(button.dataset.amount || donationState.amount);
      if (donationCustom) {
        donationCustom.value = "";
      }
      syncDonationUi();
    });
  });

  donationFrequencyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      donationState.frequency = button.dataset.frequency || donationState.frequency;
      syncDonationUi();
    });
  });

  donationCustom?.addEventListener("input", syncDonationUi);
  syncDonationUi();
};

const initThreeBackground = async () => {
  if (!richMediaEnabled) {
    return;
  }

  const canvas = document.getElementById("scene");
  if (!canvas) {
    return;
  }

  const { initThreeScene } = await import("./three-scene.js");
  initThreeScene({
    canvas,
    floatingCards,
    getPointer: () => ({
      x: pointer.x,
      y: pointer.y,
      width: window.innerWidth,
      height: window.innerHeight,
    }),
    getScrollProgress: () => scrollProgress,
  });
};

startIntro();
initPointerTracking();
initCursor();
initMagnetic();
initReveals();
initHeroMotion();
initImpactScroll();
initProgressBar();
initDepthParallax();
initVideoPlayback();
initContactForm();
initDonationFlow();
initThreeBackground().catch(() => {});

ScrollTrigger.create({
  start: 0,
  end: "max",
  onUpdate: (self) => {
    scrollProgress = self.progress;
  },
});

window.addEventListener("load", () => {
  ScrollTrigger.refresh();
});
