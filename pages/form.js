import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../lib/supabase';

const PRICE_KOBO    = parseInt(process.env.NEXT_PUBLIC_PRICE_KOBO || '1000000');
const PRICE_DISPLAY = '₦' + (PRICE_KOBO / 100).toLocaleString('en-NG', { maximumFractionDigits: 0 });
const SELAR_URL     = 'https://selar.com/85721656e5';

function loadPaystackScript() {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    const existing = document.getElementById('paystack-inline');
    if (existing) {
      existing.addEventListener('load', resolve);
      existing.addEventListener('error', reject);
      return;
    }
    const script    = document.createElement('script');
    script.id       = 'paystack-inline';
    script.src      = 'https://js.paystack.co/v2/inline.js';
    script.async    = true;
    script.onload   = resolve;
    script.onerror  = reject;
    document.body.appendChild(script);
  });
}

const COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa',
  'United Kingdom','United States','Canada','Other',
];

const EXPERIENCE_OPTIONS = [
  'Complete beginner — never made AI content',
  'Some experience — tried a few tools',
  'Intermediate — making content regularly',
  'Advanced — professional AI content creator',
];

export default function FormPage() {
  const router = useRouter();
  const { method } = router.query; // 'paystack' | 'selar'

  const [step, setStep]               = useState('form'); // 'form' | 'paying'
  const [form, setForm]               = useState({ name:'', email:'', whatsapp:'', country:'', experience:'', motivation:'' });
  const [errors, setErrors]           = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [applicationId, setApplicationId] = useState(null);

  const revRefs = useRef([]);
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); obs.unobserve(e.target); } });
    }, { threshold: 0.08 });
    revRefs.current.forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);
  const addRef = el => { if (el && !revRefs.current.includes(el)) revRefs.current.push(el); };

  // redirect if no method
  useEffect(() => {
    if (router.isReady && method && method !== 'paystack' && method !== 'selar') {
      router.replace('/');
    }
  }, [router.isReady, method]);

  const isPaystack = method === 'paystack';
  const isSelar    = method === 'selar';

  const validate = () => {
    const e = {};
    if (!form.name.trim())     e.name       = 'Required';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (!form.whatsapp.trim()) e.whatsapp   = 'Required';
    if (!form.country)         e.country    = 'Required';
    if (!form.experience)      e.experience = 'Required';
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
          payment_method: isSelar ? 'selar' : 'paystack',
          price_kobo:     PRICE_KOBO,
          cohort:         'Cohort 1',
        }])
        .select('id')
        .single();

      if (error) throw error;

      setApplicationId(data.id);

      if (isSelar) {
        // redirect straight to Selar — no payment handling needed here
        window.location.href = SELAR_URL;
        return;
      }

      // Paystack flow
      setStep('paying');
      setTimeout(() => openPaystack(data.id, { ...form }), 300);

    } catch (err) {
      console.error('Supabase insert error:', err);
      setSubmitError('Something went wrong saving your application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const openPaystack = async (appId, formSnapshot) => {
    const data = formSnapshot || form;
    try {
      await loadPaystackScript();
    } catch {
      setSubmitError('Could not load payment processor. Please refresh and try again.');
      return;
    }
    if (!window.PaystackPop) {
      setSubmitError('Payment processor unavailable. Please refresh and try again.');
      return;
    }
    const ref     = 'IQC-' + Date.now() + '-' + Math.floor(Math.random() * 99999);
    const paystack = new window.PaystackPop();
    paystack.newTransaction({
      key:      process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
      email:    data.email,
      amount:   PRICE_KOBO,
      currency: 'NGN',
      ref,
      metadata: {
        custom_fields: [
          { display_name:'Applicant Name', variable_name:'name',       value:data.name },
          { display_name:'WhatsApp',       variable_name:'whatsapp',   value:data.whatsapp },
          { display_name:'Country',        variable_name:'country',    value:data.country },
          { display_name:'Experience',     variable_name:'experience', value:data.experience },
          { display_name:'Supabase ID',    variable_name:'app_id',     value:appId },
          { display_name:'Programme',      variable_name:'programme',  value:'PromptIQ Creator Internship — Cohort 1' },
        ],
      },
      onSuccess: (response) => {
        window.location.href = `/success?reference=${response.reference}`;
      },
      onCancel: () => {
        setStep('paying');
      },
    });
  };

  const methodLabel   = isSelar ? 'Selar' : 'Paystack';
  const methodColor   = isSelar ? 'rgba(123,31,106,0.9)' : 'rgba(89,184,230,0.8)';
  const methodBg      = isSelar ? 'rgba(123,31,106,0.12)' : 'rgba(89,184,230,0.1)';
  const methodBorder  = isSelar ? 'rgba(123,31,106,0.3)'  : 'rgba(89,184,230,0.25)';

  const submitLabel = submitting
    ? 'Saving your application…'
    : isSelar
      ? `Submit & Continue to Selar →`
      : `Submit & Proceed to Payment →`;

  return (
    <>
      <Head>
        <title>Apply — Creator Internship · PromptIQ</title>
        <meta name="description" content="Apply for the PromptIQ Creator Internship — Cohort 1." />
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
          background:var(--brown); color:var(--body);
          line-height:1.65; overflow-x:hidden; -webkit-font-smoothing:antialiased;
        }
        body::before {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:9999; opacity:0.35;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
        }
        nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:14px 6%; background:rgba(12,8,6,0.92); backdrop-filter:blur(20px);
          border-bottom:1px solid var(--border-soft);
        }
        .logo { display:flex; align-items:center; gap:10px; cursor:pointer; }
        .logo img { height:32px; width:auto; }
        .nav-tag {
          font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:700;
          letter-spacing:1.5px; text-transform:uppercase; color:var(--purple);
          background:var(--purple-dim); border:1px solid var(--purple-border);
          padding:5px 12px; border-radius:100px;
        }
        .page-wrap {
          min-height:100vh; padding:120px 6% 80px;
          display:flex; align-items:flex-start; justify-content:center;
        }
        .page-inner {
          width:100%; max-width:1000px;
          display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:start;
        }
        /* LEFT PANEL */
        .left-panel { position:sticky; top:120px; }
        .back-link {
          display:inline-flex; align-items:center; gap:6px;
          font-size:0.78rem; color:var(--muted); cursor:pointer;
          margin-bottom:28px; transition:color 0.2s;
          font-family:'Outfit',sans-serif; font-weight:500;
          background:none; border:none; padding:0;
        }
        .back-link:hover { color:var(--pink); }
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
          font-size:clamp(2.4rem,3.5vw,3.4rem);
          letter-spacing:1.5px; text-transform:uppercase;
          color:var(--white); line-height:0.95; margin-bottom:16px;
        }
        .hdg em { color:var(--pink); font-style:normal; }
        .sub-text { font-size:0.9rem; color:var(--body); line-height:1.8; font-weight:300; }
        .method-badge {
          display:inline-flex; align-items:center; gap:8px;
          font-family:'Outfit',sans-serif; font-size:0.72rem; font-weight:700;
          letter-spacing:1.5px; text-transform:uppercase;
          padding:6px 14px; border-radius:100px; margin-top:20px;
        }
        .price-summary {
          background:var(--brown-card); border:1px solid var(--border-soft);
          border-radius:var(--r); padding:24px; margin-top:24px;
        }
        .price-summary strong {
          font-family:'Bebas Neue',sans-serif; font-size:2.6rem;
          letter-spacing:1px; color:var(--purple-bright); display:block; line-height:1;
        }
        .price-summary p { font-size:0.76rem; color:var(--muted); margin-top:6px; }
        .price-items { margin-top:18px; list-style:none; display:flex; flex-direction:column; gap:8px; }
        .price-items li { display:flex; align-items:center; gap:8px; font-size:0.81rem; color:var(--body); }
        .price-items li span { color:var(--pink); font-size:0.7rem; }
        /* LOGO in price panel */
        .method-logo-wrap {
          display:flex; align-items:center; gap:10px; margin-top:20px;
          padding:14px 18px; background:var(--brown-raise);
          border:1px solid var(--border-soft); border-radius:8px;
        }
        .method-logo-wrap img { height:22px; width:auto; object-fit:contain; filter:brightness(0) invert(1); opacity:0.55; }
        .method-logo-wrap span { font-size:0.72rem; color:var(--muted); font-family:'Outfit',sans-serif; }
        /* RIGHT PANEL — FORM */
        .form-wrap {
          background:var(--brown-card); border:1px solid var(--border-soft);
          border-radius:var(--r); padding:40px 36px;
          animation:fadeUp 0.5s 0.1s ease both;
        }
        .form-row { margin-bottom:20px; }
        .form-label {
          font-family:'Outfit',sans-serif; font-size:0.68rem; font-weight:700;
          letter-spacing:2px; text-transform:uppercase; color:var(--purple-bright);
          display:block; margin-bottom:8px;
        }
        .form-input,.form-select,.form-textarea {
          width:100%; background:var(--brown-raise); border:1px solid var(--border-soft);
          color:var(--white); font-family:'DM Sans',sans-serif; font-size:0.9rem;
          font-weight:400; padding:13px 16px; outline:none; border-radius:6px;
          transition:border-color 0.2s; appearance:none;
        }
        .form-input:focus,.form-select:focus,.form-textarea:focus { border-color:var(--pink); }
        .form-input.err,.form-select.err,.form-textarea.err { border-color:rgba(255,100,100,0.5); }
        .err-msg { font-size:0.72rem; color:#ff8888; margin-top:5px; display:block; }
        .submit-err {
          font-size:0.8rem; color:#ff8888; margin-top:12px; padding:12px 16px;
          background:rgba(255,100,100,0.07); border:1px solid rgba(255,100,100,0.2);
          border-radius:6px;
        }
        .form-textarea { min-height:110px; resize:vertical; }
        .form-select option { background:var(--brown-mid); }
        .form-submit {
          width:100%; color:var(--brown); font-family:'DM Sans',sans-serif;
          font-size:0.9rem; font-weight:700; border:none; padding:16px;
          border-radius:100px; cursor:pointer; margin-top:8px;
          transition:background 0.2s,transform 0.15s,box-shadow 0.2s;
          background:var(--pink);
        }
        .form-submit:hover:not(:disabled) {
          background:var(--pink-bright); transform:translateY(-2px);
          box-shadow:0 8px 24px rgba(232,116,154,0.3);
        }
        .form-submit:disabled { opacity:0.5; cursor:not-allowed; }
        .paying-state { text-align:center; padding:40px 20px; }
        .paying-state h3 {
          font-family:'Bebas Neue',sans-serif; font-size:2rem;
          letter-spacing:1px; color:var(--white); margin-bottom:12px;
        }
        .paying-state p { font-size:0.88rem; color:var(--body); margin-bottom:24px; }
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
        .rev { opacity:0; transform:translateY(24px); transition:opacity 0.65s ease,transform 0.65s ease; }
        .rev.on { opacity:1; transform:none; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
        @media(max-width:900px){
          .page-inner { grid-template-columns:1fr; }
          .left-panel { position:static; }
        }
        @media(max-width:580px){
          .form-wrap { padding:28px 20px; }
          footer { flex-direction:column; text-align:center; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="logo" onClick={() => router.push('/')}>
          <img src="/logo.png" alt="PromptIQ" onError={e => { e.target.style.display = 'none'; }} />
        </div>
        <div className="nav-tag">Creator Internship · Cohort 1</div>
      </nav>

      <div className="page-wrap">
        <div className="page-inner">

          {/* LEFT */}
          <div className="left-panel">
            <button className="back-link" onClick={() => router.push('/')}>← Back</button>
            <p className="lbl lbl-pk">Your Application</p>
            <h2 className="hdg">Ready to<br /><em>create?</em></h2>
            <p className="sub-text">
              Fill in your details below. Once submitted, you'll be taken directly to complete your payment
              {isSelar ? ' on Selar' : ' via Paystack'} and get instant WhatsApp group access.
            </p>

            {/* Method badge */}
            <div
              className="method-badge"
              style={{ color: methodColor, background: methodBg, border: `1px solid ${methodBorder}` }}
            >
              <span style={{ width:6, height:6, borderRadius:'50%', background:methodColor, flexShrink:0, display:'inline-block' }} />
              Paying via {methodLabel}
            </div>

            {/* Price summary */}
            <div className="price-summary">
              <strong>{PRICE_DISPLAY}</strong>
              <p>One-time entry fee · 3 months full access</p>
              <ul className="price-items">
                {[
                  '9 cinematic AI skill modules',
                  'Practice on live PromptIQ productions',
                  'Private WhatsApp mentorship group',
                  'Direct instructor feedback',
                  'Portfolio of real completed work',
                ].map((item, i) => (
                  <li key={i}><span>→</span>{item}</li>
                ))}
              </ul>
            </div>

            {/* Payment method logo */}
            <div className="method-logo-wrap">
              <img
                src={isSelar ? '/selar.jpeg' : '/paystack.png'}
                alt={methodLabel}
              />
              <span>You'll complete payment {isSelar ? 'on selar.com' : 'via Paystack popup'}</span>
            </div>
          </div>

          {/* RIGHT — FORM */}
          <div className="form-wrap">
            {step === 'form' && (
              <form onSubmit={handleSubmit} noValidate>
                {[
                  { id:'name',     label:'Full Name',                   type:'text',  placeholder:'Your full name' },
                  { id:'email',    label:'Email Address',                type:'email', placeholder:'your@email.com' },
                  { id:'whatsapp', label:'WhatsApp (with country code)', type:'tel',   placeholder:'+234 800 000 0000' },
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
                  <select
                    className={`form-select${errors.country ? ' err' : ''}`}
                    id="country" value={form.country}
                    onChange={e => setForm(p => ({ ...p, country: e.target.value }))}
                  >
                    <option value="" disabled>Select your country</option>
                    {COUNTRIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.country && <span className="err-msg">{errors.country}</span>}
                </div>

                <div className="form-row">
                  <label className="form-label" htmlFor="experience">Your current experience</label>
                  <select
                    className={`form-select${errors.experience ? ' err' : ''}`}
                    id="experience" value={form.experience}
                    onChange={e => setForm(p => ({ ...p, experience: e.target.value }))}
                  >
                    <option value="" disabled>Select your level</option>
                    {EXPERIENCE_OPTIONS.map(o => <option key={o}>{o}</option>)}
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
                  {submitLabel}
                </button>
                {submitError && <p className="submit-err">{submitError}</p>}
              </form>
            )}

            {step === 'paying' && (
              <div className="paying-state">
                <h3>One last step.</h3>
                <p>Your application is saved. Complete your {PRICE_DISPLAY} payment to secure your spot in Cohort 1.</p>
                <button className="form-submit" onClick={() => openPaystack(applicationId, null)}>
                  Complete Payment — {PRICE_DISPLAY}
                </button>
                {submitError && <p className="submit-err">{submitError}</p>}
              </div>
            )}
          </div>

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

