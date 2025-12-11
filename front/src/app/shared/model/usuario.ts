import type { PapelEnum } from '@/shared/model/enum/papel.enum';
import type { StatusEnum } from '@/shared/model/enum/status.enum';

export class Usuario {

  id?: number;
  username?: string;
  passwordHash?: string; // não editar via CRUD
  senha?: string; // campo transitório para envio da nova senha
  papel?: PapelEnum | null;
  status?: StatusEnum | null;

}
