<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content solicitation-modal-content">
      <h2>Nova Solicitação</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea
            v-model="form.description"
            id="description"
            placeholder="Adicione uma informação que ache importante"
            class="form-textarea-refined"
          ></textarea>
        </div>
        <div class="form-group">
          <label for="date_collected">Data de Coleta</label>
          <input
            v-model="form.date_collected"
            id="date_collected"
            type="datetime-local"
            required
            class="form-input-refined"
          />
        </div>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-confirm">Criar Solicitação</button>
        </div>
      </form>
    </div>
  </div>
</template>


<script>
import axios from 'axios';
import '@/css/Modal.css';

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
            return; 
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
.solicitation-modal-content {
  padding: 32px;
  max-width: 550px;
}

.form-group {
  margin-bottom: 24px;
}

.form-textarea-refined {
  padding: 12px;
  min-height: 120px;
  border-radius: 10px;
  font-size: 16px;
  border: 1px solid #dcdcdc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-textarea-refined:focus {
  outline: none;
  border-color: #6BB200;
  box-shadow: 0 0 0 3px rgba(107, 178, 0, 0.2);
}

.form-input-refined {
  padding: 12px;
  border-radius: 10px;
  font-size: 16px;
  border: 1px solid #dcdcdc;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-input-refined:focus {
  outline: none;
  border-color: #6BB200;
  box-shadow: 0 0 0 3px rgba(107, 178, 0, 0.2);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancel,
.btn-confirm {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

</style>