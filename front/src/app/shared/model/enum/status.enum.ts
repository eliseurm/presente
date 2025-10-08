export const StatusEnum = {
  ATIVO: { key: 'ATIVO', descricao: 'Ativo' },
  PAUSADO: { key: 'PAUSADO', descricao: 'Pausado' },
  ENCERRADO: { key: 'ENCERRADO', descricao: 'Encerrado' }
} as const;

export type StatusEnum = typeof StatusEnum[keyof typeof StatusEnum];
