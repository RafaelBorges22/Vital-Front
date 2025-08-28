<template>
  <div class="driver-solicitations-container">
    <div class="header">
      <div class="back-icon" @click="gohome()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Minhas Solicitações de Coleta</h1>
    </div>

    <div class="section">
      <div class="section-title">
        <h2>Solicitações de Coleta Atribuídas</h2>
      </div>
      <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th class="col-nome">Cliente</th>
              <th class="col-address">Status</th>
              <th class="col-nome">Data de Solicitação</th>
              <th class="col-nome">Data de Coleta</th>
              <th class="col-edit">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="solicitations.length === 0">
              <td colspan="5" class="text-center">Nenhuma solicitação encontrada</td>
            </tr>
            <tr 
              v-else 
              v-for="solicitation in solicitations" 
              :key="solicitation.id" 
              class="product-row solicitation-row"
              @click="goToSolicitation(solicitation.id)"
            >
              <td class="col-nome">{{ solicitation.client_name || '-' }}</td>
              <td class="col-address">{{ solicitation.status || '-' }}</td>
              <td class="col-nome">{{ formatDate(solicitation.date_solicitation) }}</td>
              <td class="col-nome">{{ formatDate(solicitation.date_collected) }}</td>
              <td class="col-edit">
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
      solicitations: [],
    };
  },
  mounted() {
    this.fetchDriverSolicitations();
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
    },
    gohome() {
      this.$router.push({ name: 'dashboard-driver' });
    },
    goToSolicitation(id) {
      this.$router.push({ name: 'solicitacao-unica', params: { id } });
    },
    async fetchDriverSolicitations() {
      const driverId = localStorage.getItem('user_id');
      if (!driverId) {
        console.error('ID do motorista não encontrado.');
        this.solicitations = [];
        return;
      }
      try {
        const res = await axios.get(`${API_URL}/solicitations?driver_id=${driverId}`);
        let data = [];
        
        if (Array.isArray(res.data.data)) {
          data = res.data.data;
        } else if (Array.isArray(res.data.solicitations)) {
          data = res.data.solicitations;
        } else if (res.data.items) {
          data = res.data.items;
        } else if (Array.isArray(res.data)) {
          data = res.data;
        } else {
          console.warn('Estrutura de dados inesperada:', res.data);
        }

        this.solicitations = data.map(item => ({
          id: item.id || item._id,
          client_name: item.client_name || '-',
          status: item.status || '-',
          date_solicitation: item.date_solicitation || null,
          date_collected: item.date_collected || null
        }));
      } catch (e) {
        console.error('Erro ao buscar solicitações do motorista:', e);
        this.solicitations = [];
      }
    },
  },
};
</script>