import "dotenv/config";
import { MercadoPago } from "./service/gatway/MercadoPago";

async function main() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;

  if (!token) {
    throw new Error(
      "❌ Token de acesso do Mercado Pago não encontrado no .env"
    );
  }

  const mp = new MercadoPago(token);

  const body = {
    transaction_amount: 100,
    payment_method_id: "pix",
    description: "Pagamento de teste PIX",
    payer: {
      email: "comprador-teste@email.com",
      first_name: "João",
      last_name: "Silva",
      identification: {
        type: "CPF",
        number: "123456789",
      },
    },
  };

  try {
    const response = await mp.createPayment(body);
    console.log("✅ Pagamento criado com sucesso:");
    console.log("ID:", response.id);
    console.log("Status:", response.status);
    console.log("Detalhes:", response.point_of_interaction?.transaction_data);
  } catch (error) {
    console.error("❌ Erro ao criar o pagamento:", error);
  }
}

main();
