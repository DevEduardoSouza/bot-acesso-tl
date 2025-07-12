import { IProduct } from "@/types/IProduct";
import { TelegramTransactionDB } from "@/db/dbTelegramSales";

/**
 * Serviço responsável por gerenciar produtos digitais
 * Inclui validações, formatação e operações CRUD
 */
export class ProductService {
  private db: TelegramTransactionDB;

  constructor() {
    this.db = new TelegramTransactionDB();
  }

  /**
   * Adiciona um novo produto ao catálogo
   * @param productData - Dados do produto
   * @param adminId - ID do administrador que está criando
   */
  public async addProduct(
    productData: Omit<IProduct, "id" | "createdAt" | "updatedAt" | "createdBy">,
    adminId: number
  ): Promise<string> {
    // Validações básicas
    if (!productData.name || productData.name.trim().length < 3) {
      throw new Error("❌ Nome do produto deve ter pelo menos 3 caracteres");
    }

    if (
      !productData.description ||
      productData.description.trim().length < 10
    ) {
      throw new Error(
        "❌ Descrição do produto deve ter pelo menos 10 caracteres"
      );
    }

    if (productData.price <= 0) {
      throw new Error("❌ Preço deve ser maior que zero");
    }

    if (
      !productData.downloadLink ||
      !this.isValidUrl(productData.downloadLink)
    ) {
      throw new Error("❌ Link de download deve ser uma URL válida");
    }

    if (!this.isValidProductType(productData.type)) {
      throw new Error("❌ Tipo de produto inválido");
    }

    const product: Omit<IProduct, "id" | "createdAt" | "updatedAt"> = {
      ...productData,
      createdBy: adminId,
      status: "active",
    };

    return await this.db.addProduct(product);
  }

  /**
   * Remove um produto do catálogo
   * @param productId - ID do produto
   * @param adminId - ID do administrador
   */
  public async deleteProduct(
    productId: string,
    adminId: number
  ): Promise<boolean> {
    const product = this.db.getProductById(productId);
    if (!product) {
      throw new Error("❌ Produto não encontrado");
    }

    // Verifica se o administrador tem permissão (pode ser o criador ou super admin)
    if (product.createdBy !== adminId) {
      const isSuperAdmin = await this.isSuperAdmin(adminId);
      if (!isSuperAdmin) {
        throw new Error("❌ Você não tem permissão para remover este produto");
      }
    }

    return await this.db.deleteProduct(productId);
  }

  /**
   * Obtém todos os produtos ativos formatados para exibição
   */
  public getActiveProducts(): IProduct[] {
    return this.db.getAllActiveProducts();
  }

  /**
   * Obtém um produto específico
   * @param productId - ID do produto
   */
  public getProduct(productId: string): IProduct | null {
    return this.db.getProductById(productId);
  }

  /**
   * Atualiza um produto existente
   * @param productId - ID do produto
   * @param updates - Campos a serem atualizados
   * @param adminId - ID do administrador
   */
  public async updateProduct(
    productId: string,
    updates: Partial<IProduct>,
    adminId: number
  ): Promise<boolean> {
    const product = this.db.getProductById(productId);
    if (!product) {
      throw new Error("❌ Produto não encontrado");
    }

    // Verifica permissões
    if (product.createdBy !== adminId) {
      const isSuperAdmin = await this.isSuperAdmin(adminId);
      if (!isSuperAdmin) {
        throw new Error("❌ Você não tem permissão para editar este produto");
      }
    }

    // Validações para campos atualizados
    if (updates.name && updates.name.trim().length < 3) {
      throw new Error("❌ Nome do produto deve ter pelo menos 3 caracteres");
    }

    if (updates.description && updates.description.trim().length < 10) {
      throw new Error(
        "❌ Descrição do produto deve ter pelo menos 10 caracteres"
      );
    }

    if (updates.price && updates.price <= 0) {
      throw new Error("❌ Preço deve ser maior que zero");
    }

    if (updates.downloadLink && !this.isValidUrl(updates.downloadLink)) {
      throw new Error("❌ Link de download deve ser uma URL válida");
    }

    if (updates.type && !this.isValidProductType(updates.type)) {
      throw new Error("❌ Tipo de produto inválido");
    }

    return await this.db.updateProduct(productId, updates);
  }

  /**
   * Formata o preço para exibição (converte centavos para reais)
   * @param priceInCents - Preço em centavos
   */
  public formatPrice(priceInCents: number): string {
    const priceInReais = priceInCents / 100;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(priceInReais);
  }

  /**
   * Formata a descrição do produto para exibição no Telegram
   * @param product - Produto a ser formatado
   */
  public formatProductForDisplay(product: IProduct): string {
    const price = this.formatPrice(product.price);
    const type = this.getProductTypeLabel(product.type);

    return `📦 *${product.name}*
    
📝 *Descrição:* ${product.description}

💰 *Preço:* ${price}
📂 *Tipo:* ${type}
🆔 *ID:* \`${product.id}\``;
  }

  /**
   * Formata lista de produtos para exibição
   * @param products - Lista de produtos
   */
  public formatProductsList(products: IProduct[]): string {
    if (products.length === 0) {
      return "📦 *Nenhum produto disponível no momento.*";
    }

    let message = "🛍️ *Catálogo de Produtos:*\n\n";

    products.forEach((product, index) => {
      const price = this.formatPrice(product.price);
      const type = this.getProductTypeLabel(product.type);

      message += `${index + 1}. *${product.name}*\n`;
      message += `   💰 ${price} | 📂 ${type}\n`;
      message += `   📝 ${product.description.substring(0, 50)}${
        product.description.length > 50 ? "..." : ""
      }\n\n`;
    });

    return message;
  }

  /**
   * Obtém o label do tipo de produto
   * @param type - Tipo do produto
   */
  private getProductTypeLabel(type: IProduct["type"]): string {
    const labels = {
      ebook: "📚 E-book",
      curso: "🎓 Curso",
      software: "💻 Software",
      template: "📋 Template",
      outro: "📦 Outro",
    };
    return labels[type] || "📦 Outro";
  }

  /**
   * Valida se uma URL é válida
   * @param url - URL a ser validada
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Valida se o tipo de produto é válido
   * @param type - Tipo a ser validado
   */
  private isValidProductType(type: string): type is IProduct["type"] {
    return ["ebook", "curso", "software", "template", "outro"].includes(type);
  }

  /**
   * Verifica se um usuário é super administrador
   * @param adminId - ID do administrador
   */
  private async isSuperAdmin(adminId: number): Promise<boolean> {
    const admins = this.db.getAllAdmins();
    const admin = admins.find((a) => a.id === adminId);
    return admin?.role === "super_admin";
  }
}
