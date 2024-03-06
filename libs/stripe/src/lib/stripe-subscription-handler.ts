import Stripe from 'stripe';
export interface SubscriptionInfo {
  active: boolean;
  subscriptionEnd: Date;
  customerPhone: string | null;
  customerEmail: string | null;
  customerFirstName: string;
  customerLastName: string;
}
export async function subscriptionStatusCheck(
  stripe: Stripe,
  event: Stripe.Event
): Promise<SubscriptionInfo | null> {
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionEnd = new Date(subscription.current_period_end * 1000);

  try {
    const customer = (await stripe.customers.retrieve(
      subscription.customer as string
    )) as Stripe.Customer;
    // console.log('Customer:', customer.id);
    // console.log(`Customer Email: ${customer.email}`);
    // console.log(`Customer Phone: `, customer.phone);
    console.log('\n\nSubscription for', customer.name, 'has changed!');
    console.log('Event Name: ', event.type);
    console.log('Subscription Status: ', subscription.status);
    console.log('Subscription End:', subscriptionEnd);

    const subscriptionInfo: SubscriptionInfo = {
      active: false,
      subscriptionEnd: subscriptionEnd,
      customerPhone: customer.phone ? customer.phone.slice(1) : '',
      customerEmail: customer.email,
      customerFirstName: customer.name ? customer.name.split(' ')[0] : '',
      customerLastName: customer.name ? customer.name.split(' ')[1] : '',
    };
    if (['active', 'trialing'].includes(subscription.status)) {
      console.log('Subscription Active');
      // handle active subscription
      subscriptionInfo.active = true;
    } else {
      console.log('Subscription Inactive');
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
    console.log('Invoice for', customer.name, 'has been paid!');
    console.log('Invoice Status: ', invoice.status);

    const today = new Date();
    const threeMonthsAhead = new Date(today);
    threeMonthsAhead.setMonth(today.getMonth() + 3);

    const subscriptionInfo: SubscriptionInfo = {
      active: true,
      subscriptionEnd: threeMonthsAhead,
      customerPhone: customer.phone.slice(1), // what's app cloud api doesn't accept the + sign
      customerEmail: customer.email,
      customerFirstName: customer.name.split(' ')[0] || '',
      customerLastName: customer.name.split(' ')[1] || '',
    };

    return subscriptionInfo;
  } catch (err) {
    console.error(err);
    return;
  }
}
