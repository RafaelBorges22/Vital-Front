<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content solicitation-modal-content">
      <h2 class="modal-title">{{ isEditMode ? 'Editar Solicitação (Admin)' : 'Nova Solicitação de Coleta' }}</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label for="date_collected">Data e Hora de Coleta Desejada</label>
          <input
            v-model="form.date_collected"
            id="date_collected"
            type="datetime-local"
            required
            :min="minDateTime"
            class="form-input-refined"
          />
        </div>

        <div class="form-group">
          <label for="payment_method">Forma de Pagamento</label>
          <select
            v-model="form.payment_method"
            id="payment_method"
            required
            class="form-input-refined"
          >
            <option value="">Selecione...</option>
            <option v-for="method in paymentMethods" :key="method" :value="method">{{ method }}</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="description">Descrição</label>
          <textarea
            v-model="form.description"
            id="description"
            placeholder="Adicione informações que você ache importantes para a coleta."
            class="form-textarea-refined"
          ></textarea>
        </div>


        <template v-if="isEditMode">
          <hr class="divider">
          <h3 class="admin-section-title">Informações Logísticas (Admin)</h3>

          <div class="form-group-row">
            <div class="form-group">
                <label for="status">Status</label>
                <select v-model="form.status" id="status" required class="form-input-refined">
                    <option v-for="status in solicitationStatuses" :key="status" :value="status">{{ status }}</option>
                </select>
            </div>
            <div class="form-group">
                <label for="driver">Motorista Atribuído</label>
                <select v-model.number="form.driver_id" id="driver" class="form-input-refined">
                    <option :value="null">Nenhum Motorista</option>
                    <option v-for="driver in drivers" :key="driver.id" :value="driver.id">
                        {{ driver.name }}
                    </option>
                </select>
            </div>
          </div>
          <div class="form-group-row">
            <div class="form-group">
                <label for="surplus">Excedente 1 (Surplus)</label>
                <input v-model.number="form.surplus" id="surplus" type="number" min="0" class="form-input-refined" placeholder="0">
            </div>
            <div class="form-group">
                <label for="loaded">Carregado (Loaded)</label>
                <input v-model.number="form.loaded" id="loaded" type="number" min="0" class="form-input-refined" placeholder="0">
            </div>
            <div class="form-group">
                <label for="total">Total Estimado</label>
                <input v-model.number="form.total" id="total" type="number" min="0" class="form-input-refined" placeholder="0">
            </div>
          </div>

          <!-- Campos Numéricos (Entregue, Excedente 2) -->
          <div class="form-group-row">
            <div class="form-group">
                <label for="delivered">Entregue (Delivered)</label>
                <input v-model.number="form.delivered" id="delivered" type="number" min="0" class="form-input-refined" placeholder="0">
            </div>
            <div class="form-group">
                <label for="surplus2">Excedente 2 (Surplus2)</label>
                <input v-model.number="form.surplus2" id="surplus2" type="number" min="0" class="form-input-refined" placeholder="0">
            </div>
            <div class="form-group flex items-center pt-8">
                <input v-model="form.difference" id="difference" type="checkbox" class="form-checkbox">
                <label for="difference" class="ml-2 mb-0 cursor-pointer">Houve Divergência?</label>
            </div>
          </div>
          
          <div class="form-group">
            <label for="notes">Notas</label>
            <textarea
              v-model="form.notes"
              id="notes"
              placeholder="Adicione notas internas sobre a coleta/entrega."
              class="number"
            ></textarea>
          </div>
        </template>
        
        <!-- Botões de Ação -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancelar</button>
          <button type="submit" class="btn-confirm">
            {{ isEditMode ? 'Salvar Alterações' : 'Criar Solicitação' }}
          </button>
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
    visible: {
      type: Boolean,
      required: true
    },
    mode: {
        type: String,
        required: true,
        validator: (value) => ['create', 'edit'].includes(value)
    },
    clientId: { 
        type: Number,
        default: null 
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
  },
  data() {
    const paymentMethods = ['DINHEIRO', 'PIX', 'DEBITO', 'CREDITO', 'PRODUTOS']; 
    const solicitationStatuses = ['PENDENTE', 'APROVADO', 'REJEITADO']; 

    return {
      form: this.getDefaultForm(paymentMethods), 
      drivers: [], 
      paymentMethods: paymentMethods,
      solicitationStatuses: solicitationStatuses
    };
  },
  computed: {
    isEditMode() {
        return this.mode === 'edit';
    },
    effectiveClientId() {
        if (this.clientId) {
            return this.clientId;
        }
        const storedId = localStorage.getItem('client_id');
        
        const idFromStorage = storedId ? Number(storedId) : null;
        return isNaN(idFromStorage) ? null : idFromStorage;
    },
    minDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hour}:${minute}`;
    }
  },
  watch: {
    visible(val) {
        if (val) {
            if (this.isEditMode && this.initialData.id) {
                this.loadFormData(this.initialData);
            } else {
                this.resetForm();
            }
            if (this.isEditMode) {
                this.fetchDrivers();
            }
        } else {
            this.resetForm();
        }
    },
    initialData: {
        handler(newVal) {
            if (this.isEditMode && newVal.id) {
                this.loadFormData(newVal);
            }
        },
        deep: true
    }
  },
  methods: {
    getDefaultForm(paymentMethods = this.paymentMethods) {
        const defaultPayment = paymentMethods && paymentMethods.length > 0 ? paymentMethods[0] : '';
        
        return {
            id: null,
            description: '',
            date_collected: '',
            payment_method: defaultPayment, 
            
            surplus: 0, 
            loaded: 0,
            total: 0,
            delivered: 0,
            surplus2: 0,
            notes: 0,
            difference: false,
            status: 'PENDENTE', 
            driver_id: null
        };
    },
    resetForm() {
        this.form = this.getDefaultForm(this.paymentMethods); 
    },
    loadFormData(data) {
        this.form = {
            id: data.id,
            description: data.description || '',
            date_collected: data.date_collected ? data.date_collected.substring(0, 16) : '', 
            payment_method: data.payment_method || (this.paymentMethods[0] || ''),
            
            surplus: data.surplus || 0, 
            loaded: data.loaded || 0,
            total: data.total || 0,
            delivered: data.delivered || 0,
            surplus2: data.surplus2 || 0,
            notes: data.notes || null,
            difference: data.difference || false,
            status: data.status || 'PENDENTE',
            driver_id: data.driver_id || null
        };
    },
    
    async fetchDrivers() {
        try {
            const response = await axios.get(`${API_URL}/drivers`); 
            this.drivers = response.data;
        } catch (e) {
            console.error('Erro ao carregar motoristas:', e);
            this.$emit('error', 'Erro ao carregar lista de motoristas.');
        }
    },

    sanitizePayload(data) {
        const payload = {...data};
        const numericFields = ['surplus', 'loaded', 'total', 'delivered', 'surplus2', 'driver_id'];

        numericFields.forEach(field => {
            if (field === 'driver_id') {
                payload[field] = payload[field] === null || payload[field] === '' ? null : Number(payload[field]);
                if (isNaN(payload[field])) payload[field] = null; 
            } else {
                payload[field] = Number(payload[field]) || 0;
            }
        });

        payload.difference = !!payload.difference;
        payload.notes = payload.notes || null;
        
        return payload;
    },

    async submitForm() {
        try {
            if (!this.form.date_collected || !this.form.payment_method) {
                this.$emit('error', 'Por favor, preencha a data e a forma de pagamento.');
                return;
            }

            let payload = this.sanitizePayload(this.form);
            let url = `${API_URL}/solicitations/`;
            let method = 'POST';

            if (this.isEditMode) {
                if (!payload.id) {
                    this.$emit('error', 'ID da Solicitação ausente para o modo de edição (Admin).');
                    return;
                }
                url += payload.id;
                method = 'PUT';
                payload.client_id = this.initialData.client_id;
                
            } else {
                const finalClientId = this.effectiveClientId;
                if (!finalClientId) {
                    this.$emit('error', 'ID do Cliente não fornecido. Por favor, tente fazer login novamente.');
                    return; 
                }

                payload = {
                    client_id: finalClientId, 
                    description: payload.description,
                    payment_method: payload.payment_method, 
                    date_collected: payload.date_collected,
                    
                    surplus: 0, loaded: 0, total: 0, delivered: 0, surplus2: 0,
                    notes: null, difference: false, driver_id: null
                };
            }
            
            const response = await axios({ method, url, data: payload });

            this.$emit('confirm', response.data);
            this.$emit('close');
            this.resetForm(); 
        } catch (e) {
            console.error ('Erro ao processar solicitação:', e);
            const errorMessage = e.response?.data?.error || e.message || 'Erro desconhecido ao processar solicitação.';
            this.$emit('error', errorMessage); 
        }
    }
  }
};
</script>
