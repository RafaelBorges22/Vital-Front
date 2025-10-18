<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="driver-select">Motorista:</label>
          
          <select
            id="driver-select"
            v-model.number="formData.driver_id"
            required
            class="form-input"
            :disabled="loadingDrivers || drivers.length === 0"
          >
            <option :value="null" disabled>
                {{ loadingDrivers ? 'Carregando motoristas...' : 'Selecione um Motorista' }}
            </option>
            
            <option
              v-for="driver in drivers"
              :key="driver.id"
              :value="driver.id"
            >
              {{ driver.name }}
            </option>
          </select>
          <span v-if="loadingDrivers">Carregando motoristas...</span>
          <span v-else-if="drivers.length === 0">Nenhum motorista encontrado.</span>
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeModal" class="btn-cancel">
            Cancelar
          </button>
          <button 
            type="submit" 
            class="btn-confirm" 
            :disabled="!formData.driver_id || loadingDrivers"
          >
            {{ confirmButtonText }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '@/css/Modal.css'

const API_URL = import.meta.env.VITE_API_URL;
const DRIVERS_API = `${API_URL}/drivers`; 
const REPORT_BASE_API = `${API_URL}/reports/driver`; 

export default {
  emits: ['close', 'report-generated', 'api-error'],
  props: {
    visible: Boolean,
    title: {
      type: String,
      default: 'Gerar Relatório por Motorista'
    },
    confirmButtonText: {
      type: String,
      default: 'Gerar Relatório'
    },
    initialData: {
      type: Object,
      default: () => ({
        driver_id: null, 
      })
    }
  },
  data() {
    return {
      formData: { ...this.initialData },
      drivers: [], 
      loadingDrivers: false,
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
      immediate: true
    },
 
    visible(isNowVisible) {
        if (isNowVisible && this.drivers.length === 0) {
            this.fetchDrivers();
        }
    }
  },
  created() {
    this.fetchDrivers();
  },
  methods: {
    async fetchDrivers() {
  this.loadingDrivers = true;
  console.log(`[DriverModal] Tentando buscar motoristas em: ${DRIVERS_API}`);
  try {
    const response = await axios.get(DRIVERS_API);
    
    console.log('[DriverModal] Resposta da API COMPLETA:', response.data);

    let driversData = response.data;
    if (driversData && driversData.drivers && Array.isArray(driversData.drivers)) {
        driversData = driversData.drivers;
        console.log('[DriverModal] Dados ajustados (encontrado campo .drivers):', driversData);
    } 
    else if (driversData && driversData.motoristas && Array.isArray(driversData.motoristas)) {
        driversData = driversData.motoristas;
        console.log('[DriverModal] Dados ajustados (encontrado campo .motoristas):', driversData);
    }
    else if (driversData && driversData.data && Array.isArray(driversData.data)) {
        driversData = driversData.data;
        console.log('[DriverModal] Dados ajustados (encontrado campo .data):', driversData);
    }
    else if (!Array.isArray(driversData)) {
        console.error('[DriverModal] O formato da resposta não é um array esperado (drivers, motoristas ou data).');
        driversData = []; 
    }
    
    this.drivers = driversData;

    console.log(`[DriverModal] Motoristas carregados: ${this.drivers.length}`);
    
    if (this.drivers.length > 0 && !this.drivers.some(d => d.id === this.formData.driver_id)) {
        this.formData.driver_id = this.drivers[0].id; 
    } else if (this.drivers.length === 0) {
         this.formData.driver_id = null;
    }

  } catch (error) {
    console.error('[DriverModal] Erro de rede ou servidor ao buscar motoristas:', error);
    this.$emit('api-error', `Erro ao carregar a lista de motoristas. Detalhes: ${error.message}`);
  } finally {
    this.loadingDrivers = false;
  }
},
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },
    async handleSubmit() {
      try {
        const driverId = this.formData.driver_id;

        if (!driverId || isNaN(driverId) || driverId <= 0) {
          throw new Error('Selecione um Motorista válido da lista.');
        }

        const reportUrl = `${REPORT_BASE_API}/${driverId}`;
        
        const res = await axios.post(reportUrl); 
        
        console.log(`[DriverModal] Enviando requisição para: ${reportUrl}`);

        this.$emit('report-generated', res.data); 
        this.closeModal();
        
      } catch (error) {
        const errorMessage = error.response 
          ? (error.response.data?.error || error.response.data?.message || 'Erro de servidor desconhecido.')
          : (error.message || 'Erro de rede.');
          
        console.error('[DriverModal] Erro ao gerar o relatório:', errorMessage);
        
        this.$emit('api-error', errorMessage);
      }
    },
    
    resetForm() {
      this.formData.driver_id = null; 
    },
  }
}
</script>

<style scoped>
@import '@/css/Modal.css';
</style>