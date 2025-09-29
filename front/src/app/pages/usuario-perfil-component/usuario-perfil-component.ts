import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '@/pages/auth/auth-service';

@Component({
  selector: 'usuario-perfil',
  imports: [CommonModule, FormsModule, PasswordModule, InputTextModule, ButtonModule],
  templateUrl: './usuario-perfil-component.html',
  styleUrl: './usuario-perfil-component.scss'
})
export class UsuarioPerfilComponent {

    auth = inject(AuthService);

    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
    loading = false;
    error = '';
    success = '';

    async submit() {
        this.error = '';
        this.success = '';

        if (!this.currentPassword || !this.newPassword) {
            this.error = 'Preencha as senhas.';
            return;
        }
        if (this.newPassword !== this.confirmPassword) {
            this.error = 'A confirmação da senha não confere.';
            return;
        }
        if (this.newPassword.length < 6) {
            this.error = 'A nova senha deve ter ao menos 6 caracteres.';
            return;
        }

        this.loading = true;
        const res = await this.auth.changePassword(this.currentPassword, this.newPassword);
        this.loading = false;

        if (!res.isOk) {
            this.error = res.message || 'Erro ao alterar a senha.';
            return;
        }
        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.success = 'Senha alterada com sucesso.';
    }
}
