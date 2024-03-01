import Stripe from 'stripe';
import {
  subscriptionStatusCheck,
  updateSubscriptionRenewal,
  SubscriptionInfo,
} from '@full-circle-suite/stripe-subscription-handler';
import { User, writeUser, getUser } from '@libs/dynamo-db';

export async function stripeEventHandler(event: Stripe.Event, stripe: Stripe) {
  //   console.log('event', event.data.object);

  let subscriptionInfo: SubscriptionInfo;
  const subscriptionEvents = [
    'customer.subscription.created',
    'customer.subscription.deleted',
    'customer.subscription.paused',
    'customer.subscription.resumed',
    'customer.subscription.updated',
  ];

  // Succuessful Payment and subscription continuation
  if (event.type === 'invoice.paid') {
    // console.log('payment intent created', event);
    subscriptionInfo = await updateSubscriptionRenewal(stripe, event);
  }
  // Other subscription events that we're not sure about yet
  if (subscriptionEvents.includes(event.type)) {
    subscriptionInfo = await subscriptionStatusCheck(stripe, event);
  }
  if (subscriptionInfo && subscriptionInfo.customerPhone) {
    console.log('Subscription Info:', subscriptionInfo);
    // TODO: Update User Subscription Status
    const user: User = await getUser(subscriptionInfo.customerPhone);
    if (user) {
      if (subscriptionInfo.active) {
        user.subscriptionEndDate = subscriptionInfo.subscriptionEnd;
      } else {
        user.subscriptionEndDate = null;
      }
      await writeUser(user);
    }
  }
  return;
}
