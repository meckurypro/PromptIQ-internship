import Head from 'next/head';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

const PRICE_DISPLAY = '₦' + (parseInt(process.env.NEXT_PUBLIC_PRICE_KOBO || '1000000') / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });

const CURRICULUM = [
  { n: '01', name: 'Idea Refinement',       desc: 'Turn a raw concept into a production-ready brief. Story structure, visual language, scene planning.' },
  { n: '02', name: 'Character Consistency', desc: 'Build AI characters that look identical across every scene, episode and platform.' },
  { n: '03', name: 'Advanced Prompting',    desc: 'The language of AI generation. Get exactly what you see in your head onto the screen.' },
  { n: '04', name: 'Image to Video',        desc: 'Animate still images into cinematic motion. Pacing, camera movement, scene flow.' },
  { n: '05', name: 'Scene Consistency',     desc: 'Visual continuity across cuts. Lighting, colour grading, environmental coherence.' },
  { n: '06', name: 'Sound FX',              desc: 'The audio layer that makes visuals feel real. Ambient sound, foley, atmosphere design.' },
  { n: '07', name: 'AI Music Creation',     desc: 'Score your productions. Mood-matched music generated and edited for your scenes.' },
  { n: '08', name: 'VFX',                   desc: 'Visual effects that elevate the work. Transitions, overlays, cinematic treatments.' },
  { n: '09', name: 'CapCut Editing',        desc: 'Final assembly. Pacing. Timing. The difference between raw footage and a finished film.' },
];

const BENEFITS = [
  { icon: '🎬', title: 'Real Production Experience',         body: 'Practice on actual PromptIQ productions. Your work appears in content with real audiences — not mock exercises.' },
  { icon: '🧠', title: 'Direct Mentorship',                  body: 'Learn from the founder of a brand that built 33k followers in 5 weeks. Inside the group, personally.' },
  { icon: '📁', title: 'A Portfolio That Proves It',         body: 'Three months of cinematic AI work you can show any brand, agency or client. Real work, real results.' },
  { icon: '🌍', title: 'International Cohort',               body: 'Work alongside creators from Nigeria, Ghana and beyond. The network you build here is part of the value.' },
  { icon: '🚀', title: 'A Head Start on a New Industry',    body: 'Cinematic AI content creation is still new. The people who learn now set the standard everyone else follows.' },
  { icon: '📋', title: '3-Month Internship — Fixed Term',   body: 'The internship runs for exactly 3 months. After that, it ends cleanly. You leave with your skills, your portfolio, and full ownership of your subsequent work.' },
  { icon: '📣', title: 'PromptIQ Promotes You for 1 Month', body: 'When you finish and launch your own page, PromptIQ will actively promote you for a full month across our platforms. You built with us — we send our audience to you.' },
];

export default function Home() {
  const router = useRouter();
  const revRefs = useRef([]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08 });
    revRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const addRef = el => { if (el && !revRefs.current.includes(el)) revRefs.current.push(el); };

  const choose = (method) => {
    router.push(`/form?method=${method}`);
  };

  return (
    <>
      <Head>
        <title>Creator Internship — PromptIQ</title>
        <meta name="description" content="A 3-month internship in cinematic AI content creation. Taught by PromptIQ — the studio behind millions of views." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <style>{`
        :root {
          --brown:        #0C0806;
          --brown-mid:    #120D09;
          --brown-card:   #1A1109;
          --brown-raise:  #221608;
          --border:       rgba(232,116,154,0.12);
          --border-soft:  rgba(255,255,255,0.06);
          --pink:         #E8749A;
          --pink-bright:  #F590AE;
          --pink-dim:     rgba(232,116,154,0.09);
          --pink-border:  rgba(232,116,154,0.22);
          --purple:       #9B6DFF;
          --purple-bright:#B490FF;
          --purple-dim:   rgba(155,109,255,0.09);
          --purple-border:rgba(155,109,255,0.22);
          --white:        #FFF8F5;
          --body:         #C4AFA8;
          --muted:        #7A6460;
          --r:            10px;
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body {
          font-family:'DM Sans',sans-serif;
          background:var(--brown);
          color:var(--body);
          line-height:1.65;
          overflow-x:hidden;
          -webkit-font-smoothing:antialiased;
        }
        body::before {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:9999; opacity:0.35;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
        a { text-decoration:none; }

        /* NAV */
        nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 6%;
          background:rgba(12,8,6,0.92); backdrop-filter:blur(20px);
          border-bottom:1px solid var(--border-soft);
        }
        .logo { display:flex; align-items:center; gap:10px; }
        .logo img { height:32px; width:auto; }
        .nav-tag {
          font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:700;
          letter-spacing:1.5px; text-transform:uppercase; color:var(--purple);
          background:var(--purple-dim); border:1px solid var(--purple-border);
          padding:5px 12px; border-radius:100px;
        }

        /* HERO */
        .hero {
          position:relative; padding:140px 6% 100px;
          min-height:100vh; display:flex; align-items:center; overflow:hidden;
        }
        .hero-glow1 {
          position:absolute; top:-15%; right:-5%; width:700px; height:600px;
          border-radius:50%; pointer-events:none;
          background:radial-gradient(ellipse,rgba(155,109,255,0.06) 0%,transparent 70%);
        }
        .hero-glow2 {
          position:absolute; bottom:-10%; left:-10%; width:500px; height:500px;
          border-radius:50%; pointer-events:none;
          background:radial-gradient(ellipse,rgba(232,116,154,0.05) 0%,transparent 70%);
        }
        .hero-inner { position:relative; z-index:1; max-width:700px; }
        .hero-badge {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--pink-dim); border:1px solid var(--pink-border);
          color:var(--pink-bright); font-family:'Outfit',sans-serif;
          font-size:0.72rem; font-weight:700; padding:6px 14px; border-radius:100px;
          margin-bottom:28px; letter-spacing:1.5px; text-transform:uppercase;
          animation:fadeUp 0.5s ease both;
        }
        .bdot {
          width:7px; height:7px; background:var(--pink); border-radius:50%;
          box-shadow:0 0 8px var(--pink); flex-shrink:0;
          animation:pulse 1.6s ease-in-out infinite;
        }
        .hero-h1 {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(3.5rem,7vw,7rem);
          letter-spacing:2px; text-transform:uppercase;
          color:var(--white); line-height:0.95;
          animation:fadeUp 0.5s 0.08s ease both;
        }
        .hero-h1 .pk { color:var(--pink); }
        .hero-h1 .pu { color:var(--purple-bright); }
        .hero-desc {
          font-size:1rem; color:var(--body); margin-top:24px;
          max-width:520px; line-height:1.8; font-weight:300;
          animation:fadeUp 0.5s 0.16s ease both;
        }
        .hero-cta {
          display:inline-flex; align-items:center; gap:8px; margin-top:36px;
          background:var(--pink); color:var(--brown);
          font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:700;
          padding:15px 32px; border-radius:100px; border:none; cursor:pointer;
          transition:background 0.2s,transform 0.15s,box-shadow 0.2s;
          animation:fadeUp 0.5s 0.24s ease both;
        }
        .hero-cta:hover {
          background:var(--pink-bright); transform:translateY(-2px);
          box-shadow:0 8px 28px rgba(232,116,154,0.35);
        }
        .hero-meta {
          margin-top:16px; font-family:'Outfit',sans-serif;
          font-size:0.75rem; color:var(--muted); letter-spacing:0.5px;
          animation:fadeUp 0.5s 0.32s ease both;
        }
        .hero-meta strong { color:var(--pink); }

        /* TICKER */
        .ticker {
          background:var(--brown-mid); border-top:1px solid var(--border-soft);
          border-bottom:1px solid var(--border-soft);
          padding:11px 0; overflow:hidden; white-space:nowrap;
        }
        .ticker-t { display:inline-flex; animation:ticker 30s linear infinite; }
        .ti { display:inline-flex; align-items:center; gap:10px; padding:0 24px; font-size:0.76rem; color:var(--muted); }
        .ti strong { color:var(--purple-bright); font-weight:600; }
        .td { width:4px; height:4px; background:var(--pink); border-radius:50%; opacity:0.5; flex-shrink:0; }

        /* SECTIONS */
        .sec { padding:90px 6%; max-width:1100px; margin:0 auto; }
        .sec-full { padding:90px 6%; background:var(--brown-mid); border-top:1px solid var(--border-soft); border-bottom:1px solid var(--border-soft); }
        .sec-full .sec-inner { max-width:1100px; margin:0 auto; }
        .lbl {
          font-family:'Outfit',sans-serif; font-size:0.68rem; font-weight:700;
          letter-spacing:3px; text-transform:uppercase; color:var(--purple-bright);
          margin-bottom:10px; display:flex; align-items:center; gap:12px;
        }
        .lbl::after { content:''; width:32px; height:2px; background:var(--purple); border-radius:2px; opacity:0.5; }
        .lbl-pk { color:var(--pink); }
        .lbl-pk::after { background:var(--pink); }
        .hdg {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(2.4rem,4vw,3.8rem);
          letter-spacing:1.5px; text-transform:uppercase;
          color:var(--white); line-height:0.95;
        }
        .hdg em { color:var(--pink); font-style:normal; }
        .hdg .pu { color:var(--purple-bright); }
        .sub-text { font-size:0.93rem; color:var(--body); max-width:540px; margin-top:14px; line-height:1.8; font-weight:300; }

        /* CURRICULUM */
        .curr-grid {
          display:grid; grid-template-columns:repeat(3,1fr);
          gap:1px; background:var(--border-soft);
          border:1px solid var(--border-soft); border-radius:var(--r);
          overflow:hidden; margin-top:48px;
        }
        .curr-item {
          background:var(--brown-card); padding:28px 24px;
          position:relative; transition:background 0.2s; overflow:hidden;
        }
        .curr-item::before {
          content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
          background:linear-gradient(90deg,var(--pink),var(--purple));
          transform:scaleX(0); transform-origin:left; transition:transform 0.3s;
        }
        .curr-item:hover { background:var(--brown-raise); }
        .curr-item:hover::before { transform:scaleX(1); }
        .curr-n { font-family:'Outfit',sans-serif; font-size:0.65rem; font-weight:700; letter-spacing:2px; color:var(--purple); margin-bottom:14px; }
        .curr-name { font-family:'Outfit',sans-serif; font-size:1rem; font-weight:700; color:var(--white); margin-bottom:8px; }
        .curr-desc { font-size:0.82rem; color:var(--body); line-height:1.7; font-weight:300; }

        /* BENEFITS */
        .ben-list { margin-top:48px; display:flex; flex-direction:column; }
        .ben-row {
          display:flex; align-items:flex-start; gap:20px;
          padding:26px 0; border-bottom:1px solid var(--border-soft);
        }
        .ben-row:first-child { border-top:1px solid var(--border-soft); }
        .ben-icon {
          width:42px; height:42px; background:var(--pink-dim);
          border:1px solid var(--pink-border); border-radius:8px;
          display:flex; align-items:center; justify-content:center;
          font-size:1.1rem; flex-shrink:0;
        }
        .ben-text strong { display:block; font-family:'Outfit',sans-serif; font-size:0.97rem; font-weight:700; color:var(--white); margin-bottom:5px; }
        .ben-text p { font-size:0.83rem; color:var(--body); line-height:1.72; font-weight:300; }

        /* ABOUT */
        .about-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .stat-card {
          background:var(--brown); border:1px solid var(--border-soft);
          border-radius:var(--r); padding:20px; transition:border-color 0.2s;
        }
        .stat-card:hover { border-color:var(--border); }
        .stat-card strong {
          font-family:'Bebas Neue',sans-serif; font-size:2rem;
          letter-spacing:1px; color:var(--pink); display:block; margin-bottom:4px;
        }
        .stat-card span { font-size:0.72rem; color:var(--body); }
        .stat-pu strong { color:var(--purple-bright); }

        /* PRICING BLOCK */
        .price-block {
          background:var(--brown-card); border:1px solid var(--border-soft);
          border-radius:var(--r); padding:32px;
        }
        .price-figure {
          font-family:'Bebas Neue',sans-serif; font-size:3.5rem;
          letter-spacing:1px; color:var(--purple-bright); line-height:1;
        }
        .price-sub { font-size:0.78rem; color:var(--muted); margin-top:6px; }
        .price-list { margin-top:22px; list-style:none; display:flex; flex-direction:column; gap:10px; }
        .price-list li {
          display:flex; align-items:center; gap:8px;
          font-size:0.83rem; color:var(--body);
        }
        .price-list li span { color:var(--pink); font-size:0.7rem; }
        .price-note { font-size:0.72rem; color:var(--muted); margin-top:20px; line-height:1.6; }

        /* PAYMENT CHOOSER */
        .pay-section {
          padding:90px 6% 110px; background:var(--brown-mid);
          border-top:1px solid var(--border-soft);
        }
        .pay-inner { max-width:800px; margin:0 auto; text-align:center; }
        .pay-eyebrow {
          font-family:'Outfit',sans-serif; font-size:0.68rem; font-weight:700;
          letter-spacing:3px; text-transform:uppercase; color:var(--purple-bright);
          margin-bottom:14px; display:flex; align-items:center; justify-content:center; gap:12px;
        }
        .pay-eyebrow::before, .pay-eyebrow::after {
          content:''; width:32px; height:2px;
          background:var(--purple); border-radius:2px; opacity:0.5;
        }
        .pay-hdg {
          font-family:'Bebas Neue',sans-serif;
          font-size:clamp(2.2rem,4vw,3.4rem);
          letter-spacing:1.5px; text-transform:uppercase;
          color:var(--white); line-height:0.95; margin-bottom:14px;
        }
        .pay-hdg em { color:var(--pink); font-style:normal; }
        .pay-sub {
          font-size:0.9rem; color:var(--body); max-width:460px;
          margin:0 auto 48px; line-height:1.8; font-weight:300;
        }
        .pay-options {
          display:grid; grid-template-columns:1fr 1fr; gap:20px;
          max-width:640px; margin:0 auto;
        }
        .pay-btn {
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          gap:14px; padding:32px 24px;
          background:var(--brown-card); border:1px solid var(--border-soft);
          border-radius:var(--r); cursor:pointer;
          transition:border-color 0.22s, transform 0.18s, box-shadow 0.22s, background 0.2s;
          position:relative; overflow:hidden;
        }
        .pay-btn::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:2px;
          transform:scaleX(0); transform-origin:left; transition:transform 0.3s;
        }
        .pay-btn-paystack::after { background:linear-gradient(90deg,#59b8e6,#003e7e); }
        .pay-btn-selar::after    { background:linear-gradient(90deg,#7B1F6A,#b94fa0); }
        .pay-btn:hover {
          transform:translateY(-4px);
          background:var(--brown-raise);
        }
        .pay-btn-paystack:hover { border-color:rgba(89,184,230,0.35); box-shadow:0 12px 32px rgba(89,184,230,0.12); }
        .pay-btn-selar:hover    { border-color:rgba(123,31,106,0.45); box-shadow:0 12px 32px rgba(155,79,160,0.15); }
        .pay-btn:hover::after   { transform:scaleX(1); }
        .pay-logo-wrap {
          width:100%; height:52px;
          display:flex; align-items:center; justify-content:center;
          border-radius:8px; overflow:hidden;
          background:#fff; padding:10px 20px;
        }
        .pay-logo-wrap img { height:32px; width:auto; object-fit:contain; }
        .pay-btn-label {
          font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:700;
          letter-spacing:2px; text-transform:uppercase; color:var(--muted);
        }
        .pay-btn-paystack .pay-btn-label { color:rgba(89,184,230,0.7); }
        .pay-btn-selar    .pay-btn-label { color:rgba(155,79,160,0.8); }
        .pay-note {
          font-size:0.74rem; color:var(--muted); margin-top:24px; line-height:1.7;
          max-width:480px; margin-left:auto; margin-right:auto;
        }

        /* REVEAL */
        .rev { opacity:0; transform:translateY(24px); transition:opacity 0.65s ease,transform 0.65s ease; }
        .rev.on { opacity:1; transform:none; }

        /* FOOTER */
        footer {
          background:var(--brown-mid); border-top:1px solid var(--border-soft);
          padding:24px 6%; display:flex; align-items:center;
          justify-content:space-between; flex-wrap:wrap; gap:12px;
        }
        .f-logo { display:flex; align-items:center; gap:8px; }
        .f-logo img { height:24px; }
        .f-logo span { font-family:'Outfit',sans-serif; font-weight:800; color:var(--white); font-size:0.95rem; }
        .f-logo span em { color:var(--pink); font-style:normal; }
        footer p { font-size:0.74rem; color:var(--muted); }

        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes pulse  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        @media(max-width:900px){
          .curr-grid { grid-template-columns:1fr 1fr; }
          .about-grid { grid-template-columns:1fr; }
          .pay-options { grid-template-columns:1fr; max-width:380px; }
        }
        @media(max-width:580px){
          .curr-grid { grid-template-columns:1fr; }
          .stat-grid { grid-template-columns:1fr 1fr; }
          footer { flex-direction:column; text-align:center; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="logo">
          <img src="/logo.png" alt="PromptIQ" onError={e => { e.target.style.display = 'none'; }} />
        </div>
        <div className="nav-tag">Creator Internship · Cohort 1</div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-glow1" /><div className="hero-glow2" />
        <div className="hero-inner">
          <div className="hero-badge"><span className="bdot" />Now Open · Limited Spots</div>
          <h1 className="hero-h1">Cinematic <span className="pk">AI</span><br />Content<br /><span className="pu">Creation.</span></h1>
          <p className="hero-desc">A 3-month internship taught by PromptIQ — the studio behind millions of views of cinematic AI content. You don't watch. You build. On real productions, with real audiences.</p>
          <a href="#apply" className="hero-cta">Apply Now →</a>
          <p className="hero-meta">3 months &nbsp;·&nbsp; 9 skills &nbsp;·&nbsp; <strong>Cohort 1 — limited spots</strong></p>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker" aria-hidden="true">
        <div className="ticker-t">
          {['Character Consistency','Scene Prompting','AI Music','VFX','CapCut Editing','Sound FX','Image to Video','Idea Refinement','Real Productions','Global Cohort',
            'Character Consistency','Scene Prompting','AI Music','VFX','CapCut Editing','Sound FX','Image to Video','Idea Refinement','Real Productions','Global Cohort'].map((t, i) => (
            <span className="ti" key={i}><span className="td" />{i % 3 === 0 ? <strong>{t}</strong> : t}</span>
          ))}
        </div>
      </div>

      {/* CURRICULUM */}
      <div className="sec-full">
        <div className="sec-inner">
          <p className="lbl rev" ref={addRef}>The Curriculum</p>
          <h2 className="hdg rev" ref={addRef}>9 skills. <em>3 months.</em><br />One standard.</h2>
          <p className="sub-text rev" ref={addRef}>Every module is taught through practice on live PromptIQ projects. Not exercises. Real content, real audiences, real feedback.</p>
          <div className="curr-grid">
            {CURRICULUM.map((c, i) => (
              <div className="curr-item rev" ref={addRef} key={i}>
                <div className="curr-n">Module {c.n}</div>
                <div className="curr-name">{c.name}</div>
                <div className="curr-desc">{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BENEFITS */}
      <section className="sec">
        <p className="lbl lbl-pk rev" ref={addRef}>What You Get</p>
        <h2 className="hdg rev" ref={addRef}>More than <em>knowledge.</em></h2>
        <div className="ben-list">
          {BENEFITS.map((b, i) => (
            <div className="ben-row rev" ref={addRef} key={i}>
              <div className="ben-icon">{b.icon}</div>
              <div className="ben-text"><strong>{b.title}</strong><p>{b.body}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <div className="sec-full">
        <div className="sec-inner">
          <div className="about-grid">
            <div className="rev" ref={addRef}>
              <p className="lbl">Who Is Teaching You</p>
              <h2 className="hdg">Not a guru.<br /><span className="pu">A builder.</span></h2>
              <p className="sub-text">PromptIQ is a cinematic AI content studio that grew to 33,000+ followers across TikTok and Instagram in 5 weeks — organically, with no paid ads. The founder is a full-stack developer, AI power user and content architect who builds systems that scale.</p>
              <p className="sub-text" style={{ marginTop: 12 }}>What you'll learn isn't theory. It's the exact workflow behind content that reaches millions. Documented, structured and taught the same way it was built — practically, with results in mind.</p>
            </div>
            <div className="stat-grid rev" ref={addRef}>
              <div className="stat-card"><strong>33K+</strong><span>Followers in 5 weeks</span></div>
              <div className="stat-card stat-pu"><strong>5</strong><span>Active platforms</span></div>
              <div className="stat-card"><strong>Daily</strong><span>Cinematic output</span></div>
              <div className="stat-card"><strong>Global</strong><span>Audience reach</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <section className="sec" id="apply">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:64, alignItems:'start' }}>
          <div className="rev" ref={addRef}>
            <p className="lbl lbl-pk">The Investment</p>
            <h2 className="hdg">One fee.<br /><em>3 months</em> full access.</h2>
            <p className="sub-text" style={{ marginTop:14 }}>Fill in the application form and complete your payment to secure your spot. Once confirmed, you'll receive your WhatsApp group access instantly.</p>
          </div>
          <div className="price-block rev" ref={addRef}>
            <p className="price-figure">{PRICE_DISPLAY}</p>
            <p className="price-sub">One-time entry fee · 3 months full access</p>
            <ul className="price-list">
              {[
                '9 cinematic AI skill modules',
                'Practice on live PromptIQ productions',
                'Private WhatsApp mentorship group',
                'Direct instructor feedback',
                'Portfolio of real completed work',
                'PromptIQ promotion for 1 month post-internship',
              ].map((item, i) => (
                <li key={i}><span>→</span>{item}</li>
              ))}
            </ul>
            <p className="price-note">International applicants welcome. Both Paystack and Selar accept cards from most countries.</p>
          </div>
        </div>
      </section>

      {/* PAYMENT CHOOSER */}
      <div className="pay-section">
        <div className="pay-inner">
          <p className="pay-eyebrow rev" ref={addRef}>Secure Your Spot</p>
          <h2 className="pay-hdg rev" ref={addRef}>Choose your<br /><em>payment option.</em></h2>
          <p className="pay-sub rev" ref={addRef}>
            Both options give you the same access. Pick whichever works best for you.
          </p>
          <div className="pay-options">
            <button className="pay-btn pay-btn-paystack rev" ref={addRef} onClick={() => choose('paystack')}>
              <div className="pay-logo-wrap">
                <img src="/paystack.png" alt="Pay with Paystack" />
              </div>
              <span className="pay-btn-label">Pay with Paystack</span>
            </button>
            <button className="pay-btn pay-btn-selar rev" ref={addRef} onClick={() => choose('selar')}>
              <div className="pay-logo-wrap">
                <img src="/selar.jpeg" alt="Pay with Selar" />
              </div>
              <span className="pay-btn-label">Pay with Selar</span>
            </button>
          </div>
          <p className="pay-note rev" ref={addRef}>
            Paystack: pay and get WhatsApp access instantly on this site.<br />
            Selar: complete payment on Selar's platform and receive access there.
          </p>
        </div>
      </div>

      {/* FOOTER */}
      <footer>
        <div className="f-logo">
          <img src="/logo.png" alt="PromptIQ" onError={e => { e.target.style.display = 'none'; }} />
          <span>Prompt<em>IQ</em></span>
        </div>
        <p>© 2026 PromptIQ. All rights reserved.</p>
        <p style={{ fontSize:'0.72rem', color:'var(--muted)' }}>Creator Internship · Cohort 1</p>
      </footer>
    </>
  );
}
