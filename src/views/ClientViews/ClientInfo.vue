<template>
  <div class="client-info-container" v-if="client">
    <div class="header">
      <h1>Meus Dados</h1>
    </div>
    <div class="client-details">
      <p><strong>ID:</strong> {{ client.id || client._id }}</p>
      <p><strong>Nome:</strong> {{ client.name }}</p>
      <p><strong>Email:</strong> {{ client.email }}</p>
      <p><strong>CNPJ:</strong> {{ client.cnpj || '-' }}</p>
      <p><strong>Endereço:</strong> {{ client.address || '-' }}</p>
      <p><strong>Data de Abertura:</strong> {{ formatDate(client.opening_date) }}</p>
      <p><strong>Método de Pagamento:</strong> {{ client.payment_method || '-' }}</p>
    </div>
  </div>
  <div v-else class="loading">
    Carregando dados do cliente...
  </div>
</template>

<script>
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      client: null
    };
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const clientId = localStorage.getItem('client_id');
    if (!token || !clientId) {
      this.$router.push({ name: 'login' });
      return;
    }
    try {
      const res = await axios.get(`${API_URL}/clients/${clientId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.client = res.data.data || res.data.client || res.data;
    } catch (e) {
      this.client = null;
      if (this.$toast?.error) this.$toast.error('Erro ao buscar dados do cliente.');
    }
  },
  methods: {
    formatDate(dateString) {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return dateString;
      }
    }
  }
};
</script>

<style>
.client-info-container {
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
.client-details p {
  margin: 12px 0;
  font-size: 1.1em;
}
.loading {
  text-align: center;
  margin-top: 60px;
  font-size: 1.2em;
}
</style>