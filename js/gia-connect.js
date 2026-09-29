/* Screen 3 life-area connection animation (build spec Section 5.3).
   Draws one gentle cubic connector per life area, from the area's node to
   an anchor on the tablet, into the stage SVG. Geometry is measured from
   layout offsets (never transformed rects), on load, after the image and
   fonts load, and on resize (debounced 150ms) - never per frame.
   When the stage is 30% visible, once: tablet, halo, live marker, then
   the areas in order with their lines drawing in, then the text block via
   the shared reveal. After that, ambient loops run while the section is
   visible: live dot pulse, halo breathing, a particle along one connector
   every 4s, and a tablet float. The SVG floats with the tablet, so the
   tablet ends stay on the tablet and the area ends stay inside the 10px
   nodes (the float is 4px, the node radius 5px): lines never detach.
   Under reduced motion, or without GSAP, everything is shown at rest. */

function initGiaConnect(sectionEl) {
  if (!sectionEl) return;

  const stage = sectionEl.querySelector(".gd-connect__stage");
  const svg = sectionEl.querySelector(".gd-connect__lines");
  const device = sectionEl.querySelector(".gd-connect__device");
  const halo = sectionEl.querySelector(".gd-connect__halo");
  const floater = sectionEl.querySelector(".gd-connect__float");
  const frame = sectionEl.querySelector(".gd-connect__frame");
  const image = sectionEl.querySelector(".gd-connect__image");
  const live = sectionEl.querySelector(".gd-connect__live");
  const liveDot = sectionEl.querySelector(".gd-connect__live-dot");
  const items = Array.from(sectionEl.querySelectorAll(".gd-areas__item"));
  const nodes = items.map((item) => item.querySelector(".gd-areas__node"));
  const texts = Array.from(sectionEl.querySelectorAll("[data-connect-reveal]"));
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const stacked = window.matchMedia("(max-width: 1100px)");

  if (!stage || !svg || !device || !floater || !frame || items.length !== 5 || nodes.includes(null)) return;

  const SVG_NS = "http://www.w3.org/2000/svg";
  const ease = (t) => bezier(0.22, 0.61, 0.36, 1, t); // design-system ease

  // Tablet screen area inside the image, and the anchors on it (spec 5.3).
  const SCREEN = { left: 0.045, top: 0.052, width: 0.913, height: 0.895 };
  const ANCHOR_UPPER = 0.34;
  const ANCHOR_LOWER = 0.66;

  // ---------- Missing media ----------

  if (image) {
    const missing = () => frame.classList.add("is-missing");
    if (image.complete && image.naturalWidth === 0 && image.currentSrc) missing();
    image.addEventListener("error", missing);
  }

  // ---------- Geometry ----------

  const lines = items.map(() => {
    const path = document.createElementNS(SVG_NS, "path");
    const end = document.createElementNS(SVG_NS, "circle");
    path.setAttribute("class", "gd-connect__line");
    path.setAttribute("pathLength", "1"); // dash values stay 0-1 at any size
    end.setAttribute("class", "gd-connect__end");
    end.setAttribute("r", "2");
    svg.append(path, end);
    return { path, end, length: 0 };
  });

  const particle = document.createElementNS(SVG_NS, "circle");
  particle.setAttribute("class", "gd-connect__particle");
  particle.setAttribute("r", "2");
  particle.setAttribute("opacity", "0");
  svg.append(particle);

  // Position of el's layout box inside the stage, ignoring transforms.
  function offsetIn(el) {
    let x = 0;
    let y = 0;
    let node = el;
    while (node && node !== stage) {
      x += node.offsetLeft;
      y += node.offsetTop;
      node = node.offsetParent;
    }
    return node === stage ? { x, y, w: el.offsetWidth, h: el.offsetHeight } : null;
  }

  function centreOf(el) {
    const box = offsetIn(el);
    return box ? { x: box.x + box.w / 2, y: box.y + box.h / 2 } : null;
  }

  function curve(from, to, vertical) {
    if (vertical) {
      const dy = (to.y - from.y) / 2;
      return `M${from.x} ${from.y} C${from.x} ${from.y + dy} ${to.x} ${to.y - dy} ${to.x} ${to.y}`;
    }
    const dx = (to.x - from.x) / 2;
    return `M${from.x} ${from.y} C${from.x + dx} ${from.y} ${to.x - dx} ${to.y} ${to.x} ${to.y}`;
  }

  function measure() {
    if (stacked.matches) return;
    const f = offsetIn(frame);
    if (!f || !f.w) return;

    svg.setAttribute("viewBox", `0 0 ${stage.offsetWidth} ${stage.offsetHeight}`);

    const left = f.x + f.w * SCREEN.left;
    const right = f.x + f.w * (SCREEN.left + SCREEN.width);
    const upper = f.y + f.h * (SCREEN.top + SCREEN.height * ANCHOR_UPPER);
    const lower = f.y + f.h * (SCREEN.top + SCREEN.height * ANCHOR_LOWER);
    const anchors = [
      { x: left, y: upper },
      { x: left, y: lower },
      { x: right, y: upper },
      { x: right, y: lower },
      { x: f.x + f.w / 2, y: f.y + f.h }
    ];

    lines.forEach((line, i) => {
      const from = centreOf(nodes[i]);
      if (!from) return;
      const to = anchors[i];
      line.path.setAttribute("d", curve(from, to, i === 4));
      line.end.setAttribute("cx", to.x);
      line.end.setAttribute("cy", to.y);
      line.length = line.path.getTotalLength();
    });
  }

  let resizeTimer = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  });
  if (image && !image.complete) image.addEventListener("load", measure, { once: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  // ---------- Reduced motion / no GSAP: complete composition ----------

  if (reduced || typeof gsap === "undefined" || !("IntersectionObserver" in window)) {
    return;
  }

  // ---------- Starting states (JavaScript only) ----------
  // The text block joins the shared reveal: its hidden state comes from
  // [data-reveal] in base.css, and initReveal() runs at 2.4s.

  texts.forEach((el) => {
    el.setAttribute("data-reveal", "");
    const n = el.getAttribute("data-connect-reveal");
    if (n !== "0") el.setAttribute("data-reveal-delay", n);
  });

  gsap.set(device, { opacity: 0, y: 24 });
  if (halo) gsap.set(halo, { opacity: 0 });
  if (live) gsap.set(live, { opacity: 0 });
  gsap.set(items, { opacity: 0 });
  lines.forEach((line) => gsap.set(line.path, { strokeDashoffset: 1 }));
  gsap.set(lines.map((line) => line.end), { opacity: 0 });

  // Toward the tablet: sideways for areas 1-4, upward for area 5 and for
  // the stacked layout, where the tablet sits above the list.
  function areaFrom(i) {
    if (stacked.matches || i === 4) return { x: 0, y: 16 };
    return { x: i < 2 ? -16 : 16, y: 0 };
  }

  // ---------- Ambient loops ----------

  let visible = false;
  const ambient = [];

  function syncAmbient() {
    ambient.forEach((tween) => (visible ? tween.resume() : tween.pause()));
  }

  function buildAmbient() {
    // Each loop is a yoyo, so one cycle is twice the tween duration.
    if (liveDot) {
      ambient.push(gsap.to(liveDot, { opacity: 0.35, duration: 1.2, ease: "sine.inOut", repeat: -1, yoyo: true }));
    }
    if (halo) {
      ambient.push(gsap.to(halo, { scale: 1.04, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true }));
    }
    // 0 -> -4px -> 0 over 8s; the SVG moves with the tablet.
    ambient.push(gsap.to([floater, svg], {
      y: -4, duration: 4, ease: "sine.inOut", repeat: -1, yoyo: true
    }));

    let next = 0;
    const carry = { t: 0 };
    ambient.push(gsap.timeline({ repeat: -1, repeatDelay: 4 - 1.4 })
      .call(() => {
        carry.line = stacked.matches ? null : lines[next];
        next = (next + 1) % lines.length;
      })
      .fromTo(carry, { t: 0 }, {
        t: 1, duration: 1.4, ease: "sine.inOut",
        onUpdate: () => {
          const line = carry.line;
          if (!line || !line.length) return;
          const pt = line.path.getPointAtLength(carry.t * line.length);
          particle.setAttribute("transform", `translate(${pt.x} ${pt.y})`);
          particle.setAttribute("opacity", Math.min(1, carry.t * 8, (1 - carry.t) * 8));
        }
      }));
    syncAmbient();
  }

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      visible = entry.isIntersecting;
      syncAmbient();
    });
  }).observe(sectionEl);

  // ---------- Sequence (once, at 30% visible) ----------

  function run() {
    const tl = gsap.timeline({ onComplete: buildAmbient });

    tl.to(device, { opacity: 1, y: 0, duration: 0.8, ease: ease }, 0);
    if (halo) tl.to(halo, { opacity: 1, duration: 0.8, ease: "power1.out" }, 0.3);
    if (live) tl.to(live, { opacity: 1, duration: 0.3, ease: "none" }, 0.6);

    items.forEach((item, i) => {
      const at = 0.9 + i * 0.24;
      tl.fromTo(item, { opacity: 0, ...areaFrom(i) }, { opacity: 1, x: 0, y: 0, duration: 0.6, ease: ease }, at);

      const line = lines[i];
      tl.to(line.path, { strokeDashoffset: 0, duration: 0.7, ease: "power1.inOut" }, at + 0.15);
      tl.to(line.end, { opacity: 1, duration: 0.2, ease: "none" }, at + 0.15 + 0.6);
    });

    tl.call(() => initReveal(sectionEl.querySelector(".gd-connect__text")), null, 2.4);
  }

  const trigger = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    trigger.disconnect();
    run();
  }, { threshold: 0.3 });
  trigger.observe(stage);

  // Cubic-bezier easing (x1, y1, x2, y2) solved for x = t.
  function bezier(x1, y1, x2, y2, t) {
    let u = t;
    for (let k = 0; k < 8; k++) {
      const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u - t;
      const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
      if (Math.abs(x) < 1e-5 || !dx) break;
      u -= x / dx;
    }
    u = Math.min(1, Math.max(0, u));
    return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
  }
}

document.addEventListener("DOMContentLoaded", () => initGiaConnect(document.getElementById("screen-3")));
