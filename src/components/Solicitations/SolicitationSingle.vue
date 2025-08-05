<template>
  <div class="solicitation-single-container" v-if="solicitation">
    <div class="header">
      <div class="back-icon" @click="goBack()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Detalhes da Solicitação</h1>
    </div>
    <div class="details">
      <p><strong>ID:</strong> {{ solicitation.id || solicitation._id }}</p>
      <p><strong>Nome do Cliente:</strong> {{ solicitation.client_name || '-' }}</p>
      <p><strong>Status:</strong> {{ solicitation.status || '-' }}</p>
      <p><strong>Data da Solicitação:</strong> {{ formatDate(solicitation.date_solicitation) }}</p>
      <p><strong>Data da Coleta:</strong> {{ formatDate(solicitation.date_collected) }}</p>
    </div>
  </div>
  <div v-else class="loading">
    Carregando solicitação...
  </div>
</template>

<script>
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      solicitation: null,
    };
  },
  mounted() {
    this.fetchSolicitation();
  },
  methods: {
    async fetchSolicitation() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(`${API_URL}/solicitations/${id}`);
        this.solicitation = res.data.data || res.data.solicitation || res.data || {};
      } catch (e) {
        this.solicitation = null;
        if (this.$toast?.error) this.$toast.error('Erro ao buscar solicitação.');
      }
    },
    formatDate(dateString) {
      if (!dateString) return '-';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return dateString;
      }
    },
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.solicitation-single-container {
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.details p {
  margin: 12px 0;
  font-size: 1.1em;
}
.loading {
  text-align: center;
  margin-top: 60px;
  font-size: 1.2em;
}
</style>
