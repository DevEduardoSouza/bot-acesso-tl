/**
 * Interface que define a estrutura de um administrador
 * Contém informações necessárias para controle de acesso administrativo
 */
export interface IAdmin {
  /** ID único do administrador */
  id: number;
  /** Nome do administrador */
  name: string;
  /** Username do Telegram */
  username?: string;
  /** Data de criação do registro */
  createdAt: Date;
  /** Nível de permissão (admin, super_admin) */
  role: "admin" | "super_admin";
  /** Status do administrador */
  status: "active" | "inactive";
}
