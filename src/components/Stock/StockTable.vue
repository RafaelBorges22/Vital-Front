<template>
  <div class="estoque-container">
    <!-- Cabeçalho -->
    <div class="header">
      <div class="back-icon" @click="gohome()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>Gestão de estoque</h1>
    </div>

    <!-- Níveis de Estoque -->
    <div class="section">
      <div class="section-title">
        <h2>Níveis de Estoque</h2>
      </div>

      <!-- Botões de ação -->
      <div class="action-buttons">
        <button class="export-btn">
          <span>Filtro</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 7H20M6.99994 12H16.9999M10.9999 17H12.9999" stroke="#454545" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        
        <button class="new-product-btn" @click="openCreateModal">
          <span>Novo Estoque</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18M18 12H6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>

        <StockModal
          :visible="showCreateModal"
          title="Criar Novo Estoque"
          @close="closeCreateModal"
          @submit="handleCreateStock"
        />

        <StockModal
          :visible="!!editStock"
          title="Editar Estoque"
          :initial-data="editStock"
          confirm-button-text="Atualizar"
          @close="cancelEdit"
          @submit="handleUpdateStock"
        />

        <DeleteStockModal
          :visible="showDeleteModal"
          :stockName="stockToDelete?.name"
          @close="showDeleteModal = false"
          @confirm="deleteStockConfirmed"
        />

        <router-link to="/lista-produtos" class="new-product-btn">
          <span>Ver Todos Produtos...</span>
        </router-link>
      </div>

      <div class="table-container">
        <table>
          <thead>
            <tr class="header-row">
              <th>Estoques</th>
              <th>Quantidade de Produtos</th>
              <th>Data de Entrada</th>
              <th>Data de Fechamento</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="stocks.length === 0">
              <td colspan="5" class="text-center">Carregando produtos...</td>
            </tr>
            <tr v-for="stock in stocks" :key="stock.id" class="product-row">
              <td>
                <template v-if="editStock && editStock.id === stock.id">
                  <input v-model="editStock.name" class="form-input" />
                </template>
                <template v-else>
                  {{ stock.name || 'Sem nome' }}
                </template>
              </td>
              <td>
                <template v-if="editStock && editStock.id === stock.id">
                  <input v-model.number="editStock.quantity_products" type="number" class="form-input" />
                </template>
                <template v-else>
                  {{ stock.quantity_products || 0 }}
                </template>
              </td>
              <td>{{ formatDate(stock.entry_date) }}</td>
              <td>{{ stock.end_date ? formatDate(stock.end_date) : 'N/A' }}</td>
              <td class="col-edit">
                <template v-if="editStock && editStock.id === stock.id">
                  <button @click="updateStock" class="btn-save">Salvar</button>
                  <button @click="cancelEdit" class="btn-cancel">Cancelar</button>
                </template>
                <template v-else>
                  <div class="action-buttons">
                    <button @click="startEdit(stock)" class="btn-icon" title="Editar">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z" fill="#718096"/>
                        <path d="M11.3787 5.79289L3 14.1716V17H5.82842L14.2071 8.62132L11.3787 5.79289Z" fill="#718096"/>
                      </svg>
                    </button>
                    <button @click="deleteStock(stock.id)" class="btn-icon" title="Excluir">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7V16C5 17.1046 5.89543 18 7 18H13C14.1046 18 15 17.1046 15 16V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 7V5C8 3.89543 8.89543 3 10 3H10.5C11.6046 3 12.5 3.89543 12.5 5V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 7H18" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="stocks.length === 0" class="empty-state">
      <p>Nenhum estoque encontrado.</p>
      <button @click="openCreateModal" class="btn-create-stock">Criar Novo Estoque</button>
    </div>
  </div>
</template>


<script>
import StockModal from '@/components/Stock/StockModal.vue';
import DeleteStockModal from '@/components/Stock/StockDelete.vue';
import '@/css/Table.css';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default {
  components: {
    StockModal,
    DeleteStockModal
  },
  data() {
    return {
      stocks: [],
      showCreateModal: false,
      editStock: null,
      showDeleteModal: false,      
      stockToDelete: null             
    }
  },
  mounted() {
    this.fetchStocks();
  },
  methods: {
    openCreateModal() {
      this.showCreateModal = true;
    },
    
    closeCreateModal() {
      this.showCreateModal = false;
    },
    
    async fetchStocks() {
      try {
        const res = await axios.get(`${API_URL}/stocks`);
        console.log('Dados completos:', res.data);
        
        this.stocks = res.data.data.map(item => ({
          id: item.id || item._id,
          name: item.productName || item.name || 'Sem nome',
          quantity_products: item.quantity_products || 0,
          entry_date: item.entry_date || null,
          end_date: item.end_date || null
        }));
        
      } catch (e) {
        console.error('Erro ao buscar estoques:', e);
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return 'N/A';
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
      } catch (e) {
        return dateString; 
      }
    },
    
async handleCreateStock(formData) {
  try {
    const payload = {
      name: formData.name,
      quantity_products: formData.quantity_products,
      end_date: formData.end_date,
      entry_date: new Date().toISOString()
    };


    const response = await axios.post(`${API_URL}/stocks/`, payload);

    if (response?.data?.success) {
      this.fetchStocks();
      this.closeCreateModal();
      console.log('Estoque criado com sucesso!');
    } else {
      throw new Error(response?.data?.error || 'Erro desconhecido ao criar estoque.');
    }
  } catch (error) {
    console.error('Erro ao criar estoque:', error);
  }
},

    async handleUpdateStock(formData) {
      try {
        await axios.put(`${API_URL}/stocks/${formData.id}`, {
          name: formData.name,
          quantity_products: formData.quantity_products,
          end_date: formData.end_date
        });
        
        this.fetchStocks();
        this.cancelEdit();
        
        
      } catch (error) {
        console.error('Erro ao atualizar estoque:', error);
      }
    },
    
    async deleteStock(id) {
    this.stockToDelete = this.stocks.find(s => s.id === id);
      this.showDeleteModal = true;
    },

     async deleteStockConfirmed() {
      if (!this.stockToDelete) return;
      try {
        await axios.delete(`${API_URL}/stocks/${this.stockToDelete.id}`);
        this.fetchStocks();
        this.showDeleteModal = false;
        this.stockToDelete = null;
      } catch (error) {
        console.error('Erro ao deletar estoque:', error);
        this.showDeleteModal = false;
        this.stockToDelete = null;
      }
    },
    gohome() {
    this.$router.push({ name: 'dashboard-admin' });
    },

    startEdit(stock) {
      this.editStock = { 
        ...stock,
        end_date: stock.end_date ? stock.end_date.split('T')[0] : '' 
      };
    },
    
    cancelEdit() {
      this.editStock = null;
    }
  }
}
</script>
<style>
@import '@/css/Table.css'
</style>
