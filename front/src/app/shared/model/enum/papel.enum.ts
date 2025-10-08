export const PapelEnum = {
  ADMINISTRADOR: { key: 'ADMINISTRADOR', descricao: 'Administrador' },
  CLIENTE: { key: 'CLIENTE', descricao: 'Cliente' },
  USUARIO: { key: 'USUARIO', descricao: 'Usuário' }
} as const;

export type PapelEnum = typeof PapelEnum[keyof typeof PapelEnum];
