<template>
  <div class="cadastro-container">
    <button class="back-button" @click="voltar">
      <svg class="back-icon" viewBox="0 0 24 24">
        <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
      </svg>
    </button>

    <div class="form-container">
      <h1 class="title">Cadastro de Clientes</h1>

      <form @submit.prevent="criarConta" style="width: 100%;">
        <div class="input-group">
          <label for="empresa-nome">Nome da empresa</label>
          <input id="empresa-nome" type="text" placeholder="Nome da empresa" v-model="empresa.name" required />
        </div>

        <div class="input-group">
          <label for="empresa-email">Email</label>
          <input id="empresa-email" type="email" placeholder="Email da empresa" v-model="empresa.email" required />
        </div>

        <div class="input-group password-input">
          <label for="empresa-senha">Senha</label>
          <input
            id="empresa-senha"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Senha"
            v-model="empresa.password"
            required
          />
          <button class="toggle-password" @click.prevent="togglePassword" tabindex="-1" type="button">
            <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 1l22 22" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M17.94 17.94C16.13 19.13 14.13 20 12 20c-5 0-9.27-3.11-11-7.5a11.89 11.89 0 0 1 4.15-5.26" />
              <path d="M9.53 9.53A3 3 0 0 0 12 15c.5 0 .97-.12 1.38-.34"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8S2 12 2 12z"/>
            </svg>
          </button>
        </div>

        <div class="input-group">
          <label for="empresa-pagamento">Tipo de pagamento</label>
          <select id="empresa-pagamento" v-model="empresa.payment_method" required>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">PIX</option>
            <option value="produto">Produto</option>
          </select>
        </div>

        <div class="input-group">
          <label for="empresa-cnpj">CNPJ</label>
          <input id="empresa-cnpj" type="text" placeholder="CNPJ válido da empresa" v-model="empresa.cnpj" required />
        </div>

        <div class="input-group">
          <label for="empresa-data">Data de abertura da empresa</label>
          <input id="empresa-data" type="text" placeholder="DD/MM/AAAA" v-model="empresa.opening_date" required />
        </div>

        <div class="input-group">
          <label for="empresa-endereco">Endereço</label>
          <input id="empresa-endereco" type="text" placeholder="Endereço da empresa" v-model="empresa.address" required />
        </div>

        <div class="terms-checkbox">
          <input type="checkbox" id="terms" v-model="aceitouTermos" class="custom-checkbox">
          <label for="terms">Aceito os termos e as políticas de privacidade</label>
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <div class="actions">
          <button type="submit" class="create-account-button" :disabled="loading">
            {{ loading ? 'Carregando...' : 'Criar conta' }}
          </button>
        </div>
      </form>

      <div class="login-link">
        <span>Já tem uma conta?</span>
        <router-link to="/login">Fazer login</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import '@/css/Cadastro.css';

export default {
  name: 'CadastroView',
  data() {
    return {
      showPassword: false,
      aceitouTermos: false,
      empresa: {
        name: '',  
        email: '',
        password: '',  
        payment_method: 'dinheiro', 
        cnpj: '',
        opening_date: '',  
        address: ''  
      },
      loading: false,
      error: null
    }
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async criarConta() {
      if (!this.aceitouTermos) {
        this.error = 'Você deve aceitar os termos de uso';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        if (!this.empresa.opening_date) {
          throw new Error('Data de abertura é obrigatória');
        }

        const dadosParaEnviar = {
          ...this.empresa,
          opening_date: this.formatarData(this.empresa.opening_date)
        };

        const response = await axios.post(`${API_URL}/clients/`, dadosParaEnviar, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Cadastro realizado com sucesso:', response.data);
        this.$router.push('/dashboard-client'); 
      } catch (error) {
        console.error('Erro no cadastro:', error);
        if (error.response) {
          if (error.response.status === 400) {
            this.error = error.response.data.error || 'Dados inválidos. Verifique os campos.';
          }
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Erro ao conectar com o servidor';
        }
      } finally {
        this.loading = false;
      }
    },
    formatarData(data) {
      if (!data) return '';
      const [dd, mm, yyyy] = data.split('/');
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    },
    voltar() {
      this.$router.go(-1)
    }
  }
}
</script>


<style scoped>
@import '@/css/Cadastro.css';
</style>