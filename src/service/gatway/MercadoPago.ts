import { generateSecureRandomString } from "@/utils/generateSecureRandomString";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";

export class MercadoPago {
  private client!: MercadoPagoConfig;

  constructor(private apiKey: string) {
    this.initialize();
  }

  private initialize() {
    this.client = new MercadoPagoConfig({
      accessToken: this.apiKey,
      options: { timeout: 5000, idempotencyKey: "abc" },
    });
  }

  public async createPayment(
    body: PaymentCreateRequest
  ): Promise<PaymentResponse> {
    try {
      const payment = new Payment(this.client);

      const requestOptions = {
        idempotencyKey: generateSecureRandomString() + "rewred",
      };

      const paymentResponse: PaymentResponse = await payment.create({
        body,
        requestOptions,
      });

      return paymentResponse;
    } catch (error: any) {
      if (error?.cause) {
        console.error(
          "💥 Mercado Pago API error:",
          JSON.stringify(error.cause, null, 2)
        );
      } else {
        console.error("💥 Erro inesperado:", error);
      }
      throw new Error("❌ Erro ao criar o pagamento via Mercado Pago.");
    }
  }

  public async getPaymentStatus(
    paymentId: string | number
  ): Promise<PaymentResponse> {
    const payment = new Payment(this.client);
    return await payment.get({ id: paymentId });
  }
}
