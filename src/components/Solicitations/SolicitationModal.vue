<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>Nova Solicitação</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea v-model="form.description" id="description" required></textarea>
        </div>
        <div class="form-group">
          <label for="date_collected">Data de Coleta</label>
          <input
            v-model="form.date_collected"
            id="date_collected"
            type="datetime-local"
            required
          />
        </div>
        <div class="modal-actions">
          <button type="button" @click="$emit('close')">Cancelar</button>
          <button type="submit">Criar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  name: 'SolicitationModal',
  props: {
    visible: Boolean
  },
  data() {
    return {
      form: {
        client_id: '', 
        status: '',
        description: '',
        date_collected: ''
      },
      clientId: null
    };
  },
  mounted() {
    this.getClientIdFromJWT();
  },
  methods: {
    getClientIdFromJWT() {
        const clientId = localStorage.getItem('client_id');
        if (clientId) {
            this.clientId = clientId;
            this.form.client_id = clientId;
        }
    },
async submitForm() {
    try {
        if (!this.clientId) {
            console.error('Erro: ID do cliente não encontrado. Verifique seu token de autenticação.');
            this.$emit('error', 'ID do cliente não encontrado.');
            return; // Interrompe a função
        }

        const payload = {
            client_id: this.clientId, 
            status: this.form.status,
            description: this.form.description,
            date_collected: this.form.date_collected
        };

        const response = await axios.post(`${API_URL}/solicitations/`, payload);

        this.$emit('confirm', response.data);
        this.$emit('close');
    } catch (e) {
        console.error('Erro ao criar solicitação:', e);
        this.$emit('error', e.message); 
    }
}
  }
};
</script>
<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  width: 100%;
  max-width: 420px;
}
.form-group {
  margin-bottom: 18px;
}
.form-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d2d2d2;
  border-radius: 4px;
  font-size: 14px;
  }
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 18px;
}
</style>