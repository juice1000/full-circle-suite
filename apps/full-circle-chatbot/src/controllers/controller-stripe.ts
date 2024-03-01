import Stripe from 'stripe';

export async function stripeEventHandler(event: Stripe.Event, stripe: Stripe) {
  console.log('event', event.data.object);
  // if (event.type === 'checkout.session.completed') {
  //   const session = event.data.object;
  //   console.log('checkout session completed', session);

  //   // Handle the event
  // }
  // if (event.type === 'payment_intent.created') {
  //   const paymentIntent = event.data.object;
  //   console.log('payment intent created', paymentIntent);
  // }
  if (event.type === 'customer.subscription.created') {
    // pass
  }
  if (event.type === 'customer.subscription.deleted') {
    // pass
  }
}
