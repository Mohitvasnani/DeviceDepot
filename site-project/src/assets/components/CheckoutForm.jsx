import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { toast } from 'react-toastify';

function CheckoutForm({ onSuccess }) {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        try {
            setLoading(true);

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                redirect: 'if_required'
            });

            if (error) {
                toast.error(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                toast.success('Payment successful!');
                onSuccess(); // place the order after payment
            }
        } catch (err) {
            toast.error('Payment failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            <button
                type="submit"
                className="btn btn-success w-100 mt-3"
                disabled={!stripe || loading}
            >
                {loading ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
}

export default CheckoutForm;