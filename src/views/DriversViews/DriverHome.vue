<template>
  <div class="driver-home-container">
    <Sidebar @navigate="navigateTo" />
    <div class="driver-content">
      <h1>Bem-vindo, {{ driverName }}!</h1>
      <p>Selecione uma opção no menu ao lado para começar.</p>
      <SolicitationTable />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Driver/Sidebar.vue'
import SolicitationTable from '@/components/Driver/SolicitationsDriver.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const driverName = ref('Motorista')

function navigateTo(route) {
  router.push(route)
}

onMounted(() => {
  const storedName = localStorage.getItem('user_name')
  if (storedName) {
    driverName.value = storedName
  }
})
</script>

<style scoped>
.driver-home-container {
  display: flex;
  min-height: 100vh;
  background: #f4ffec;
}

.driver-content {
  flex: 1;
  padding: 48px 40px;
  background: #fff;
  border-radius: 0 18px 18px 0;
  margin: 32px 32px 32px 0;
  box-shadow: 0 8px 32px rgba(0,0,0,0.08);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.driver-content h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  color: #6BB200;
  margin-bottom: 12px;
}

.driver-content p {
  color: #333;
  font-size: 1.1rem;
}
</style>