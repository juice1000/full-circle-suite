import Stripe from 'stripe';
export interface SubscriptionInfo {
  active: boolean;
  subscriptionEnd: Date;
  customerPhone: string | null;
}
export async function subscriptionStatusCheck(
  stripe: Stripe,
  event: Stripe.Event
): Promise<SubscriptionInfo | null> {
  const subscription = event.data.object as Stripe.Subscription;
  // console.log('Subscription Object', subscription);

  const subscriptionEnd = new Date(subscription.current_period_end * 1000);
  console.log('\n\nSubscription Status Check: ', subscription.status);
  console.log('Subscription End', subscriptionEnd);

  try {
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;
    // console.log('Customer:', customer.id);
    // console.log(`Customer Email: ${customer.email}`);
    // console.log(`Customer Phone: `, customer.phone);

    const subscriptionInfo: SubscriptionInfo = {
      active: false,
      subscriptionEnd: subscriptionEnd,
      customerPhone: customer.phone,
    };
    if (['active', 'trailing'].includes(subscription.status)) {
      console.log('Subscription Active');
      // handle active subscription
      subscriptionInfo.active = true;
    } else {
      console.log('Subscription Inacive');
      // handle inactive subscription
      subscriptionInfo.active = false;
    }
    return subscriptionInfo;
  } catch (err) {
    console.error(err);
    return;
  }
}

export async function updateSubscriptionRenewal(
  stripe: Stripe,
  event: Stripe.Event
): Promise<SubscriptionInfo | null> {
  const invoice = event.data.object as Stripe.Invoice;

  try {
    const customer = (await stripe.customers.retrieve(
      invoice.customer as string
    )) as Stripe.Customer;

    const today = new Date();
    const oneMonthAhead = new Date(today);
    oneMonthAhead.setMonth(today.getMonth() + 1);

    const subscriptionInfo: SubscriptionInfo = {
      active: false,
      subscriptionEnd: oneMonthAhead,
      customerPhone: customer.phone,
    };

    return subscriptionInfo;
  } catch (err) {
    console.error(err);
    return;
  }
}
