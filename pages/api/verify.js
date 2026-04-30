// /pages/api/verify.js

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ status: 'error', message: 'Missing reference' });
  }

  try {
    // ── 1. Verify with Paystack ───────────────────────────────────────────────
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );

    const paystackData = await paystackRes.json();

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return res.status(400).json({ status: 'failed' });
    }

    const referenceCode = paystackData.data.reference;

    // ── 2. Extract app_id from Paystack metadata ──────────────────────────────
    // app_id is the Supabase row UUID injected as a custom_field during payment init.
    // Matching on this guarantees exactly one row is updated — no email collisions.
    const customFields = paystackData.data.metadata?.custom_fields || [];
    const appId = customFields.find(f => f.variable_name === 'app_id')?.value;

    if (!appId) {
      console.error('verify: app_id missing from Paystack metadata');
      return res.status(400).json({ status: 'error', message: 'Missing app_id in metadata' });
    }

    // ── 3. Update exactly that one row ────────────────────────────────────────
    const { error } = await supabase
      .from('applications')
      .update({ payment_status: 'paid', payment_ref: referenceCode })
      .eq('id', appId);

    if (error) {
      console.error('DB update error:', error);
      return res.status(500).json({ status: 'db_error' });
    }

    return res.status(200).json({ status: 'success' });

  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ status: 'error' });
  }
}
