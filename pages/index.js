import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { supabase } from '../lib/supabase';

const WHATSAPP_GROUP = 'https://chat.whatsapp.com/EFHWekt4c6rJtnumWZpqMT';

// ─── PRICE CONFIG ────────────────────────────────────────────────────────────
// Controlled entirely by Vercel env var: NEXT_PUBLIC_PRICE_KOBO
// To update price: change env var in Vercel dashboard → redeploy. Zero code changes.
// 1000000 = ₦10,000 | 1500000 = ₦15,000 | 2500000 = ₦25,000
const PRICE_KOBO = parseInt(process.env.NEXT_PUBLIC_PRICE_KOBO || '1000000');
const PRICE_DISPLAY = '₦' + (PRICE_KOBO / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });
// ─────────────────────────────────────────────────────────────────────────────

const CURRICULUM = [
  { n: '01', name: 'Idea Refinement', desc: 'Turn a raw concept into a production-ready brief. Story structure, visual language, scene planning.' },
  { n: '02', name: 'Character Consistency', desc: 'Build AI characters that look identical across every scene, episode and platform.' },
  { n: '03', name: 'Advanced Prompting', desc: 'The language of AI generation. Get exactly what you see in your head onto the screen.' },
  { n: '04', name: 'Image to Video', desc: 'Animate still images into cinematic motion. Pacing, camera movement, scene flow.' },
  { n: '05', name: 'Scene Consistency', desc: 'Visual continuity across cuts. Lighting, colour grading, environmental coherence.' },
  { n: '06', name: 'Sound FX', desc: 'The audio layer that makes visuals feel real. Ambient sound, foley, atmosphere design.' },
  { n: '07', name: 'AI Music Creation', desc: 'Score your productions. Mood-matched music generated and edited for your scenes.' },
  { n: '08', name: 'VFX', desc: 'Visual effects that elevate the work. Transitions, overlays, cinematic treatments.' },
  { n: '09', name: 'CapCut Editing', desc: 'Final assembly. Pacing. Timing. The difference between raw footage and a finished film.' },
];

const BENEFITS = [
  { icon: '🎬', title: 'Real Production Experience', body: 'Practice on actual PromptIQ productions. Your work appears in content with real audiences — not mock exercises.' },
  { icon: '🧠', title: 'Direct Mentorship', body: 'Learn from the founder of a brand that built 33k followers in 5 weeks. Inside the group, personally.' },
  { icon: '📁', title: 'A Portfolio That Proves It', body: 'Three months of cinematic AI work you can show any brand, agency or client. Real work, real results.' },
  { icon: '🌍', title: 'International Cohort', body: 'Work alongside creators from Nigeria, Ghana and beyond. The network you build here is part of the value.' },
  { icon: '🚀', title: 'A Head Start on a New Industry', body: 'Cinematic AI content creation is still new. The people who learn now set the standard everyone else follows.' },
  { icon: '📋', title: '3-Month Internship — Fixed Term', body: 'The internship runs for exactly 3 months. After that, it ends cleanly. You leave with your skills, your portfolio, and full ownership of your subsequent work.' },
  { icon: '📣', title: 'PromptIQ Promotes You for 1 Month', body: 'When you finish and launch your own page, PromptIQ will actively promote you for a full month across our platforms. You built with us — we send our audience to you.' },
];

export default function Home() {
  const [step, setStep] = useState('form'); // form | paying
  const [form, setForm] = useState({ name: '', email: '', whatsapp: '', country: '', experience: '', motivation: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [applicationId, setApplicationId] = useState(null);
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

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.whatsapp.trim()) e.whatsapp = 'Required';
    if (!form.country) e.country = 'Required';
    if (!form.experience) e.experience = 'Required';
    if (!form.motivation.trim() || form.motivation.trim().length < 20) e.motivation = 'Tell us a little more';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    setSubmitError('');

    try {
      // Store application in Supabase with status 'pending'
      // Payment ref and status will update after Paystack confirms
      const { data, error } = await supabase
        .from('applications')
        .insert([{
          full_name:      form.name.trim(),
          email:          form.email.trim().toLowerCase(),
          whatsapp:       form.whatsapp.trim(),
          country:        form.country,
          experience:     form.experience,
          motivation:     form.motivation.trim(),
          payment_status: 'pending',
          price_kobo:     PRICE_KOBO,
          cohort:         'Cohort 1',
        }])
        .select('id')
        .single();

      if (error) throw error;

      // Store the Supabase row ID so we can update it after payment
      setApplicationId(data.id);
      setStep('paying');
      setTimeout(() => openPaystack(data.id), 300);

    } catch (err) {
      console.error('Supabase insert error:', err);
      setSubmitError('Something went wrong saving your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPaystack = (appId) => {
    if (typeof window === 'undefined' || !window.PaystackPop) return;
    const ref = 'IQC-' + Date.now() + '-' + Math.floor(Math.random() * 99999);

    const handler = window.PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email: form.email,
      amount: PRICE_KOBO,
      currency: 'NGN',
      ref,
      metadata: {
        custom_fields: [
          { display_name: 'Applicant Name',  variable_name: 'name',       value: form.name },
          { display_name: 'WhatsApp',        variable_name: 'whatsapp',   value: form.whatsapp },
          { display_name: 'Country',         variable_name: 'country',    value: form.country },
          { display_name: 'Experience',      variable_name: 'experience', value: form.experience },
          { display_name: 'Supabase ID',     variable_name: 'app_id',     value: appId || applicationId },
          { display_name: 'Programme',       variable_name: 'programme',  value: 'PromptIQ Cinematic AI Internship — Cohort 1' },
        ]
      },
      callback: async (response) => {
        // Update the application row with the Paystack reference and mark as paid
        const id = appId || applicationId;
        if (id) {
          await supabase
            .from('applications')
            .update({
              payment_ref:    response.reference,
              payment_status: 'paid',
            })
            .eq('id', id);
        }
        window.location.href = '/success';
      },
      onClose: () => {
        // User closed Paystack without paying — row stays as 'pending' in Supabase
        // They can reopen payment via the button shown in 'paying' step
        setStep('paying');
      },
    });

    handler.openIframe();
  };

  return (
    <>
      <Head>
        <title>Cinematic AI Internship — PromptIQ</title>
        <meta name="description" content="A 3-month internship in cinematic AI content creation. Taught by PromptIQ — the studio behind millions of views." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap" rel="stylesheet" />
      </Head>

      <Script src="https://js.paystack.co/v1/inline.js" strategy="beforeInteractive" />

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
        body { font-family:'DM Sans',sans-serif; background:var(--brown); color:var(--body); line-height:1.65; overflow-x:hidden; -webkit-font-smoothing:antialiased; }
        body::before {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:9999; opacity:0.35;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
        nav { position:fixed; top:0; left:0; right:0; z-index:100; display:flex; align-items:center; justify-content:space-between; padding:14px 6%; background:rgba(12,8,6,0.92); backdrop-filter:blur(20px); border-bottom:1px solid var(--border-soft); }
        .logo { display:flex; align-items:center; gap:10px; }
        .logo img { height:32px; width:auto; }
        .logo-text { font-family:'Outfit',sans-serif; font-weight:800; font-size:1.1rem; color:var(--white); letter-spacing:-0.5px; }
        .logo-text span { color:var(--pink); }
        .nav-tag { font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--purple); background:var(--purple-dim); border:1px solid var(--purple-border); padding:5px 12px; border-radius:100px; }
        .hero { position:relative; padding:140px 6% 100px; min-height:100vh; display:flex; align-items:center; overflow:hidden; }
        .hero-glow1 { position:absolute; top:-15%; right:-5%; width:700px; height:600px; border-radius:50%; pointer-events:none; background:radial-gradient(ellipse,rgba(155,109,255,0.06) 0%,transparent 70%); }
        .hero-glow2 { position:absolute; bottom:-10%; left:-10%; width:500px; height:500px; border-radius:50%; pointer-events:none; background:radial-gradient(ellipse,rgba(232,116,154,0.05) 0%,transparent 70%); }
        .hero-inner { position:relative; z-index:1; max-width:700px; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:var(--pink-dim); border:1px solid var(--pink-border); color:var(--pink-bright); font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:700; padding:6px 14px; border-radius:100px; margin-bottom:28px; letter-spacing:1.5px; text-transform:uppercase; animation:fadeUp 0.5s ease both; }
        .bdot { width:7px; height:7px; background:var(--pink); border-radius:50%; box-shadow:0 0 8px var(--pink); flex-shrink:0; animation:pulse 1.6s ease-in-out infinite; }
        .hero-h1 { font-family:'Bebas Neue',sans-serif; font-size:clamp(3.5rem,7vw,7rem); letter-spacing:2px; text-transform:uppercase; color:var(--white); line-height:0.95; animation:fadeUp 0.5s 0.08s ease both; }
        .hero-h1 .pk { color:var(--pink); }
        .hero-h1 .pu { color:var(--purple-bright); }
        .hero-desc { font-size:1rem; color:var(--body); margin-top:24px; max-width:520px; line-height:1.8; font-weight:300; animation:fadeUp 0.5s 0.16s ease both; }
        .hero-cta { display:inline-flex; align-items:center; gap:8px; margin-top:36px; background:var(--pink); color:var(--brown); font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:700; padding:15px 32px; border-radius:100px; border:none; cursor:pointer; transition:background 0.2s,transform 0.15s,box-shadow 0.2s; animation:fadeUp 0.5s 0.24s ease both; text-decoration:none; }
        .hero-cta:hover { background:var(--pink-bright); transform:translateY(-2px); box-shadow:0 8px 28px rgba(232,116,154,0.35); }
        .hero-meta { margin-top:16px; font-family:'Outfit',sans-serif; font-size:0.75rem; color:var(--muted); letter-spacing:0.5px; animation:fadeUp 0.5s 0.32s ease both; }
        .hero-meta strong { color:var(--pink); }
        .ticker { background:var(--brown-mid); border-top:1px solid var(--border-soft); border-bottom:1px solid var(--border-soft); padding:11px 0; overflow:hidden; white-space:nowrap; }
        .ticker-t { display:inline-flex; animation:ticker 30s linear infinite; }
        .ti { display:inline-flex; align-items:center; gap:10px; padding:0 24px; font-size:0.76rem; color:var(--muted); }
        .ti strong { color:var(--purple-bright); font-weight:600; }
        .td { width:4px; height:4px; background:var(--pink); border-radius:50%; opacity:0.5; flex-shrink:0; }
        .sec { padding:90px 6%; max-width:1100px; margin:0 auto; }
        .sec-full { padding:90px 6%; background:var(--brown-mid); border-top:1px solid var(--border-soft); border-bottom:1px solid var(--border-soft); }
        .sec-full .sec-inner { max-width:1100px; margin:0 auto; }
        .lbl { font-family:'Outfit',sans-serif; font-size:0.68rem; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--purple-bright); margin-bottom:10px; display:flex; align-items:center; gap:12px; }
        .lbl::after { content:''; width:32px; height:2px; background:var(--purple); border-radius:2px; opacity:0.5; }
        .lbl-pk { color:var(--pink); }
        .lbl-pk::after { background:var(--pink); }
        .hdg { font-family:'Bebas Neue',sans-serif; font-size:clamp(2.4rem,4vw,3.8rem); letter-spacing:1.5px; text-transform:uppercase; color:var(--white); line-height:0.95; }
        .hdg em { color:var(--pink); font-style:normal; }
        .hdg .pu { color:var(--purple-bright); }
        .sub-text { font-size:0.93rem; color:var(--body); max-width:540px; margin-top:14px; line-height:1.8; font-weight:300; }
        .curr-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:var(--border-soft); border:1px solid var(--border-soft); border-radius:var(--r); overflow:hidden; margin-top:48px; }
        .curr-item { background:var(--brown-card); padding:28px 24px; position:relative; transition:background 0.2s; overflow:hidden; }
        .curr-item::before { content:''; position:absolute; bottom:0; left:0; right:0; height:2px; background:linear-gradient(90deg,var(--pink),var(--purple)); transform:scaleX(0); transform-origin:left; transition:transform 0.3s; }
        .curr-item:hover { background:var(--brown-raise); }
        .curr-item:hover::before { transform:scaleX(1); }
        .curr-n { font-family:'Outfit',sans-serif; font-size:0.65rem; font-weight:700; letter-spacing:2px; color:var(--purple); margin-bottom:14px; }
        .curr-name { font-family:'Outfit',sans-serif; font-size:1rem; font-weight:700; color:var(--white); margin-bottom:8px; }
        .curr-desc { font-size:0.82rem; color:var(--body); line-height:1.7; font-weight:300; }
        .ben-list { margin-top:48px; display:flex; flex-direction:column; }
        .ben-row { display:flex; align-items:flex-start; gap:20px; padding:26px 0; border-bottom:1px solid var(--border-soft); }
        .ben-row:first-child { border-top:1px solid var(--border-soft); }
        .ben-icon { width:42px; height:42px; background:var(--pink-dim); border:1px solid var(--pink-border); border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
        .ben-text strong { display:block; font-family:'Outfit',sans-serif; font-size:0.97rem; font-weight:700; color:var(--white); margin-bottom:5px; }
        .ben-text p { font-size:0.83rem; color:var(--body); line-height:1.72; font-weight:300; }
        .about-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
        .stat-card { background:var(--brown); border:1px solid var(--border-soft); border-radius:var(--r); padding:20px; transition:border-color 0.2s; }
        .stat-card:hover { border-color:var(--border); }
        .stat-card strong { font-family:'Bebas Neue',sans-serif; font-size:2rem; letter-spacing:1px; color:var(--pink); display:block; margin-bottom:4px; }
        .stat-card span { font-size:0.72rem; color:var(--body); }
        .stat-pu strong { color:var(--purple-bright); }
        .apply-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; }
        .form-wrap { background:var(--brown-card); border:1px solid var(--border-soft); border-radius:var(--r); padding:40px 36px; }
        .form-row { margin-bottom:20px; }
        .form-label { font-family:'Outfit',sans-serif; font-size:0.68rem; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--purple-bright); display:block; margin-bottom:8px; }
        .form-input,.form-select,.form-textarea { width:100%; background:var(--brown-raise); border:1px solid var(--border-soft); color:var(--white); font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:400; padding:13px 16px; outline:none; border-radius:6px; transition:border-color 0.2s; appearance:none; }
        .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--pink); }
        .form-input.err,.form-select.err,.form-textarea.err { border-color:rgba(255,100,100,0.5); }
        .err-msg { font-size:0.72rem; color:#ff8888; margin-top:5px; display:block; }
        .submit-err { font-size:0.8rem; color:#ff8888; margin-top:12px; padding:12px 16px; background:rgba(255,100,100,0.07); border:1px solid rgba(255,100,100,0.2); border-radius:6px; }
        .form-textarea { min-height:110px; resize:vertical; }
        .form-select option { background:var(--brown-mid); }
        .form-submit { width:100%; background:var(--pink); color:var(--brown); font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:700; border:none; padding:16px; border-radius:100px; cursor:pointer; margin-top:8px; transition:background 0.2s,transform 0.15s,box-shadow 0.2s; }
        .form-submit:hover:not(:disabled) { background:var(--pink-bright); transform:translateY(-2px); box-shadow:0 8px 24px rgba(232,116,154,0.3); }
        .form-submit:disabled { opacity:0.5; cursor:not-allowed; }
        .price-pill { display:inline-flex; align-items:center; gap:6px; background:var(--purple-dim); border:1px solid var(--purple-border); color:var(--purple-bright); font-family:'Outfit',sans-serif; font-size:0.75rem; font-weight:700; padding:6px 14px; border-radius:100px; margin-bottom:20px; }
        .paying-state { text-align:center; padding:40px 20px; }
        .paying-state h3 { font-family:'Bebas Neue',sans-serif; font-size:2rem; letter-spacing:1px; color:var(--white); margin-bottom:12px; }
        .paying-state p { font-size:0.88rem; color:var(--body); margin-bottom:24px; }
        footer { background:var(--brown-mid); border-top:1px solid var(--border-soft); padding:24px 6%; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:12px; }
        .f-logo { display:flex; align-items:center; gap:8px; }
        .f-logo img { height:24px; }
        .f-logo span { font-family:'Outfit',sans-serif; font-weight:800; color:var(--white); font-size:0.95rem; }
        .f-logo span em { color:var(--pink); font-style:normal; }
        footer p { font-size:0.74rem; color:var(--muted); }
        .rev { opacity:0; transform:translateY(24px); transition:opacity 0.65s ease,transform 0.65s ease; }
        .rev.on { opacity:1; transform:none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(1.5)} }
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @media(max-width:900px){ .curr-grid{grid-template-columns:1fr 1fr;} .about-grid{grid-template-columns:1fr;} .apply-grid{grid-template-columns:1fr;} }
        @media(max-width:580px){ .curr-grid{grid-template-columns:1fr;} .stat-grid{grid-template-columns:1fr 1fr;} footer{flex-direction:column;text-align:center;} .form-wrap{padding:28px 20px;} }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="logo">
          <img src="/logo.png" alt="PromptIQ" onError={e => { e.target.style.display = 'none'; }} />
        </div>
        <div className="nav-tag">Internship · Cohort 1</div>
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

      {/* APPLY */}
      <section className="sec" id="apply">
        <div className="apply-grid">
          <div className="rev" ref={addRef}>
            <p className="lbl lbl-pk">Apply</p>
            <h2 className="hdg">Ready to <em>create?</em></h2>
            <p className="sub-text" style={{ marginTop: 14 }}>Fill in the form. After submission you'll complete your payment to secure your spot. Once confirmed, you'll receive your WhatsApp group access instantly.</p>
            <div style={{ marginTop: 32, padding: '28px', background: 'var(--brown-card)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r)' }}>
              <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', letterSpacing: '1px', color: 'var(--purple-bright)', lineHeight: 1 }}>{PRICE_DISPLAY}</p>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: 6 }}>One-time entry fee · 3 months full access</p>
              <ul style={{ marginTop: 20, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {['9 cinematic AI skill modules','Practice on live PromptIQ productions','Private WhatsApp mentorship group','Direct instructor feedback','Portfolio of real completed work'].map((item, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.83rem', color: 'var(--body)' }}>
                    <span style={{ color: 'var(--pink)', fontSize: '0.7rem' }}>→</span>{item}
                  </li>
                ))}
              </ul>
              <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 20, lineHeight: 1.6 }}>International applicants welcome. Paystack accepts cards from most countries.</p>
            </div>
          </div>

          <div className="form-wrap rev" ref={addRef}>
            {step === 'form' && (
              <form onSubmit={handleSubmit} noValidate>
                <div className="price-pill">✦ Cohort 1 — {PRICE_DISPLAY}</div>
                {[
                  { id: 'name',     label: 'Full Name',                      type: 'text',  placeholder: 'Your full name' },
                  { id: 'email',    label: 'Email Address',                   type: 'email', placeholder: 'your@email.com' },
                  { id: 'whatsapp', label: 'WhatsApp (with country code)',     type: 'tel',   placeholder: '+234 800 000 0000' },
                ].map(f => (
                  <div className="form-row" key={f.id}>
                    <label className="form-label" htmlFor={f.id}>{f.label}</label>
                    <input
                      className={`form-input${errors[f.id] ? ' err' : ''}`}
                      id={f.id} type={f.type} placeholder={f.placeholder}
                      value={form[f.id]}
                      onChange={e => setForm(p => ({ ...p, [f.id]: e.target.value }))}
                    />
                    {errors[f.id] && <span className="err-msg">{errors[f.id]}</span>}
                  </div>
                ))}
                <div className="form-row">
                  <label className="form-label" htmlFor="country">Country</label>
                  <select className={`form-select${errors.country ? ' err' : ''}`} id="country"
                    value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))}>
                    <option value="" disabled>Select your country</option>
                    {['Nigeria','Ghana','Kenya','South Africa','United Kingdom','United States','Canada','Other'].map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.country && <span className="err-msg">{errors.country}</span>}
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="experience">Your current experience</label>
                  <select className={`form-select${errors.experience ? ' err' : ''}`} id="experience"
                    value={form.experience} onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}>
                    <option value="" disabled>Select your level</option>
                    <option>Complete beginner — never made AI content</option>
                    <option>Some experience — tried a few tools</option>
                    <option>Intermediate — making content regularly</option>
                    <option>Advanced — professional AI content creator</option>
                  </select>
                  {errors.experience && <span className="err-msg">{errors.experience}</span>}
                </div>
                <div className="form-row">
                  <label className="form-label" htmlFor="motivation">Why do you want this?</label>
                  <textarea
                    className={`form-textarea${errors.motivation ? ' err' : ''}`}
                    id="motivation" placeholder="Be specific. What do you want to build?"
                    value={form.motivation}
                    onChange={e => setForm(p => ({ ...p, motivation: e.target.value }))}
                  />
                  {errors.motivation && <span className="err-msg">{errors.motivation}</span>}
                </div>
                <button type="submit" className="form-submit" disabled={submitting}>
                  {submitting ? 'Saving your application...' : 'Submit & Proceed to Payment →'}
                </button>
                {submitError && <p className="submit-err">{submitError}</p>}
              </form>
            )}

            {step === 'paying' && (
              <div className="paying-state">
                <h3>One last step.</h3>
                <p>Your application is saved. Complete your {PRICE_DISPLAY} payment to secure your spot in Cohort 1.</p>
                <button className="form-submit" onClick={() => openPaystack(applicationId)}>
                  Complete Payment — {PRICE_DISPLAY} →
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="f-logo">
          <img src="/logo.png" alt="PromptIQ" onError={e => { e.target.style.display = 'none'; }} />
        </div>
        <p>© 2025 PromptIQ. All rights reserved.</p>
        <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>Cinematic AI Content Creation Internship</p>
      </footer>
    </>
  );
}
