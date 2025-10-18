<template>
  <div class="estoque-container">
    <div class="header">
      <div class="back-icon" @click="gohome()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Histórico de Solicitações</h1>
    </div>

    <div class="section">
      <div class="section-title">
        <h2>Solicitações Recentes</h2>
      </div>

      <p v-if="!clientId" class="error-message">
        Erro: ID do cliente não encontrado no armazenamento local.
      </p>

      <div class="table-container" v-else>
        <table style="border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th class="col-id">N° da Solicitação</th>
              <th class="col-date">Data Solicitação</th>
              <th class="col-driver">Motorista</th>
              <th class="col-payment">Forma de Pagamento</th>
              <th class="col-status">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center">Carregando histórico...</td>
            </tr>
            <tr v-else-if="requests.length === 0">
              <td colspan="6" class="text-center">Nenhuma solicitação encontrada para este cliente.</td>
            </tr>

            <tr v-for="request in requests" :key="request.id" class="product-row">
              <td class="col-id">#{{ request.id }}</td>
              <td class="col-date">{{ formatDate(request.date_solicitation) }}</td>
              <td class="col-driver">{{ request.driver_name || 'Não Atribuído' }}</td>
              <td class="col-payment">{{ request.payment_method || '-' }}</td>
              <td class="col-status">
                <span :class="getStatusClass(request.status)">
                  {{ request.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import '@/css/Table.css'; 

const API_URL = import.meta.env.VITE_API_URL;

export default {
  data() {
    return {
      requests: [],
      clientId: null,
      loading: false,
      error: null,
    };
  },
  mounted() {
    this.clientId = localStorage.getItem('client_id');
    if (this.clientId) {
      this.fetchClientRequests();
    } else {
      console.error('Client ID not found in localStorage.');
      this.error = 'ID do cliente não encontrado.';
    }
  },
  methods: {
    async fetchClientRequests() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get(`${API_URL}/solicitations/clients/${this.clientId}`);
        
        let data = response.data.data || response.data;
        this.requests = Array.isArray(data) ? data.map(item => ({
            id: item.id,
            date_solicitation: item.date_solicitation, 
            driver_id: item.driver_id,
            driver_name: item.driver_name,
            payment_method: item.payment_method, 
            status: item.status || 'Pendente',
            notes: item.notes,
            client_id: item.client_id,
            client_name: item.client_name,
            date_collected: item.date_collected,
        })).sort((a, b) => new Date(b.date_solicitation) - new Date(a.date_solicitation)) : []; 

      } catch (e) {
        console.error('Erro ao buscar solicitações:', e);
        this.error = 'Não foi possível carregar o histórico de solicitações.';
        this.requests = [];
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      if (!date) return '-';
      const dateObj = new Date(date);
      if (isNaN(dateObj)) return '-';
      
      return dateObj.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    },
    getStatusClass(status) {
      if (!status) return 'level-default';
      const s = status.toUpperCase();
      
      switch (s) {
        case 'PENDENTE':
                return 'status-pendente'; 
            case 'APROVADO':
                return 'status-aprovado'; 
            case 'REJEITADO':
                return 'status-cancelado'; 
            default:
                return 'status-default';
        }
      }
    },
    gohome() {
        this.$router.push({ name: 'dashboard-client' }); 
    }
  }
</script>

<style scoped>
@import '@/css/Table.css'; 

.table-container {
    overflow-x: auto;
}

.table-container table {
    min-width: 950px; 
}

.table-container th,
.table-container td {
    padding: 8px 12px; 
    white-space: nowrap; 
}

.table-container .col-edit {
    padding: 12px 10px;
}
.error-message {
    color: #C53030;
    background-color: #FED7D7;
    border: 1px solid #C53030;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: 600;
}

.text-center {
    text-align: center;
    padding: 20px;
    color: #6a7486;
}
</style>