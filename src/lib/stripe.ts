import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

export const STRIPE_PLANS = {
  basic: {
    name: "CotizaYa Básico",
    price: 0,
    interval: null,
  },
  pro: {
    name: "CotizaYa Pro",
    price: 2900, // $29.00 en centavos
    interval: "month",
    priceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
  },
  enterprise: {
    name: "CotizaYa Enterprise",
    price: 9900, // $99.00 en centavos
    interval: "month",
    priceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY,
  },
};

/**
 * Crear un cliente en Stripe
 */
export async function createStripeCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        createdAt: new Date().toISOString(),
      },
    });
    return customer;
  } catch (error) {
    console.error("Error creating Stripe customer:", error);
    throw error;
  }
}

/**
 * Crear una suscripción
 */
export async function createSubscription(
  customerId: string,
  priceId: string,
  trialDays: number = 14
) {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      trial_period_days: trialDays,
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });
    return subscription;
  } catch (error) {
    console.error("Error creating subscription:", error);
    throw error;
  }
}

/**
 * Cancelar una suscripción
 */
export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    throw error;
  }
}

/**
 * Obtener una suscripción
 */
export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error("Error retrieving subscription:", error);
    throw error;
  }
}

/**
 * Cambiar el plan de una suscripción
 */
export async function updateSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const subscription_item_id = subscription.items.data[0].id;

    const updated = await stripe.subscriptionItems.update(subscription_item_id, {
      price: newPriceId,
    });

    return updated;
  } catch (error) {
    console.error("Error updating subscription plan:", error);
    throw error;
  }
}

/**
 * Crear un portal de gestión de suscripción
 */
export async function createBillingPortalSession(
  customerId: string,
  returnUrl: string
) {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session;
  } catch (error) {
    console.error("Error creating billing portal session:", error);
    throw error;
  }
}

/**
 * Crear una sesión de checkout
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 14,
      },
    });
    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

export default stripe;
