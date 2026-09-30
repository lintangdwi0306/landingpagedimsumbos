(() => {
  const carousel = document.querySelector("[data-best-seller-carousel]");

  if (!carousel) {
    return;
  }

  const viewport = carousel.querySelector("[data-carousel-viewport]");
  const track = carousel.querySelector(".best-seller-track");
  const cards = Array.from(carousel.querySelectorAll(".best-seller-card"));
  const previousButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const toggleButton = carousel.querySelector("[data-carousel-toggle]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!viewport || !track || cards.length < 2 || !previousButton || !nextButton || !toggleButton) {
    return;
  }

  let autoplayPaused = reducedMotion.matches;
  let pointerInside = false;
  let focusInside = false;
  let timerId = null;

  const updateToggle = () => {
    toggleButton.textContent = autoplayPaused ? "Putar" : "Jeda";
    toggleButton.setAttribute("aria-pressed", String(autoplayPaused));
    toggleButton.setAttribute("aria-label", autoplayPaused ? "Putar carousel otomatis" : "Jeda carousel otomatis");
  };

  const stopAutoplay = () => {
    if (timerId !== null) {
      window.clearInterval(timerId);
      timerId = null;
    }
  };

  const syncAutoplay = () => {
    if (autoplayPaused || pointerInside || focusInside || document.hidden) {
      stopAutoplay();
      return;
    }

    if (timerId === null) {
      timerId = window.setInterval(() => moveCard(1), 3600);
    }
  };

  const moveCard = (direction) => {
    const viewportLeft = viewport.getBoundingClientRect().left;
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    cards.forEach((card, index) => {
      const distance = Math.abs(card.getBoundingClientRect().left - viewportLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nextIndex = (nearestIndex + direction + cards.length) % cards.length;
    const targetLeft = viewport.scrollLeft + cards[nextIndex].getBoundingClientRect().left - viewportLeft;
    viewport.scrollTo({
      left: targetLeft,
      behavior: reducedMotion.matches ? "auto" : "smooth"
    });
  };

  previousButton.addEventListener("click", () => moveCard(-1));
  nextButton.addEventListener("click", () => moveCard(1));
  toggleButton.addEventListener("click", () => {
    autoplayPaused = !autoplayPaused;
    updateToggle();
    syncAutoplay();
  });

  viewport.addEventListener("pointerenter", () => {
    pointerInside = true;
    syncAutoplay();
  });
  viewport.addEventListener("pointerleave", () => {
    pointerInside = false;
    syncAutoplay();
  });
  viewport.addEventListener("focusin", () => {
    focusInside = true;
    syncAutoplay();
  });
  viewport.addEventListener("focusout", () => {
    window.setTimeout(() => {
      focusInside = viewport.contains(document.activeElement);
      syncAutoplay();
    }, 0);
  });

  document.addEventListener("visibilitychange", syncAutoplay);
  reducedMotion.addEventListener("change", (event) => {
    if (event.matches) {
      autoplayPaused = true;
      updateToggle();
    }
    syncAutoplay();
  });

  updateToggle();
  syncAutoplay();
})();
