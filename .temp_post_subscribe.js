(async () => {
  try {
    const res = await fetch('http://localhost:10000/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nbiswajit978@gmail.com' }),
    });
    console.log('STATUS', res.status);
    const text = await res.text();
    console.log('BODY', text);
  } catch (err) {
    console.error('ERROR', err);
    process.exit(1);
  }
})();
