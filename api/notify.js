const admin = require('firebase-admin');

function getApp() {
  if (admin.apps.length) return admin.app();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error('missing_service_account_env_var');
  const serviceAccount = JSON.parse(raw);
  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const MESSAGES = {
  presence: (sender) => ({
    title: 'CosmicLove',
    body: `${sender} est en ligne dans notre Univers ✨`
  }),
  mood: (sender, extra) => ({
    title: 'CosmicLove',
    body: `${sender} a changé d'humeur ${extra?.emoji || '💫'}${extra?.label ? ' · ' + extra.label : ''}`
  }),
  letter: (sender, extra) => ({
    title: 'CosmicLove',
    body: `${sender} t'a écrit : ${extra?.title || 'une nouvelle lettre'}`
  })
};

module.exports = async (req, res) => {
  // CORS minimal — le site et l'API sont sur le même domaine Vercel, mais on garde
  // ceci pour un test local ou un appel depuis un sous-domaine.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { type, sender, partner, extra, secret } = body;

    if (!process.env.NOTIFY_SHARED_SECRET || secret !== process.env.NOTIFY_SHARED_SECRET) {
      return res.status(401).json({ error: 'unauthorized' });
    }
    if (!['Chayma', 'Ilyess'].includes(sender) || !['Chayma', 'Ilyess'].includes(partner) || sender === partner) {
      return res.status(400).json({ error: 'invalid_users' });
    }
    if (!MESSAGES[type]) return res.status(400).json({ error: 'invalid_type' });

    getApp();
    const db = admin.firestore();

    const snap = await db.collection('pushSubscriptions')
      .where('user', '==', partner)
      .where('enabled', '==', true)
      .get();

    if (snap.empty) return res.status(200).json({ sent: 0, reason: 'no_token_for_partner' });

    const { title, body: notifBody } = MESSAGES[type](sender, extra);
    const tokens = snap.docs.map((d) => d.data().token).filter(Boolean);

    const results = await Promise.allSettled(tokens.map((token) =>
      admin.messaging().send({
        token,
        notification: { title, body: notifBody },
        data: { title, body: notifBody, sender, link: '/' },
        webpush: { fcmOptions: { link: '/' } }
      })
    ));

    let sent = 0;
    const staleTokens = [];
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        sent += 1;
      } else {
        const code = result.reason?.errorInfo?.code || result.reason?.code || '';
        if (code.includes('registration-token-not-registered') || code.includes('invalid-argument')) {
          staleTokens.push(tokens[i]);
        }
        console.warn('FCM send error:', code || result.reason);
      }
    });

    await Promise.all(staleTokens.map((token) => {
      const tokenId = encodeURIComponent(token).replace(/%/g, '_');
      return db.collection('pushSubscriptions').doc(tokenId).set({ enabled: false }, { merge: true }).catch(() => {});
    }));

    return res.status(200).json({ sent, staleRemoved: staleTokens.length });
  } catch (error) {
    console.error('notify handler error:', error);
    return res.status(500).json({ error: 'internal_error' });
  }
};
