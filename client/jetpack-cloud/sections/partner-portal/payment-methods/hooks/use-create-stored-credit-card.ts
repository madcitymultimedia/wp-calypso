/**
 * External dependencies
 */
import { useMemo } from 'react';
import type { StripeConfiguration, Stripe, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import {
	createStoredCreditCardPaymentMethodStore,
	createStoredCreditCardMethod,
} from 'calypso/jetpack-cloud/sections/partner-portal/payment-methods/stored-credit-card-method';

export function useCreateStoredCreditCard( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	shouldUseEbanx,
	shouldShowTaxFields = false,
	activePayButtonText = undefined,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	shouldUseEbanx: boolean;
	shouldShowTaxFields?: boolean;
	activePayButtonText?: string | undefined;
} ): PaymentMethod | null {
	const shouldLoadStripeMethod = ! isStripeLoading && ! stripeLoadingError;
	const stripePaymentMethodStore = useMemo( () => createStoredCreditCardPaymentMethodStore(), [] );
	const stripeMethod = useMemo(
		() =>
			shouldLoadStripeMethod
				? createStoredCreditCardMethod( {
						store: stripePaymentMethodStore,
						stripe,
						stripeConfiguration,
						shouldUseEbanx,
						shouldShowTaxFields,
						activePayButtonText,
				  } )
				: null,
		[
			shouldLoadStripeMethod,
			stripePaymentMethodStore,
			stripe,
			stripeConfiguration,
			shouldUseEbanx,
			shouldShowTaxFields,
			activePayButtonText,
		]
	);
	return stripeMethod;
}
