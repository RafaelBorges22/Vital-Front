<template>
  <div class="solicitation-single-container" v-if="solicitation">
    <div class="header">
      <div class="back-icon" @click="goBack()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Editar Solicitação</h1>
    </div>
    <form @submit.prevent="updateSolicitation">
      <div class="details">
        <p><strong>ID:</strong> {{ solicitation.id || solicitation._id }}</p>
        <p><strong>Nome do Cliente:</strong> {{ solicitation.client_name || '-' }}</p>
        <label>
          <strong>Status:</strong>
          <select v-model="form.status">
            <option value="PENDENTE">Pendente</option>
            <option value="APROVADO">Aprovada</option>
            <option value="REJEITADO">Rejeitada</option>
          </select>
        </label>
        <label>
          <strong>Motorista:</strong>
          <select v-model="form.driver_id">
            <option :value=null>Nenhum</option>
            <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
              {{ driver.name }}
            </option>
          </select>
        </label>
        <p><strong>Data da Solicitação:</strong> {{ formatDate(solicitation.date_solicitation) }}</p>
        <p><strong>Data da Coleta:</strong> {{ formatDate(solicitation.date_collected) }}</p>
      </div>
      <button type="submit" class="btn-salvar">Confirmar Coleta</button>
    </form>
  </div>
  <div v-else class="loading">
    Carregando solicitação...
  </div>
  <CollectedConfirmed ref="notification" :message="notification.message" :type="notification.type" />
</template>

<script>
import axios from 'axios';
import CollectedConfirmed from '@/views/notifications/CollectedConfirmed.vue';
const API_URL = import.meta.env.VITE_API_URL;

export default {
  components: {
    CollectedConfirmed
  },
  data() {
    return {
      solicitation: null,
      drivers: [], 
      form: {
        status: '',
        driver_id: null 
      },
      notification: {
        message: '',
        type: 'success' 
      }
    };
  },
  mounted() {
    this.fetchSolicitation();
    this.fetchDrivers(); 
  },
  methods: {
    async fetchSolicitation() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(`${API_URL}/solicitations/${id}`);
        const data = res.data.data || res.data.solicitation || res.data || {};
        this.solicitation = data;
        this.form.status = data.status || 'PENDENTE';
        this.form.driver_id = data.driver_id || null;
      } catch (e) {
        this.solicitation = null;
        if (this.$toast?.error) this.$toast.error('Erro ao buscar solicitação.');
      }
    },
    async fetchDrivers() {
      try {
        const res = await axios.get(`${API_URL}/drivers/`);
        this.drivers = res.data.drivers;
      } catch (e) {
        if (this.$toast?.error) this.$toast.error('Erro ao buscar motoristas.');
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
    },
    async updateSolicitation() {
      const id = this.solicitation.id || this.solicitation._id;
      try {
        await axios.put(`${API_URL}/solicitations/${id}`, {
          status: this.form.status,
          driver_id: this.form.driver_id 
        });
        this.notification.message = 'Solicitação atualizada com sucesso!';
        this.notification.type = 'success';
        this.$refs.notification.showNotification();
        this.fetchSolicitation();
      } catch (e) {
        const errorMessage = e.response && e.response.data.error ? e.response.data.error : 'Erro ao atualizar solicitação.';
        
        this.notification.message = errorMessage;
        this.notification.type = 'error';
        this.$refs.notification.showNotification();      }
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
.details p, .details label {
  margin: 12px 0;
  font-size: 1.1em;
  display: block;
}
.details label select,
.details label input {
  margin-top: 6px;
  padding: 6px;
  font-size: 1em;
  width: 100%;
  box-sizing: border-box;
}
.btn-salvar {
  margin-top: 24px;
  padding: 10px 24px;
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1.1em;
  cursor: pointer;
}
.btn-salvar:hover {
  background: #0056b3;
}
.loading {
  text-align: center;
  margin-top: 60px;
  font-size: 1.2em;
}
</style>