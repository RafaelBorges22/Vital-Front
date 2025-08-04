<template>
  <div class="estoque-container">
    <!-- Cabeçalho -->
    <div class="header">
      <div class="back-icon" @click="gohome()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Gestão de Solicitações</h1>
    </div>

    <div class="section">
      <div class="section-title">
        <h2>Solicitações de Coleta</h2>
      </div>
      <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th class="col-nome">Nome</th>
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
            <tr v-for="solicitation in solicitations" :key="solicitation.id" class="product-row">
              <td class="col-nome">
                {{ solicitation.client_name || '-' }}
              </td>
              <td class="col-address">
                {{ solicitation.status || '-' }}
              </td>
              <td class="col-nome">
                {{ formatDate(solicitation.date_solicitation) }}
              </td>
              <td class="col-nome">
                {{ formatDate(solicitation.date_collected) }}
              </td>
              <td class="col-edit">
                <div class="action-buttons">
                  <button @click="startEdit(solicitation)" class="btn-icon" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z" fill="#718096"/>
                      <path d="M11.3787 5.79289L3 14.1716V17H5.82842L14.2071 8.62132L11.3787 5.79289Z" fill="#718096"/>
                    </svg>
                  </button>
                  <button @click="deleteSolicitation(solicitation.id)" class="btn-icon" title="Excluir">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7V16C5 17.1046 5.89543 18 7 18H13C14.1046 18 15 17.1046 15 16V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 7V5C8 3.89543 8.89543 3 10 3H10.5C11.6046 3 12.5 3.89543 12.5 5V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 7H18" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import '@/css/TableClients.css';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export default {
  components: {

  },
  data() {
    return {
      solicitations: [],
      showCreateModal: false,
      editSolicitation: null,
      showDeleteModal: false,
      solicitationToDelete: null
    };
  },
  mounted() {
    this.fetchSolicitations();
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

    openCreateModal() {
      this.showCreateModal = true;
    },

    closeCreateModal() {
      this.showCreateModal = false;
    },

    async fetchSolicitations() {
      try {
        const res = await axios.get(`${API_URL}/solicitations`);
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
        console.error('Erro ao buscar solicitações:', e);
        this.solicitations = [];
      }
    },

    async handleCreateSolicitation(formData) {
      try {
        const payload = {
          client_name: formData.client_name,
          status: formData.status,
          date_solicitation: formData.date_solicitation,
          date_collected: formData.date_collected
        };

        const response = await axios.post(`${API_URL}/solicitation/`, payload);

        if (response.status === 201 || response.status === 200) {
          await this.fetchSolicitations();
          this.closeCreateModal();
          if (this.$toast?.success) this.$toast.success('Solicitação criada com sucesso!');
        } else {
          throw new Error(response?.data?.error || 'Erro desconhecido');
        }
      } catch (error) {
        let errorMessage = 'Erro ao criar solicitação';
        if (error.response) {
          errorMessage = error.response.data?.message || error.response.data?.error || error.response.statusText;
        } else if (error.request) {
          errorMessage = 'Sem resposta do servidor';
        } else {
          errorMessage = error.message;
        }
        if (this.$toast?.error) this.$toast.error(`Falha: ${errorMessage}`);
      }
    },

    async handleUpdateSolicitation(formData) {
      try {
        const payload = {
          client_name: formData.client_name,
          status: formData.status,
          date_solicitation: formData.date_solicitation,
          date_collected: formData.date_collected
        };

        await axios.put(`${API_URL}/solicitation/${formData.id}`, payload);

        await this.fetchSolicitations();
        this.cancelEdit();
        if (this.$toast?.success) this.$toast.success('Solicitação atualizada com sucesso!');
      } catch (error) {
        if (this.$toast?.error) this.$toast.error('Erro ao atualizar solicitação');
      }
    },

    async deleteSolicitation(id) {
      this.solicitationToDelete = this.solicitations.find(s => s.id === id);
      this.showDeleteModal = true;
    },

    async deleteSolicitationConfirmed() {
      if (!this.solicitationToDelete) return;
      try {
        await axios.delete(`${API_URL}/solicitation/${this.solicitationToDelete.id}`);
        this.fetchSolicitations();
        this.showDeleteModal = false;
        this.solicitationToDelete = null;
        this.$toast.success('Solicitação deletada com sucesso!');
      } catch (error) {
        console.error('Erro ao deletar solicitação:', error);
        this.showDeleteModal = false;
        this.solicitationToDelete = null;
        this.$toast.error('Erro ao deletar solicitação.');
      }
    },
    gohome() {
    this.$router.push({ name: 'dashboard-admin' });
    },
    startEdit(solicitation) {
      this.editSolicitation = { ...solicitation };
    },
    cancelEdit() {
      this.editSolicitation = null;
    },
  },
};
</script>

<style scoped>
@import '@/css/TableClients.css';
</style>