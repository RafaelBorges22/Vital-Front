<template>
  <div class="client-home-container">
    <ClientSidebar @navigate="navigateTo" />
    <div class="client-content">
      <h1>Bem-vindo, {{ clientName }}!</h1>
      <p>
        Pronto para contribuir com o meio ambiente? <br>
        Faça agora uma solicitação de coleta de óleo usado e ajude a transformar resíduos em sustentabilidade!
      </p>
      <button class="btn-request" @click="navigateTo('/solicitacao-coleta')">
        Solicitar Coleta de Óleo
      </button>
      <router-view />
    </div>
  </div>
</template>

<script setup>
import ClientSidebar from '@/components/Clients/Sidebar.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const clientName = ref('Cliente')

function navigateTo(route) {
  router.push(route)
}

onMounted(() => {
  const storedName = localStorage.getItem('user_name')
  if (storedName) {
    clientName.value = storedName
  }
})
</script>

<style scoped>
.client-home-container {
  display: flex;
  min-height: 100vh;
  background: #f4ffec;
}

.client-content {
  flex: 1;
  padding: 48px 40px;
  background: #fff;
  border-radius: 0 18px 18px 0;
  margin: 32px 32px 32px 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}

.client-content h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  color: #6BB200;
  margin-bottom: 12px;
}

.client-content p {
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 32px;
}

.btn-request {
  background: #6BB200;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-family: 'Poppins', sans-serif;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-request:hover {
  background: #558c00;
}
</style>