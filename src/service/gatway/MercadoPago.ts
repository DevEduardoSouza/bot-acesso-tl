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
        idempotencyKey: generateSecureRandomString(),
      };

      const paymentResponse: PaymentResponse = await payment.create({
        body,
        requestOptions,
      });

      return paymentResponse;
    } catch (error) {
      console.error(error);
      throw new Error("Error al crear el pago");
    }
  }
}
