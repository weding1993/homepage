(() => {
  const cfg = window.SITE_CONFIG || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  // 설정값 반영
  $$("[data-brand]").forEach((e) => (e.textContent = cfg.brandName || ""));
  $("#mail-text").textContent = cfg.email || "";
  $("#copy-year").textContent = "© " + new Date().getFullYear();

  // 헤더 / 모바일 메뉴
  const header = $(".header"),
    nav = $("#nav"),
    btn = $(".menu-btn");
  const setMenu = (open) => {
    nav.classList.toggle("open", open);
    btn.setAttribute("aria-expanded", open);
    btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  };
  btn.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      setMenu(false);
      btn.focus();
    }
  });
  const onScroll = () => header.classList.toggle("scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 현재 섹션 표시
  const links = $$('.nav a[href^="#"]:not(.btn)');
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting)
            links.forEach((a) =>
              a.classList.toggle("active", a.hash === "#" + e.target.id),
            );
        }),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    $$("main section[id]").forEach((s) => spy.observe(s));

    // 스크롤 등장: 카드·타임라인 등 핵심 블록에만 적용
    const rv = new IntersectionObserver(
      (es) =>
        es.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            rv.unobserve(e.target);
          }
        }),
      { threshold: 0.1 },
    );
    $$(".card,.node,.case,.timeline li").forEach((e) => {
      e.classList.add("rv");
      rv.observe(e);
    });
  }

  // const vid = $("#hero-video"),
  //   vbtn = $("#vid-toggle");
  // if (vid) {
  //   const label = (playing) => {
  //     vbtn.textContent = playing ? "일시정지" : "재생";
  //     vbtn.setAttribute(
  //       "aria-label",
  //       playing ? "배경 영상 일시정지" : "배경 영상 재생",
  //     );
  //   };
  //   vbtn.addEventListener("click", () => {
  //     if (vid.paused) vid.play().catch(() => {});
  //     else vid.pause();
  //     label(!vid.paused);
  //   });
  //   vid.addEventListener("error", () => (vbtn.hidden = true), true);
  //   vid.play?.().catch(() => label(false));
  // }

  // 포트폴리오: 데이터가 있을 때만 표시
  const list = Array.isArray(cfg.portfolio) ? cfg.portfolio : [];
  if (list.length) {
    const box = $("#portfolio-list");
    const esc = (s) =>
      String(s ?? "").replace(
        /[&<>"']/g,
        (c) =>
          ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          })[c],
      );
    box.innerHTML = list
      .map(
        (p) => `
      <article class="card pf">
        ${
          p.image
            ? `
              <div class="pf-image">
                <img
                  src="${esc(p.image)}"
                  alt="${esc(p.imageAlt || p.title)}"
                  loading="lazy"
                >
              </div>
            `
            : ""
        }
        <div class="pf-content">
          <div class="pf-meta">
            <span>${esc(p.client)}</span>
            <span class="pf-meta-dot"></span>
            <span>${esc(p.category)}</span>
          </div>
          <h3 class="pf-title">${esc(p.title)}</h3>
          <p class="pf-description">
            ${esc(p.description)}
          </p>
          ${
            (p.tasks || []).length
              ? `
                <div class="pf-section">
                  <span class="pf-label">진행 업무</span>
                  <div class="pf-tags">
                    ${p.tasks
                      .map((task) => `<span class="pf-tag">${esc(task)}</span>`)
                      .join("")}
                  </div>
                </div>
              `
              : ""
          }
          ${
            (p.results || []).length
              ? `
                <div class="pf-results">
                  <span class="pf-label">프로젝트 성과</span>
                  <ul>
                    ${p.results
                      .map((result) => `<li>${esc(result)}</li>`)
                      .join("")}
                  </ul>
                </div>
              `
              : ""
          }
          ${
            p.link
              ? `
                <a class="pf-link" href="${esc(p.link)}">
                  프로젝트 자세히 보기
                  <span aria-hidden="true">↗</span>
                </a>
              `
              : ""
          }
        </div>
      </article>
    `,
      )
      .join("");
    $("#portfolio").hidden = false;
  }

  // 이메일 복사
  const msg = $("#copy-msg");
  $("#copy-btn").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(cfg.email);
      msg.textContent = "이메일 주소를 복사했습니다.";
    } catch {
      msg.textContent = "복사하지 못했습니다. 주소를 직접 선택해 복사해주세요.";
    }
    setTimeout(() => (msg.textContent = ""), 3000);
  });

  // 문의: mailto 생성 (전송 완료 메시지는 표시하지 않음)
  const form = $("#contact-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    $$("input,textarea", form).forEach((i) => i.classList.add("touched"));
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const d = Object.fromEntries(new FormData(form));
    const body = [
      `회사명: ${d.company}`,
      `담당자명: ${d.name}`,
      `이메일: ${d.email}`,
      `연락처: ${d.phone || "-"}`,
      `문의 서비스: ${d.service}`,
      "",
      "문의 내용:",
      d.message,
    ].join("\n");
    location.href = `mailto:${cfg.email}?subject=${encodeURIComponent("[프로젝트 문의] " + d.company)}&body=${encodeURIComponent(body)}`;
  });
})();
