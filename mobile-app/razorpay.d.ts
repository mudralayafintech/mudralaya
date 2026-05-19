declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    description?: string;
    image?: string;
    currency: string;
    key: string;
    amount: string | number;
    name: string;
    order_id?: string;
    prefill?: {
      email?: string;
      contact?: string;
      name?: string;
    };
    theme?: {
      color?: string;
    };
  }

  export interface RazorpaySuccess {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }

  export interface RazorpayError {
    code: number;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: string;
  }

  export default class RazorpayCheckout {
    static open(options: RazorpayOptions): Promise<RazorpaySuccess>;
  }
}
