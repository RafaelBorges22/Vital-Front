<template>
  <div class="admin-home-container">
    <AdminSidebar @navigate="navigateTo" />
    <div class="admin-content">
      <h1>Bem-vindo, {{ adminName }}!</h1>
      <p>Selecione uma opção no menu ao lado para começar.</p>
      <AdminsTable v-if="adminLevel == 'Master'" />
      <ClientList v-else />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import AdminSidebar from '@/components/Admin/Sidebar.vue'
import AdminsTable from '@/components/Admin/AdminsTable.vue'
import ClientList from '@/components/Clients/ClientsTable.vue'
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const adminName = ref('Administrador')
const adminLevel = ref('')

function navigateTo(route) {
  router.push(route)
}

onMounted(() => {
  const storedName = localStorage.getItem('user_name')
  if (storedName) {
    adminName.value = storedName
  }
  const storedLevel = localStorage.getItem('user_level')
  if (storedLevel) {
    adminLevel.value = storedLevel
  }
})
</script>

<style scoped>
.admin-home-container {
  display: flex;
  min-height: 100vh;
  background: #f4ffec;
}

.admin-content {
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

.admin-content h1 {
  font-family: 'Poppins', sans-serif;
  font-size: 2rem;
  color: #6BB200;
  margin-bottom: 12px;
}

.admin-content p {
  color: #333;
  font-size: 1.1rem;
}
</style>