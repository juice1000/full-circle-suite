import { stripeSubscriptionHandler } from './stripe-subscription-handler';

describe('stripeSubscriptionHandler', () => {
  it('should work', () => {
    expect(stripeSubscriptionHandler()).toEqual('stripe-subscription-handler');
  });
});
