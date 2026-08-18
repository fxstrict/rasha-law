/**
 * رشا حسن — التفاعلات الرئيسية للموقع
 */
(function () {
  "use strict";

  /* ---------- تفعيل السنة الحالية بالفوتر ---------- */
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- تفعيل روابط الاتصال والمعلومات المركزية ---------- */
  document.querySelectorAll("[data-phone-display]").forEach((el) => {
    el.textContent = SITE_CONFIG.phoneDisplay;
  });
  document.querySelectorAll("[data-tel-link]").forEach((el) => {
    el.href = buildTelLink();
  });
  document.querySelectorAll("[data-fb-link]").forEach((el) => {
    el.href = SITE_CONFIG.social.facebook;
  });

  /* ---------- ربط كل أزرار واتساب حسب data-wa-key ---------- */
  function bindWhatsAppButtons(root) {
    (root || document).querySelectorAll("[data-wa-key]").forEach((el) => {
      const key = el.getAttribute("data-wa-key");
      el.href = buildWhatsAppLink(key);
      el.target = "_blank";
      el.rel = "noopener";
    });
  }
  bindWhatsAppButtons();

  /* ---------- مشاركة المقال (واتساب / فيسبوك / X / نسخ الرابط / مشاركة الجهاز) ---------- */
  function bindArticleShare() {
    const container = document.querySelector("[data-article-share]");
    if (!container) return;

    const titleMeta = document.querySelector('meta[property="og:title"]');
    const descMeta = document.querySelector('meta[property="og:description"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    const shareTitle = (titleMeta && titleMeta.content) || document.title;
    const shareText = (descMeta && descMeta.content) || "";
    const shareUrl = (canonical && canonical.href) || window.location.href;
    const shareMessage = `${shareTitle}\n${shareText}\n${shareUrl}`;

    const waBtn = container.querySelector(".share-whatsapp");
    const fbBtn = container.querySelector(".share-facebook");
    const xBtn = container.querySelector(".share-x");
    const copyBtn = container.querySelector(".share-copy");
    const nativeBtn = container.querySelector(".share-native");

    if (waBtn) waBtn.href = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareMessage)}`;
    if (fbBtn) fbBtn.href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    if (xBtn) xBtn.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle)}&url=${encodeURIComponent(shareUrl)}`;

    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          const original = copyBtn.getAttribute("title");
          copyBtn.setAttribute("title", "تم نسخ الرابط ✓");
          copyBtn.setAttribute("aria-label", "تم نسخ الرابط");
          setTimeout(() => {
            copyBtn.setAttribute("title", original);
            copyBtn.setAttribute("aria-label", original);
          }, 2000);
        } catch (e) {}
      });
    }

    if (nativeBtn) {
      if (navigator.share) {
        nativeBtn.addEventListener("click", async () => {
          try {
            await navigator.share({ title: shareTitle, text: shareText, url: shareUrl });
          } catch (e) {}
        });
      } else {
        nativeBtn.style.display = "none";
      }
    }
  }
  bindArticleShare();

  /* ---------- الهيدر: تأثير التمرير ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- القائمة على الموبايل ---------- */
  const mobileMenu = document.querySelector(".mobile-menu");
  const navToggle = document.querySelector(".nav-toggle");
  const menuClose = document.querySelector(".mobile-menu-close");
  function toggleMenu(open) {
    if (!mobileMenu) return;
    mobileMenu.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }
  navToggle && navToggle.addEventListener("click", () => toggleMenu(true));
  menuClose && menuClose.addEventListener("click", () => toggleMenu(false));
  mobileMenu &&
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => toggleMenu(false))
    );

  /* ---------- تفعيل رابط التنقل السفلي الحالي ---------- */
  const bottomNav = document.querySelector(".bottom-nav");
  if (bottomNav) {
    const current = document.body.getAttribute("data-page");
    bottomNav.querySelectorAll("a[data-page-match]").forEach((a) => {
      if (a.getAttribute("data-page-match") === current) {
        a.classList.add("is-active");
      }
    });
  }

  /* ---------- FAQ Accordion ---------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-q");
    const a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = q.getAttribute("aria-expanded") === "true";
      // اغلق البقية (اختياري: سلوك أكورديون فردي)
      document.querySelectorAll(".faq-q[aria-expanded='true']").forEach((otherQ) => {
        if (otherQ !== q) {
          otherQ.setAttribute("aria-expanded", "false");
          const otherA = otherQ.parentElement.querySelector(".faq-a");
          if (otherA) otherA.style.maxHeight = null;
        }
      });
      q.setAttribute("aria-expanded", String(!isOpen));
      a.style.maxHeight = !isOpen ? a.scrollHeight + "px" : null;
    });
  });

  /* ============================================================
     Legal Help Wizard — أداة "اكتشفي موقفك القانوني"
     ============================================================ */
  const WIZARD_TREE = {
    start: {
      question: "ما نوع المشكلة التي تواجهينها؟",
      options: [
        { label: "مشكلة زوجية", next: "zawgiya", tag: "زوجية" },
        { label: "متعلقة بالأطفال", next: "atfal", tag: "أطفال" },
        { label: "نفقة", next: "nafaqa", tag: "نفقة" },
        { label: "انفصال (طلاق / خلع)", next: "infisal", tag: "انفصال" },
        { label: "حضانة أو رؤية", next: "hadana", tag: "حضانة" },
        { label: "تنفيذ حكم", next: "tanfeez", tag: "تنفيذ" },
        { label: "مشكلة أخرى", next: "other", tag: "أخرى" }
      ]
    },
    zawgiya: {
      question: "ما أقرب وصف لحالتك؟",
      options: [
        { label: "خلافات مستمرة وأفكر في الانفصال", next: "done", tag: "خلافات زوجية مستمرة" },
        { label: "أرغب في محاولة حل ودي أولًا", next: "done", tag: "رغبة في حل ودي" },
        { label: "الزوج لا ينفق", next: "done", tag: "امتناع عن الإنفاق" }
      ]
    },
    atfal: {
      question: "ما الجانب المتعلق بالأطفال؟",
      options: [
        { label: "الحضانة", next: "done", tag: "حضانة الأطفال" },
        { label: "الرؤية أو الاستضافة", next: "done", tag: "رؤية / استضافة" },
        { label: "نفقة الأطفال", next: "done", tag: "نفقة الأطفال" },
        { label: "إثبات نسب", next: "done", tag: "إثبات نسب" }
      ]
    },
    nafaqa: {
      question: "ما حالة النفقة؟",
      options: [
        { label: "الزوج لا ينفق إطلاقًا", next: "done", tag: "امتناع كامل عن الإنفاق" },
        { label: "نفقة غير كافية", next: "done", tag: "نفقة غير كافية" },
        { label: "متجمد نفقة سابق", next: "done", tag: "متجمد نفقة" }
      ]
    },
    infisal: {
      question: "هل يوجد ضرر واضح تريدين إثباته؟",
      options: [
        { label: "نعم، يوجد ضرر", next: "done", tag: "طلاق للضرر" },
        { label: "لا، أرغب في الخلع", next: "done", tag: "الخلع" },
        { label: "غير متأكدة", next: "done", tag: "استفسار عن الطلاق/الخلع" }
      ]
    },
    hadana: {
      question: "ما التفصيل الأقرب لحالتك؟",
      options: [
        { label: "أرغب في المطالبة بالحضانة", next: "done", tag: "المطالبة بالحضانة" },
        { label: "خلاف على مواعيد الرؤية", next: "done", tag: "خلاف على الرؤية" },
        { label: "استضافة الأبناء", next: "done", tag: "الاستضافة" }
      ]
    },
    tanfeez: {
      question: "هل لديك حكم صادر بالفعل؟",
      options: [
        { label: "نعم، ولم يُنفَّذ", next: "done", tag: "حكم صادر لم يُنفَّذ" },
        { label: "الحكم قيد الاستئناف", next: "done", tag: "حكم قيد الاستئناف" }
      ]
    },
    other: {
      question: "هل تودين وصف حالتك عند التواصل مباشرة؟",
      options: [
        { label: "نعم، سأوضح التفاصيل عبر واتساب", next: "done", tag: "مشكلة أسرية أخرى" }
      ]
    }
  };

  const wizardOverlay = document.querySelector(".wizard-overlay");
  const wizardBody = document.querySelector(".wizard-body");
  const wizardOpeners = document.querySelectorAll("[data-wizard-open]");
  const wizardCloseBtns = document.querySelectorAll("[data-wizard-close]");
  let wizardPath = []; // {tag}
  let wizardStepKey = "start";
  let wizardStepIndex = 1;

  function renderWizardStep() {
    if (!wizardBody) return;
    if (wizardStepKey === "done") {
      renderWizardSummary();
      return;
    }
    const step = WIZARD_TREE[wizardStepKey];
    let html = `<div class="wizard-steps-label">الخطوة ${wizardStepIndex}</div>`;
    html += `<h3>${step.question}</h3>`;
    html += `<div class="wizard-options">`;
    step.options.forEach((opt, i) => {
      html += `<button type="button" class="wizard-option" data-opt-index="${i}">
        <span>${opt.label}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg>
      </button>`;
    });
    html += `</div>`;
    if (wizardPath.length > 0) {
      html += `<button type="button" class="wizard-back" data-wizard-back>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
        رجوع للخطوة السابقة
      </button>`;
    }
    wizardBody.innerHTML = html;

    wizardBody.querySelectorAll(".wizard-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-opt-index"));
        const opt = step.options[idx];
        wizardPath.push({ tag: opt.tag, stepKey: wizardStepKey });
        wizardStepKey = opt.next;
        wizardStepIndex++;
        renderWizardStep();
      });
    });
    const backBtn = wizardBody.querySelector("[data-wizard-back]");
    backBtn &&
      backBtn.addEventListener("click", () => {
        const last = wizardPath.pop();
        wizardStepKey = last.stepKey;
        wizardStepIndex--;
        renderWizardStep();
      });
  }

  function renderWizardSummary() {
    const summaryLines = wizardPath.map((p) => p.tag).join(" ← ");
    let html = `<div class="wizard-steps-label">النتيجة</div>`;
    html += `<h3>ملخص حالتك</h3>`;
    html += `<div class="wizard-summary">
      <div><strong>المسار المختار:</strong> ${summaryLines}</div>
    </div>`;
    html += `<div class="wizard-disclaimer">
      المعلومات التي ظهرت لك للتوعية العامة، وتحديد الموقف القانوني النهائي يتطلب دراسة تفاصيل الحالة والمستندات.
    </div>`;
    html += `<div class="wizard-actions">
      <a href="#" class="btn btn-whatsapp" id="wizard-wa-link">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.87.5 3.62 1.44 5.13L2 22l5.13-1.55a9.86 9.86 0 0 0 4.9 1.31h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2z"/></svg>
        أرسلي ملخص حالتك عبر واتساب
      </a>
    </div>
    <button type="button" class="wizard-back" data-wizard-back>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg>
      رجوع وتعديل الاختيارات
    </button>`;
    wizardBody.innerHTML = html;

    const waLink = document.getElementById("wizard-wa-link");
    if (waLink) {
      const stepsText = wizardPath.map((p) => `- ${p.tag}`).join("\n");
      const msg = `السلام عليكم،\nاستخدمت أداة تحديد المشكلة بالموقع.\n${stepsText}\nوأرغب في عرض تفاصيل حالتي.`;
      waLink.href = buildWhatsAppLink(null, msg);
      waLink.target = "_blank";
      waLink.rel = "noopener";
    }
    const backBtn = wizardBody.querySelector("[data-wizard-back]");
    backBtn &&
      backBtn.addEventListener("click", () => {
        const last = wizardPath.pop();
        wizardStepKey = last.stepKey;
        wizardStepIndex--;
        renderWizardStep();
      });
  }

  function openWizard() {
    wizardPath = [];
    wizardStepKey = "start";
    wizardStepIndex = 1;
    renderWizardStep();
    wizardOverlay && wizardOverlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }
  function closeWizard() {
    wizardOverlay && wizardOverlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }
  wizardOpeners.forEach((btn) => btn.addEventListener("click", openWizard));
  wizardCloseBtns.forEach((btn) => btn.addEventListener("click", closeWizard));
  wizardOverlay &&
    wizardOverlay.addEventListener("click", (e) => {
      if (e.target === wizardOverlay) closeWizard();
    });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeWizard();
  });

  /* ============================================================
     المدونة — عرض أحدث المقالات من data/articles.json
     ============================================================ */
  function articleCardHTML(article, prefix) {
    const dateLabel = new Date(article.date).toLocaleDateString("ar-EG", {
      year: "numeric", month: "long", day: "numeric"
    });
    const p = prefix || "";
    return `
      <article class="blog-card">
        <a class="b-img" href="${p}blog/${article.slug}.html" aria-label="${article.title}">
          <img src="${p}${article.image}" alt="${article.title}" loading="lazy" width="600" height="375">
        </a>
        <div class="b-body">
          <span class="b-cat">${article.category}</span>
          <h3><a href="${p}blog/${article.slug}.html">${article.title}</a></h3>
          <p class="b-excerpt">${article.excerpt}</p>
          <div class="b-meta">
            <span>${dateLabel}</span>
            <a href="${p}blog/${article.slug}.html">اقرئي المزيد ←</a>
          </div>
        </div>
      </article>`;
  }

  const homeBlogGrid = document.querySelector("[data-blog-home-grid]");
  const fullBlogGrid = document.querySelector("[data-blog-full-grid]");

  if (homeBlogGrid || fullBlogGrid) {
    const isBlogRoot = document.body.getAttribute("data-root") === "blog";
    const dataPath = isBlogRoot ? "../data/articles.json" : "data/articles.json";
    const linkPrefix = isBlogRoot ? "../" : "";
    fetch(dataPath)
      .then((r) => r.json())
      .then((articles) => {
        articles.sort((a, b) => new Date(b.date) - new Date(a.date));
        if (homeBlogGrid) {
          const latest = articles.slice(0, SITE_CONFIG.blog.homepageCount);
          homeBlogGrid.innerHTML = latest.map((a) => articleCardHTML(a, linkPrefix)).join("");
        }
        if (fullBlogGrid) {
          fullBlogGrid.innerHTML = articles.map((a) => articleCardHTML(a, linkPrefix)).join("");
          fullBlogGrid.setAttribute("data-loaded", "true");
          const cats = ["الكل", ...new Set(articles.map((a) => a.category))];
          const filterWrap = document.querySelector("[data-blog-filters]");
          if (filterWrap) {
            filterWrap.innerHTML = cats
              .map(
                (c, i) =>
                  `<button type="button" class="blog-filter-chip ${i === 0 ? "is-active" : ""}" data-cat="${c}">${c}</button>`
              )
              .join("");
            filterWrap.querySelectorAll(".blog-filter-chip").forEach((chip) => {
              chip.addEventListener("click", () => {
                filterWrap.querySelectorAll(".blog-filter-chip").forEach((c) => c.classList.remove("is-active"));
                chip.classList.add("is-active");
                const cat = chip.getAttribute("data-cat");
                const filtered = cat === "الكل" ? articles : articles.filter((a) => a.category === cat);
                fullBlogGrid.innerHTML = filtered.map((a) => articleCardHTML(a, linkPrefix)).join("");
              });
            });
          }
        }
      })
      .catch(() => {
        if (homeBlogGrid) homeBlogGrid.innerHTML = "<p>تعذر تحميل المقالات حاليًا.</p>";
        if (fullBlogGrid) fullBlogGrid.innerHTML = "<p>تعذر تحميل المقالات حاليًا.</p>";
      });
  }

  /* ============================================================
     الخريطة — Leaflet + OpenStreetMap (Lazy Load)
     ============================================================ */
  const mapEl = document.getElementById("office-map");
  if (mapEl) {
    const initMap = () => {
      if (mapEl.getAttribute("data-initialized")) return;
      mapEl.setAttribute("data-initialized", "true");
      const { latitude, longitude } = SITE_CONFIG.location;
      const map = L.map(mapEl, { scrollWheelZoom: false }).setView([latitude, longitude], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(map);
      const goldIcon = L.divIcon({
        className: "",
        html: `<div style="width:34px;height:34px;border-radius:50% 50% 50% 0;background:#c9a24b;transform:rotate(-45deg);border:2px solid #120e0b;box-shadow:0 4px 10px rgba(0,0,0,.35)"></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 34]
      });
      L.marker([latitude, longitude], { icon: goldIcon })
        .addTo(map)
        .bindPopup(`<strong>${SITE_CONFIG.lawyerName}</strong><br>${SITE_CONFIG.professionalTitle}`)
        .openPopup();
    };

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              initMap();
              observer.disconnect();
            }
          });
        },
        { rootMargin: "200px" }
      );
      observer.observe(mapEl);
    } else {
      initMap();
    }

    // أزرار الخريطة
    const { latitude, longitude } = SITE_CONFIG.location;
    const directionsBtn = document.querySelector("[data-map-directions]");
    const googleMapsBtn = document.querySelector("[data-map-google]");
    const shareBtn = document.querySelector("[data-map-share]");
    if (directionsBtn) directionsBtn.href = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    if (googleMapsBtn) googleMapsBtn.href = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const shareUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        if (navigator.share) {
          try {
            await navigator.share({ title: SITE_CONFIG.siteName, text: SITE_CONFIG.location.label, url: shareUrl });
          } catch (e) {}
        } else {
          try {
            await navigator.clipboard.writeText(shareUrl);
            shareBtn.textContent = "تم نسخ الرابط ✓";
            setTimeout(() => (shareBtn.textContent = "مشاركة الموقع"), 2000);
          } catch (e) {}
        }
      });
    }
  }

  /* ============================================================
     حالة الاتصال بالإنترنت — Offline Banner
     ============================================================ */
  const offlineBanner = document.querySelector(".offline-banner");
  function updateOnlineStatus() {
    if (!offlineBanner) return;
    offlineBanner.classList.toggle("is-visible", !navigator.onLine);
  }
  window.addEventListener("online", updateOnlineStatus);
  window.addEventListener("offline", updateOnlineStatus);
  updateOnlineStatus();

  /* ============================================================
     تسجيل Service Worker
     ============================================================ */
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swPath = document.body.getAttribute("data-root") === "blog" ? "../service-worker.js" : "service-worker.js";
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          // فحص فوري لوجود إصدار جديد عند تحميل الصفحة
          registration.update().catch(() => {});

          // فحص دوري كل 45 ثانية طالما الصفحة مفتوحة
          setInterval(() => registration.update().catch(() => {}), 45000);

          // فحص فوري عند رجوع المستخدم للتبويب بعد تركه
          document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
              registration.update().catch(() => {});
            }
          });

          function showUpdateToast(waitingWorker) {
            const updateToast = document.querySelector(".update-toast");
            if (!updateToast) return;
            updateToast.classList.add("is-visible");
            const refreshBtn = updateToast.querySelector(".ut-refresh");
            const dismissBtn = updateToast.querySelector(".ut-dismiss");
            let reloading = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
              if (reloading) return;
              reloading = true;
              window.location.reload();
            });
            refreshBtn &&
              refreshBtn.addEventListener("click", () => {
                waitingWorker.postMessage({ type: "SKIP_WAITING" });
              });
            dismissBtn &&
              dismissBtn.addEventListener("click", () => {
                updateToast.classList.remove("is-visible");
              });
          }

          // إصدار جديد بالفعل بانتظار التفعيل (مثلاً عند فتح الصفحة من جديد)
          if (registration.waiting && registration.active) {
            showUpdateToast(registration.waiting);
          }

          // إصدار جديد يتم تثبيته أثناء تصفح المستخدم للصفحة
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                showUpdateToast(newWorker);
              }
            });
          });
        })
        .catch(() => {});
    });
  }

  /* ============================================================
     دعوة تثبيت PWA
     ============================================================ */
  let deferredPrompt;
  const installToast = document.querySelector(".install-toast");
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installToast && !sessionStorage.getItem("installDismissed")) {
      installToast.classList.add("is-visible");
    }
  });
  if (installToast) {
    const installBtn = installToast.querySelector(".it-install");
    const dismissBtn = installToast.querySelector(".it-dismiss");
    installBtn &&
      installBtn.addEventListener("click", async () => {
        installToast.classList.remove("is-visible");
        if (deferredPrompt) {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          deferredPrompt = null;
        }
      });
    dismissBtn &&
      dismissBtn.addEventListener("click", () => {
        installToast.classList.remove("is-visible");
        sessionStorage.setItem("installDismissed", "1");
      });
  }
})();
