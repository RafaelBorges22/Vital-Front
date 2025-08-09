<template>
  <div class="modal-overlay" v-if="solicitation">
    <div class="modal-content solicitation-single-container">
      <div class="header">
        <div class="back-icon" @click="goBack()" style="cursor:pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h2 class="modal-title">Editar Solicitação</h2>
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
        <div class="modal-actions">
          <button type="submit" class="btn-confirm">Confirmar Coleta</button>
        </div>
      </form>
    </div>
  </div>
  <div v-else class="loading">
    Carregando solicitação...
  </div>
  <CollectedConfirmed ref="notification" :message="notification.message" :type="notification.type" />
</template>

<script>
import axios from 'axios';
import '@/css/Modal.css';
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

