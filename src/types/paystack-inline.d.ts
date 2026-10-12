declare module "@paystack/inline-js" {
  export interface PaystackTransaction {
    id?: number;
    reference?: string;
    message?: string;
  }

  export interface PaystackError {
    message: string;
  }

  export interface NewTransactionOptions {
    key: string;
    amount: number;
    email: string;
    currency?: string;
    reference?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
    onSuccess?: (transaction: PaystackTransaction) => void;
    onCancel?: () => void;
    onError?: (error: PaystackError) => void;
    onLoad?: (data: {
      id: number;
      customer: unknown;
      accessCode: string;
    }) => void;
  }

  export default class PaystackPop {
    newTransaction(options: NewTransactionOptions): unknown;
    cancelTransaction(idOrTransaction: string | unknown): void;
    isLoaded(): boolean;
  }
}
