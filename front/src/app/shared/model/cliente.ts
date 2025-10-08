export interface Cliente {
  id?: number;
  nome: string;
  email?: string;
  telefone?: string;
  usuario?: UsuarioRef | number | null;
  anotacoes?: string;
}

export interface UsuarioRef {
  id: number;
  username?: string;
}
