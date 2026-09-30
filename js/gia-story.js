/* Screen 4 scrub, horizontal modules, progress, final CTA (build spec Section 5.4).
   One normalised progress p over the 650vh runway, smoothed with the
   Screen 1 formula, drives everything: the video time, the simulated
   pull-back scale, each module's translateX / opacity (pure functions of p,
   fully reversible), the final CTA, and the chrome. Under
   reduced motion or on short viewports the static composition in
   gia-story.css is left in place and the walk video is never fetched.
   Brochures (task A6) talk to the story through gd:brochure-open /
   gd:brochure-close events on the section, which freeze and resume p. */

function initGiaStory(sectionEl) {
  if (!sectionEl) return;

  const runway = sectionEl.querySelector(".gd-story__runway");
  const stage = sectionEl.querySelector(".gd-story__stage");
  const video = sectionEl.querySelector(".gd-story__video");
  const finalEl = sectionEl.querySelector(".gd-story__final");
  const progressFill = sectionEl.querySelector(".gd-story__progress-fill");
  const counter = sectionEl.querySelector(".gd-story__counter");
  const count = sectionEl.querySelector(".gd-story__count");
  const ticks = Array.from(sectionEl.querySelectorAll(".gd-story__tick"));
  const moduleEls = Array.from(sectionEl.querySelectorAll(".gd-module"));
  if (!runway || !stage) return;

  const FALLBACK_DURATION = 8.0;
  const FRAME = 1 / 24;
  const TRAVEL = 60;          // vw, enter from +60vw, exit to -60vw
  const DRIFT = 4;            // px, hold drift 4px -> -4px
  const INTERACTIVE = 0.6;    // opacity at which a module becomes interactive

  // Ranges of p (build spec 5.4 table). Module 4.1 is at rest when the pin
  // starts, so it has no enter window.
  const MODULES = [
    { enter: null, exit: [0.13, 0.23] },
    { enter: [0.15, 0.25], exit: [0.36, 0.46] },
    { enter: [0.38, 0.48], exit: [0.59, 0.69] },
    { enter: [0.61, 0.71], exit: [0.80, 0.88] }
  ];
  const FINAL_IN = [0.86, 0.94];
  const SCALE = { from: 1.1, to: 1.0, range: [0.80, 0.98] };

  // GSAP-equivalent eases: power2 is cubic, power1 is quadratic.
  const power2Out = (t) => 1 - Math.pow(1 - t, 3);
  const power2In = (t) => t * t * t;
  const power1InOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
  const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
  const at = (p, range) => clamp01((p - range[0]) / (range[1] - range[0]));

  const modules = moduleEls.map((el, i) => {
    const cfg = MODULES[i] || MODULES[MODULES.length - 1];
    return {
      el,
      enter: cfg.enter,
      exit: cfg.exit,
      holdStart: cfg.enter ? cfg.enter[1] : 0,
      interactive: null,
      x: null,
      y: null,
      o: null
    };
  });

  // Module state as a pure function of p.
  function moduleState(m, p) {
    const holdStart = m.holdStart;
    const holdEnd = m.exit[0];
    if (m.enter && p < m.enter[1]) {
      const t = at(p, m.enter);
      return { x: TRAVEL * (1 - power2Out(t)), y: DRIFT, o: clamp01(t / 0.4) };
    }
    if (p <= holdEnd) {
      const t = at(p, [holdStart, holdEnd]);
      return { x: 0, y: DRIFT - 2 * DRIFT * t, o: 1 };
    }
    const t = at(p, m.exit);
    return { x: -TRAVEL * power2In(t), y: -DRIFT, o: clamp01((1 - t) / 0.4) };
  }

  // inert on threshold crossings only, never per frame.
  function setInteractive(target, on) {
    if (target.interactive === on) return;
    target.interactive = on;
    target.el.inert = !on;
  }

  const final = { el: finalEl, interactive: null, o: null };
  let scale = null;
  let activeChapter = -1;
  let counterHidden = null;

  function render(p) {
    modules.forEach((m) => {
      const s = moduleState(m, p);
      if (s.x !== m.x || s.y !== m.y) {
        m.x = s.x;
        m.y = s.y;
        m.el.style.transform = `translate3d(${s.x.toFixed(3)}vw, ${s.y.toFixed(2)}px, 0)`;
      }
      if (s.o !== m.o) {
        m.o = s.o;
        m.el.style.opacity = s.o.toFixed(3);
      }
      setInteractive(m, s.o >= INTERACTIVE);
    });

    if (final.el) {
      const o = at(p, FINAL_IN);
      if (o !== final.o) {
        final.o = o;
        final.el.style.opacity = o.toFixed(3);
      }
      setInteractive(final, o >= INTERACTIVE);
    }

    if (video) {
      const s = SCALE.from + (SCALE.to - SCALE.from) * power1InOut(at(p, SCALE.range));
      if (s !== scale) {
        scale = s;
        video.style.transform = `scale(${s.toFixed(4)})`;
      }
    }

    if (progressFill) progressFill.style.transform = `scaleX(${p.toFixed(4)})`;

    // Counter switches at each module's hold start; hidden during the final CTA.
    let chapter = 0;
    modules.forEach((m, i) => { if (p >= m.holdStart) chapter = i; });
    if (chapter !== activeChapter) {
      activeChapter = chapter;
      if (count) count.textContent = `${String(chapter + 1).padStart(2, "0")} / ${String(modules.length).padStart(2, "0")}`;
      ticks.forEach((tick, i) => tick.classList.toggle("is-active", i === chapter));
    }
    const hide = p >= FINAL_IN[0];
    if (counter && hide !== counterHidden) {
      counterHidden = hide;
      counter.classList.toggle("is-hidden", hide);
    }
  }

  function clearInline() {
    modules.forEach((m) => {
      m.el.style.transform = "";
      m.el.style.opacity = "";
      m.el.inert = false;
      m.interactive = m.x = m.y = m.o = null;
    });
    if (final.el) {
      final.el.style.opacity = "";
      final.el.inert = false;
    }
    final.interactive = final.o = null;
    if (video) video.style.transform = "";
    if (progressFill) progressFill.style.transform = "";
    scale = counterHidden = null;
    activeChapter = -1;
  }

  // ---------- Runway metrics ----------

  let runwayTop = 0;
  let runwaySpan = 1;

  function measure() {
    runwayTop = runway.getBoundingClientRect().top + window.scrollY;
    runwaySpan = Math.max(1, runway.offsetHeight - stage.offsetHeight);
  }

  function progress() {
    return clamp01((window.scrollY - runwayTop) / runwaySpan);
  }

  // ---------- Video (blob, fetched when Screen 3 is near) ----------

  let duration = FALLBACK_DURATION;
  let videoReady = false;
  let fetchArmed = false;

  function fetchVideo() {
    if (!video || !video.dataset.src || !("fetch" in window)) return;
    fetch(video.dataset.src)
      .then((response) => {
        if (!response.ok) throw new Error(response.status);
        return response.blob();
      })
      .then((blob) => {
        video.addEventListener("loadedmetadata", () => {
          if (isFinite(video.duration) && video.duration > 0) duration = video.duration;
          videoReady = true;
        }, { once: true });
        video.addEventListener("error", () => { videoReady = false; }, { once: true });
        video.preload = "auto";
        video.src = URL.createObjectURL(blob);
      })
      .catch(() => {
        // Missing video: the poster stays as a static background and the
        // module timing still runs on scroll.
      });
  }

  function armFetch() {
    if (fetchArmed) return;
    fetchArmed = true;
    const near = document.getElementById("screen-3") || sectionEl;
    if (!("IntersectionObserver" in window)) {
      fetchVideo();
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      fetchVideo();
    }, { rootMargin: "100% 0px" });
    observer.observe(near);
  }

  // ---------- Loop ----------

  let smoothed = null;
  let rendered = -1;
  let frozen = false;
  let lastNow = 0;
  let rafId = 0;
  let near = false;

  function frame(now) {
    rafId = requestAnimationFrame(frame);
    const dt = lastNow ? (now - lastNow) / 1000 : 0;
    lastNow = now;

    // While a brochure is open the story keeps its current p.
    const target = frozen && smoothed !== null ? smoothed : progress();
    if (smoothed === null) smoothed = target;
    smoothed += (target - smoothed) * (1 - Math.pow(0.001, dt));
    if (Math.abs(target - smoothed) < 0.00005) smoothed = target;

    if (smoothed !== rendered) {
      rendered = smoothed;
      render(smoothed);
    }

    const time = smoothed * duration;
    if (videoReady && !video.seeking && Math.abs(video.currentTime - time) > FRAME) {
      video.currentTime = time;
    }
  }

  function start() {
    if (rafId) return;
    lastNow = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }

  sectionEl.addEventListener("gd:brochure-open", () => { frozen = true; });
  sectionEl.addEventListener("gd:brochure-close", () => { frozen = false; });

  // ---------- Mode: pinned story or static composition ----------

  const staticQuery = window.matchMedia("(prefers-reduced-motion: reduce), (max-height: 560px)");
  let scrub = false;

  function setMode() {
    const want = !staticQuery.matches;
    if (want === scrub) return;
    scrub = want;
    sectionEl.classList.toggle("is-scrub", scrub);
    if (scrub) {
      armFetch();
      measure();
      smoothed = null;
      rendered = -1;
      render(progress());
      if (near) start();
    } else {
      stop();
      clearInline();
    }
  }

  window.addEventListener("resize", () => { if (scrub) measure(); });
  window.addEventListener("load", () => { if (scrub) measure(); });
  if (staticQuery.addEventListener) staticQuery.addEventListener("change", setMode);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        near = entry.isIntersecting;
        if (near && scrub) start();
        else stop();
      });
    }, { rootMargin: "100% 0px" }).observe(sectionEl);
  } else {
    near = true;
  }

  setMode();
}

document.addEventListener("DOMContentLoaded", () => initGiaStory(document.getElementById("screen-4")));
