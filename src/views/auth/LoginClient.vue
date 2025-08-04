<template>
  <div class="login-container">
    <div class="login-content modal">
      <button class="back-button" @click="voltar">
        <svg class="back-icon" viewBox="0 0 24 24">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
        </svg>
      </button>

      <h1 class="login-title">Login de Clientes</h1>

      <form @submit.prevent="fazerLogin" style="width: 100%;">
        <div class="input-group">
          <label>
            Email
            <input 
              type="email" 
              placeholder="Digite seu email" 
              v-model="credenciais.email"
              :disabled="loading"
              required
            />
          </label>
        </div>

        <div class="input-group password-input">
          <label>
            Senha
            <div style="position: relative;">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="Digite sua senha" 
                v-model="credenciais.senha"
                :disabled="loading"
                required
                style="padding-right: 40px;"
              />
              <button 
                class="toggle-password" 
                @click.prevent="togglePassword"
                :disabled="loading"
                tabindex="-1"
                type="button"
              >
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
          </label>
        </div>

        <div v-if="errorMessage" class="error-message" style="margin-bottom: 1rem;">
          {{ errorMessage }}
        </div>

        <router-link 
          to="/recuperar-senha" 
          class="forgot-password"
          :class="{ 'disabled-link': loading }"
        >
          Esqueceu a senha?
        </router-link>

        <div class="actions">
          <button 
            type="submit"
            class="login-button"
            :disabled="loading"
          >
            <span class="login-button-text">{{ loading ? 'Carregando...' : 'Fazer Login' }}</span>
          </button>
        </div>
      </form>

      <div class="register-link" style="margin-top: 1.5rem;">
        <span>Não tem conta?</span>
        <router-link 
          to="/cadastro"
          :class="{ 'disabled-link': loading }"
        >
          Criar conta
        </router-link>
      </div>
    </div>
  </div>
  </template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import '@/css/Login.css'
import axios from '@/utils/axios.js' 
import { jwtDecode } from 'jwt-decode';

const credenciais = reactive({
  email: '',
  senha: ''
})

const showPassword = ref(false)
const loading = ref(false)
const errorMessage = ref('')
const router = useRouter()

function togglePassword() {
  showPassword.value = !showPassword.value
}

function voltar() {
  router.back()
}

async function fazerLogin() {
  if (!credenciais.email || !credenciais.senha) {
    errorMessage.value = 'Preencha todos os campos!'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    const response = await axios.post('/clients/login', { 
      email: credenciais.email,
      password: credenciais.senha
    })

    const data = response.data
    
   const decodedToken = jwtDecode(data.access_token);
    
    localStorage.setItem('token', data.access_token); 
    localStorage.setItem('client_id', decodedToken.id);


    console.log('Login bem-sucedido! Token JWT do Cliente:', data.access_token);
    console.log('Dados decodificados do Token:', decodedToken);    
    router.push('/dashboard-client') 

  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      errorMessage.value = error.response.data.error;
    } else {
      errorMessage.value = 'Erro ao fazer login. Verifique sua conexão ou credenciais.';
    }
    console.error('Erro de login:', error);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
@import '@/css/Login.css'
</style>