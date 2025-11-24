// Wix Page Code (Frontend)
// Place this in your page's Code panel. Assumes your HTML Component has the id "htmlQuote".
import wixPayFrontend from 'wix-pay-frontend';
import { createCustomPrintPayment } from 'backend/payments';

$w.onReady(function () {
  const htmlComponent = $w('#htmlQuote');
  if (!htmlComponent?.onMessage) {
    console.error('HTML component #htmlQuote not found.');
    return;
  }

  htmlComponent.onMessage(async (event) => {
    console.log('Received message from iframe:', event.data);
    if ($w('#debugText')) {
      try {
        $w('#debugText').text = JSON.stringify(event.data, null, 2);
      } catch (err) {
        console.warn('Unable to stringify event data for debugText:', err);
      }
    }

    const payload = event?.data;
    if (!payload || payload.type !== 'QUOTE_CONFIRMED') {
      return;
    }

    const quoteData = payload.data || {};
    const amount = Number(quoteData.totalPrice ?? quoteData.total);
    if (!isFinite(amount) || amount <= 0) {
      console.error('Invalid quote total received from iframe:', quoteData);
      return;
    }

    try {
      const payment = await createCustomPrintPayment(quoteData);
      const paymentResult = await wixPayFrontend.startPayment(payment.id);
      console.log('Payment result:', paymentResult);
    } catch (err) {
      console.error('Error starting payment from iframe quote:', err);
    }
  });
});
