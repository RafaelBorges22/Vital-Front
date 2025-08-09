<template>
  <div class="estoque-container">
    <!-- Cabeçalho -->
    <div class="header">
      <div class="back-icon" @click="gohome()">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <h1>Gestão de Produtos</h1>
    </div>

    <!-- Produtos -->
    <div class="section">
      <div class="section-title">
        <h2>Produtos</h2>
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
          <span>Novo Produto</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6V18M18 12H6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>

      <ProductModal
        :visible="showCreateModal"
        title="Criar Novo Produto"
        @close="closeCreateModal"
        @submit="handleCreateProduct"
       />


      <ProductModal
        :visible="!!editProduct"
        title="Editar Produto"
        :initial-data="editProduct"
        confirm-button-text="Atualizar"
        @close="cancelEdit"
        @submit="handleUpdateProduct"
      />

      <DeleteProductModal
        :visible="showDeleteModal"
        :productName="productToDelete?.name"
        @close="showDeleteModal = false"
        @confirm="deleteProductConfirmed"
      />

      <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th>Nome</th>
              <th>Preço</th>
              <th>Quantidade</th>
              <th>Nível de Estoque</th>
              <th>Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="5" class="text-center">Carregando produtos...</td>
            </tr>
            <tr v-for="product in products" :key="product.id" class="product-row">
              <td>
                <template v-if="editProduct && editProduct.id === product.id">
                  <input v-model="editProduct.name" class="form-input" />
                </template>
                <template v-else>
                  {{ product.name || 'Sem nome' }}
                </template>
              </td>
              <td>
                <template v-if="editProduct && editProduct.id === product.id">
                  <input v-model.number="editProduct.price" type="number" class="form-input" />
                </template>
                <template v-else>
                  {{ product.price | currency }}
                </template>
              </td>
              <td>
                <template v-if="editProduct && editProduct.id === product.id">
                  <input v-model.number="editProduct.quantity" type="number" class="form-input" />
                </template>
                <template v-else>
                  {{ product.quantity || 0 }}
                </template>
              </td>
              <td>
                <span :class="getLevelClass(product.quantity)">
                    {{ getLevelByQuantity(product.quantity) }}
                </span>
               </td>
              <td>
                {{ product.stock?.name || product.stockName || 'N/A' }}
            </td>
              <td class="col-edit">
                <div class="action-buttons">
                  <button @click="startEdit(product)" class="btn-icon" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z" fill="#718096"/>
                      <path d="M11.3787 5.79289L3 14.1716V17H5.82842L14.2071 8.62132L11.3787 5.79289Z" fill="#718096"/>
                    </svg>
                  </button>
                  <button @click="deleteProduct(product.id)" class="btn-icon" title="Excluir">
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
import '@/css/Table.css';
import ProductModal from './ProductsModal.vue';
import DeleteProductModal from './ProductsDelete.vue';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

export default {
    components: {
      ProductModal,
      DeleteProductModal
    },
  data() {
    return {
      products: [],
      showCreateModal: false,
      editProduct: null,
      showDeleteModal: false,
      productToDelete: null
    }
  },
  mounted() {
    this.fetchProducts();
  },
  methods: {
    openCreateModal() {
      this.showCreateModal = true;
    },
    closeCreateModal() {
      this.showCreateModal = false;
    },
    async fetchProducts() {
      try {
        const res = await axios.get(`${API_URL}/products`);
        console.log('Produtos recebidos:', res.data.data);
        const produtos = res.data.data || res.data.products || res.data;
        this.products = Array.isArray(produtos) ? produtos.map(item => ({
        id: item.id || item._id,
        name: item.name || 'Sem nome',
        price: item.price || 0,
        quantity: item.quantity || 0,
        description: item.description || '',
        stockId: item.stockId || (item.stock && item.stock.id) || null,
        stock: item.stock,
        stockName: item.stockName || (item.stock && item.stock.name) || 'N/A'
        })) : [];
      } catch (e) {
        console.error('Erro ao buscar produtos:', e);
      }
    },
async handleCreateProduct(formData) {
  try {
    const payload = {
      name: formData.name?.trim() || '',
      description: formData.description?.trim() || 'Sem descrição',
      price: parseFloat(formData.price) || 0,
      image: formData.image || '',
      quantity: parseInt(formData.quantity) || 0,
      stock_id: formData.stockId || null
    };

    console.log('Payload validado:', payload);

    const response = await axios.post(`${API_URL}/products/`, payload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 201 || response.status === 200) {
      this.fetchProducts();
      this.closeCreateModal();
    } else {
      throw new Error(response.data?.message || 'Erro ao criar produto');
    }
  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      response: error.response?.data,
      stack: error.stack
    });
    alert(error.message);
  }
},

    async handleUpdateProduct(formData) {
      try {
        await axios.put(`${API_URL}/products/${formData.id}`, {
            name: formData.name,
            price: formData.price,
            quantity: formData.quantity,
            stock_id: formData.stockId
        });

        this.fetchProducts();
        this.cancelEdit();
      } catch (error) {
        console.error('Erro ao atualizar produto:', error);
      }
    },
    async deleteProduct(id) {
      this.productToDelete = this.products.find(p => p.id === id);
      this.showDeleteModal = true;
    },
    async deleteProductConfirmed() {
      if (!this.productToDelete) return;
      try {
        await axios.delete(`${API_URL}/products/${this.productToDelete.id}`);
        this.fetchProducts();
        this.showDeleteModal = false;
        this.productToDelete = null;
      } catch (error) {
        console.error('Erro ao deletar produto:', error);
        this.showDeleteModal = false;
        this.productToDelete = null;
      }
    },
    getLevelByQuantity(quantity) {
        if (quantity <= 5) {
            return 'Baixa quantidade';
        } else if (quantity >= 6 && quantity <= 12) {
            return 'Moderado';
        } else {
            return 'Boa quantidade';
        }
        },
    getLevelClass(quantity) {
        if (quantity <= 5) return 'level-baixa';
        if (quantity >= 6 && quantity <= 12) return 'level-moderado';
        return 'level-boa';
        },
            startEdit(product) {
      this.editProduct = { ...product };
    },
    gohome() {
    this.$router.push({ name: 'dashboard-admin' });
    },
    cancelEdit() {
      this.editProduct = null;
    }
  },
  filters: {
    currency(value) {
      if (typeof value !== "number") return value;
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  }
}
</script>

<style>
@import '@/css/Table.css'
</style>