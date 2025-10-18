<template>
  <div class="modal-overlay" v-if="solicitation">
    <div class="modal-content solicitation-single-container">
      <div class="header">
        <div class="back-icon" @click="goBack()" style="cursor:pointer;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <h2 class="modal-title">Detalhes da Solicitação #{{ solicitation.id || solicitation._id }}</h2>
      </div>
      <form @submit.prevent="updateSolicitation">
        <div class="details">
          <p><strong>Nome do Cliente:</strong> {{ solicitation.client_name || '-' }}</p>
          <p><strong>Data de Solicitação:</strong> {{ formatDateTime(solicitation.date_solicitation) }}</p>
          <p><strong>Data de Coleta Desejada:</strong> {{ formatDateTime(solicitation.date_collected) }}</p>
          <p><strong>Forma de Pagamento:</strong> {{ solicitation.payment_method || '-' }}</p>
          <p><strong>Descrição:</strong> {{ solicitation.description || '-' }}</p>

          <hr/>
          
          <h3>Logística e Quantidades</h3>

          <div class="form-group-row">
            <div class="form-group">
                <label for="surplus">Excedente (Surplus)</label>
                <input v-model.number="form.surplus" id="surplus" type="number" class="form-input-refined">
            </div>
            <div class="form-group">
                <label for="loaded">Carregado (Loaded)</label>
                <input v-model.number="form.loaded" id="loaded" type="number" class="form-input-refined">
            </div>
          </div>
          <div class="form-group-row">
            <div class="form-group">
                <label for="total">Total Estimado</label>
                <input v-model.number="form.total" id="total" type="number" class="form-input-refined">
            </div>
            <div class="form-group">
                <label for="delivered">Entregue (Delivered)</label>
                <input v-model.number="form.delivered" id="delivered" type="number" class="form-input-refined">
            </div>
          </div>
          <div class="form-group-row">
            <div class="form-group">
                <label for="surplus2">Segundo Excedente (Surplus2)</label>
                <input v-model.number="form.surplus2" id="surplus2" type="number" class="form-input-refined">
            </div>
            <div class="form-group">
                <label for="difference" class="checkbox-label">
                    <input type="checkbox" v-model="form.difference" id="difference">
                    Houve Diferença?
                </label>
            </div>
          </div>

          <div class="form-group">
            <label for="notes">Notas do Admin/Motorista</label>
            <textarea v-model="form.notes" id="notes" class="form-textarea-refined"></textarea>
          </div>
          
          <hr/>

          <div class="form-group-row">
              <label>
                <strong>Status:</strong>
                <select v-model="form.status">
                  <option value="PENDENTE">Pendente</option>
                  <option value="APROVADO">Aprovada</option>
                  <option value="REJEITADO">Rejeitada</option>
                  <option value="COLETADO">Coletado</option>
                  </select>
              </label>

              <label>
                <strong>Motorista:</strong>
                <select v-model="form.driver_id">
                  <option :value="null">Nenhum</option>
                  <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                    {{ driver.name }}
                  </option>
                </select>
              </label>
          </div>
          
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn-confirm">Atualizar Solicitação</button>
        </div>
      </form>
    </div>
  </div>
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
        driver_id: null,
        driver_name: '',
        surplus: 0,
        loaded: 0,
        total: 0,
        delivered: 0,
        surplus2: 0,
        notes: '',
        difference: false,
        description: '',
        date_collected: '',
        payment_method: '',
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
    formatDateForInput(dateString) {
      if (!dateString) return '';

      return dateString.substring(0, 16); 
    },

    async fetchSolicitation() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(`${API_URL}/solicitations/${id}`);
        const data = res.data.data || res.data.solicitation || res.data || {};
        this.solicitation = data;
        this.form.status = data.status || 'PENDENTE';
        this.form.driver_id = data.driver_id || null;
        this.form.driver_name = data.driver_name || '';
        
        this.form.surplus = data.surplus || 0;
        this.form.loaded = data.loaded || 0;
        this.form.total = data.total || 0;
        this.form.delivered = data.delivered || 0;
        this.form.surplus2 = data.surplus2 || 0;
        this.form.notes = data.notes || '';
        this.form.difference = data.difference || false;
        
        this.form.description = data.description || '';
        this.form.payment_method = data.payment_method || '';
        this.form.date_collected = this.formatDateForInput(data.date_collected);

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
    formatDateTime(dateString) {
        if (!dateString) return '-';
        try {
            const date = new Date(dateString);
            return date.toLocaleTimeString('pt-BR', { 
                day: '2-digit', 
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit', 
                minute: '2-digit'
            }).replace(',', ' às'); 
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
        const payload = {
            status: this.form.status,
            driver_id: this.form.driver_id || null, 
            driver_name: this.form.driver_name || '',
            surplus: parseInt(this.form.surplus) || 0,
            loaded: parseInt(this.form.loaded) || 0,
            total: parseInt(this.form.total) || 0,
            delivered: parseInt(this.form.delivered) || 0,
            surplus2: parseInt(this.form.surplus2) || 0,
            notes: this.form.notes || null,
            difference: this.form.difference,
            
            description: this.form.description,
            payment_method: this.form.payment_method,
            date_collected: this.form.date_collected,
        };
        
        await axios.put(`${API_URL}/solicitations/${id}`, payload);
        
        this.notification.message = 'Solicitação atualizada com sucesso!';
        this.notification.type = 'success';
        this.fetchSolicitation();
        
      } catch (e) {
        const errorMessage = e.response && e.response.data.error ? e.response.data.error : 'Erro ao atualizar solicitação.';
        
        this.notification.message = errorMessage;
        this.notification.type = 'error';
      }
    }
  }
};
</script>
