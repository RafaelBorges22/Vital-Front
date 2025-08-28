<template>
  <div class="driver-info-container" v-if="driver">
    <div class="header">
      <h1>Meus Dados</h1>
    </div>
    <div class="driver-details">
      <p><strong>ID:</strong> {{ driver.id || driver._id }}</p>
      <p><strong>Nome:</strong> {{ driver.name }}</p>
      <p><strong>CNH:</strong> {{ driver.cnh || '-' }}</p>
      <p><strong>Placa do veiculo:</strong> {{ driver.vehicle_plate || '-' }}</p>
    </div>
  </div>
  <div v-else class="loading">
    Carregando dados do motorista...
  </div>
</template>

<script>
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      driver: null
    };
  },
  async mounted() {
    const token = localStorage.getItem('access_token');
    const driverId = localStorage.getItem('user_id');
    
    if (!token || !driverId) {
      this.$router.push({ name: 'login-motorista' }); 
      return;
    }
    
    try {
      const res = await axios.get(`${API_URL}/drivers/${driverId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.driver = res.data.data || res.data.driver || res.data;
    } catch (e) {
      this.driver = null;
      console.error("Erro ao buscar dados do motorista:", e);
    }
  },
};
</script>

<style>
.driver-info-container {
  max-width: 500px;
  margin: 40px auto;
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.header {
  text-align: center;
  margin-bottom: 24px;
}
.driver-details p {
  margin: 12px 0;
  font-size: 1.1em;
}
.loading {
  text-align: center;
  margin-top: 60px;
  font-size: 1.2em;
}
</style>