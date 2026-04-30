// /pages/api/verify.js

export default async function handler(req, res) {
  const { reference } = req.query;

  if (!reference) {
    return res.status(400).json({ status: 'error', message: 'Missing reference' });
  }

  try {
    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const data = await paystackRes.json();

    if (!data.status || data.data.status !== 'success') {
      return res.status(400).json({ status: 'failed' });
    }

    const referenceCode = data.data.reference;
    const email = data.data.customer.email;

    // 🔥 UPDATE YOUR DATABASE (Supabase)
    const { createClient } = require('@supabase/supabase-js');

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ MUST be service role key (server only)
    );

    const { error } = await supabase
      .from('applications')
      .update({
        payment_status: 'paid',
        payment_ref: referenceCode,
      })
      .eq('email', email)
      .eq('payment_status', 'pending');

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
