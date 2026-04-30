import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const WHATSAPP_GROUP = 'https://chat.whatsapp.com/EFHWekt4c6rJtnumWZpqMT';

export default function Success() {
  const router = useRouter();
  const { reference } = router.query;

  const [status, setStatus] = useState('checking'); // checking | success | failed

  // ── Payment verification ──────────────────────────────────────────────────
  useEffect(() => {
    if (!reference) return;

    const verifyPayment = async () => {
      try {
        const res = await fetch(`/api/verify?reference=${reference}`);
        const data = await res.json();
        if (data.status === 'success') {
          setStatus('success');
        } else {
          setStatus('failed');
          setTimeout(() => router.replace('/'), 3000);
        }
      } catch {
        setStatus('failed');
        setTimeout(() => router.replace('/'), 3000);
      }
    };

    verifyPayment();
  }, [reference]);

  // ── Confetti (only when payment confirmed) ────────────────────────────────
  useEffect(() => {
    if (status !== 'success') return;
    const canvas = document.getElementById('confetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * -1,
      r: Math.random() * 5 + 2,
      d: Math.random() * 3 + 1,
      color: ['#E8749A', '#9B6DFF', '#F590AE', '#B490FF', '#FFF8F5'][
        Math.floor(Math.random() * 5)
      ],
      tilt: Math.random() * 10 - 5,
      tiltAngle: 0,
    }));
    let frame;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * 0.5, p.tilt, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        p.y += p.d;
        p.tiltAngle += 0.05;
        p.tilt = Math.sin(p.tiltAngle) * 8;
        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    const timer = setTimeout(() => cancelAnimationFrame(frame), 4000);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
    };
  }, [status]);

  // ── Shared styles ─────────────────────────────────────────────────────────
  const globalStyles = `
    :root {
      --brown:        #0C0806;
      --brown-card:   #1A1109;
      --brown-raise:  #221608;
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
      --border-soft:  rgba(255,255,255,0.06);
    }
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    body {
      font-family:'DM Sans',sans-serif;
      background:var(--brown);
      color:var(--body);
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      overflow:hidden;
      -webkit-font-smoothing:antialiased;
    }
    body::before {
      content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:0.35;
      background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
    }
    canvas { position:fixed; inset:0; pointer-events:none; z-index:1; }

    /* ── State screens ── */
    .state-screen {
      position:relative; z-index:2;
      display:flex; flex-direction:column;
      align-items:center; justify-content:center;
      gap:12px; text-align:center;
    }
    .state-label {
      font-family:'Outfit',sans-serif; font-size:0.82rem;
      font-weight:700; letter-spacing:2px; text-transform:uppercase;
      color:var(--purple-bright);
    }
    .state-message {
      font-size:0.9rem; color:var(--muted); max-width:280px; line-height:1.7;
    }
    .spinner {
      width:36px; height:36px; border-radius:50%;
      border:2px solid var(--border-soft);
      border-top-color:var(--pink);
      animation:spin 0.8s linear infinite;
    }
    .failed-icon {
      width:52px; height:52px; border-radius:50%;
      background:rgba(232,116,154,0.09);
      border:1px solid var(--pink-border);
      display:flex; align-items:center; justify-content:center;
      font-size:1.4rem;
    }

    /* ── Success card ── */
    .card {
      position:relative; z-index:2;
      background:var(--brown-card);
      border:1px solid var(--border-soft);
      border-radius:16px;
      padding:56px 48px;
      max-width:560px; width:90%;
      text-align:center;
      animation:rise 0.7s cubic-bezier(0.22,1,0.36,1) both;
    }
    .logo-wrap {
      display:flex; align-items:center; justify-content:center;
      margin-bottom:32px;
    }
    .logo-wrap img { height:32px; }
    .check {
      width:64px; height:64px; border-radius:50%;
      background:linear-gradient(135deg,var(--pink-dim),var(--purple-dim));
      border:1px solid var(--pink-border);
      display:flex; align-items:center; justify-content:center;
      font-size:1.8rem; margin:0 auto 24px;
      animation:pop 0.5s 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    h1 {
      font-family:'Bebas Neue',sans-serif;
      font-size:clamp(2.4rem,6vw,3.2rem);
      letter-spacing:2px; text-transform:uppercase;
      color:var(--white); line-height:1;
      margin-bottom:8px;
      animation:fadeUp 0.5s 0.3s ease both;
    }
    h1 span { color:var(--pink); }
    .sub {
      font-size:0.93rem; color:var(--body); line-height:1.78;
      margin-bottom:32px; font-weight:300;
      animation:fadeUp 0.5s 0.4s ease both;
    }
    .divider {
      width:100%; height:1px;
      background:linear-gradient(90deg,transparent,var(--border-soft),transparent);
      margin:28px 0;
    }
    .instruction {
      font-family:'Outfit',sans-serif; font-size:0.8rem; font-weight:700;
      letter-spacing:2px; text-transform:uppercase;
      color:var(--purple-bright); margin-bottom:16px;
      animation:fadeUp 0.5s 0.5s ease both;
    }
    .wa-btn {
      display:inline-flex; align-items:center; justify-content:center; gap:10px;
      background:linear-gradient(135deg,var(--pink),var(--purple));
      color:var(--white); font-family:'DM Sans',sans-serif;
      font-size:1rem; font-weight:700; padding:18px 40px;
      border-radius:100px; border:none; cursor:pointer;
      text-decoration:none; width:100%;
      transition:opacity 0.2s, transform 0.15s, box-shadow 0.2s;
      animation:fadeUp 0.5s 0.55s ease both;
      box-shadow:0 8px 32px rgba(232,116,154,0.25);
    }
    .wa-btn:hover {
      opacity:0.92; transform:translateY(-2px);
      box-shadow:0 12px 40px rgba(155,109,255,0.35);
    }
    .wa-icon { font-size:1.2rem; }
    .note {
      font-size:0.74rem; color:var(--muted); margin-top:16px; line-height:1.6;
      animation:fadeUp 0.5s 0.6s ease both;
    }

    @keyframes rise   { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:none} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
    @keyframes pop    { from{opacity:0;transform:scale(0.4)} to{opacity:1;transform:scale(1)} }
    @keyframes spin   { to{transform:rotate(360deg)} }
  `;

  const fontLinks = (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      <link
        href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
        rel="stylesheet"
      />
    </>
  );

  // ── No reference in URL ───────────────────────────────────────────────────
  if (!reference) {
    return (
      <>
        <Head>
          <title>Invalid Access — PromptIQ</title>
          <link rel="icon" href="/favicon.png" />
          {fontLinks}
        </Head>
        <style>{globalStyles}</style>
        <div className="state-screen">
          <div className="failed-icon">⚠️</div>
          <p className="state-label">Invalid Access</p>
          <p className="state-message">No payment reference found. Redirecting you home…</p>
        </div>
      </>
    );
  }

  // ── Checking ──────────────────────────────────────────────────────────────
  if (status === 'checking') {
    return (
      <>
        <Head>
          <title>Verifying Payment — PromptIQ</title>
          <link rel="icon" href="/favicon.png" />
          {fontLinks}
        </Head>
        <style>{globalStyles}</style>
        <div className="state-screen">
          <div className="spinner" />
          <p className="state-label">Verifying Payment</p>
          <p className="state-message">Hold on while we confirm your payment…</p>
        </div>
      </>
    );
  }

  // ── Failed ────────────────────────────────────────────────────────────────
  if (status === 'failed') {
    return (
      <>
        <Head>
          <title>Payment Failed — PromptIQ</title>
          <link rel="icon" href="/favicon.png" />
          {fontLinks}
        </Head>
        <style>{globalStyles}</style>
        <div className="state-screen">
          <div className="failed-icon">✕</div>
          <p className="state-label">Verification Failed</p>
          <p className="state-message">We couldn't confirm your payment. Redirecting you back in 3 seconds…</p>
        </div>
      </>
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  return (
    <>
      <Head>
        <title>Welcome to Cohort 1 — PromptIQ</title>
        <link rel="icon" href="/favicon.png" />
        {fontLinks}
      </Head>
      <style>{globalStyles}</style>

      <canvas id="confetti" />

      <div className="card">
        <div className="logo-wrap">
          <img src="/logo.png" alt="PromptIQ" />
        </div>

        <div className="check">✦</div>

        <h1>You're in, <span>Cohort 1.</span></h1>

        <p className="sub">
          Payment confirmed. Welcome to the PromptIQ Cinematic AI Internship.
          You're about to learn the exact workflow behind millions of views —
          on real productions, with real audiences.
        </p>

        <div className="divider" />

        <p className="instruction">Next Step — Join Your Class</p>

        <a href={WHATSAPP_GROUP} className="wa-btn" target="_blank" rel="noopener noreferrer">
          <span className="wa-icon">💬</span>
          Join the Internship Group
        </a>

        <p className="note">
          This is your direct access to the private cohort group.<br />
          Save this page or screenshot it — the link is only shown here.
        </p>
      </div>
    </>
  );
}
