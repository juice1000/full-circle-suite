import Stripe from 'stripe';

function handleSubscriptionCreated(stripe: Stripe, event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  // Assuming the customer ID is stored in the subscription object
  stripe.customers
    .retrieve(subscription.customer as string)
    .then((customer) => {
      console.log('Subscription Created');
      console.log(`Customer Email: ${customer.email}`);
      console.log(`Customer Phone: ${customer.phone}`);
      // Perform additional actions here
    })
    .catch((err) => console.log(err));
}

function handleSubscriptionDeleted(stripe: Stripe, event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;

  stripe.customers
    .retrieve(subscription.customer as string)
    .then((customer) => {
      console.log('Subscription Deleted/Expired');
      console.log(`Customer Email: ${customer.email}`);
      console.log(`Customer Phone: ${customer.phone}`);
      // Perform additional actions here
    })
    .catch((err) => console.log(err));
}
