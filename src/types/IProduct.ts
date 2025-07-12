/**
 * Interface que define a estrutura de um produto digital
 * Contém todas as informações necessárias para exibição e venda
 */
export interface IProduct {
  /** ID único do produto */
  id: string;
  /** Nome do produto para exibição */
  name: string;
  /** Descrição detalhada do produto */
  description: string;
  /** Preço em centavos (para evitar problemas de precisão com float) */
  price: number;
  /** Link de download ou acesso ao produto digital */
  downloadLink: string;
  /** Tipo de produto (ebook, curso, software, etc.) */
  type: "ebook" | "curso" | "software" | "template" | "outro";
  /** Status do produto (ativo/inativo) */
  status: "active" | "inactive";
  /** Data de criação do produto */
  createdAt: Date;
  /** Data da última atualização */
  updatedAt: Date;
  /** ID do administrador que criou o produto */
  createdBy: number;
}
