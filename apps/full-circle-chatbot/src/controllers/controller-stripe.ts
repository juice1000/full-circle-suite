import Stripe from 'stripe';
import {
  subscriptionStatusCheck,
  updateSubscriptionRenewal,
  SubscriptionInfo,
} from '@full-circle-suite/stripe-subscription-handler';
import { User, writeUser, getUser, getUserFromEmail } from '@libs/dynamo-db';

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
    // Update subscription status in database
    let user: User = await getUser(subscriptionInfo.customerPhone);
    if (!user) {
      user = await getUserFromEmail(subscriptionInfo.customerEmail);
    }
    if (user) {
      // In case the email was updated in Stripe
      user.email = subscriptionInfo.customerEmail;
      // user.firstname = subscriptionInfo.customerFirstName; // we omit this since the user chose their own name during the questionaire
      user.lastname = subscriptionInfo.customerLastName;
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
