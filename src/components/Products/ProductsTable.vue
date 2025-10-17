<template>
  <div class="estoque-container">
    <div class="header">
      <div class="back-icon" @click="gohome()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Gestão de Produtos</h1>
    </div>

    <div class="section">
      <div class="section-title">
        <h2>Estoque de Produtos</h2>
        <button class="new-product-btn" @click="openCreateModal">
          Criar Produto +
        </button>
      </div>

      <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th>Nome</th>
              <th>Preço</th>
              <th>Saldo</th>
              <th>Estoque Mínimo</th>
              <th>Estoque Médio</th>
              <th>Valor Total</th>
              <th>Nível de Estoque</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr v-if="products.length === 0">
              <td colspan="8" class="text-center">
                {{ products.length === 0 && !loading ? 'Nenhum produto encontrado' : 'Carregando produtos...' }}
              </td>
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
                  R$ {{ product.price | currency }}
                </template>
              </td>

              <td>
                <template v-if="editProduct && editProduct.id === product.id">
                  <input v-model.number="editProduct.saldo" type="number" class="form-input" />
                </template>
                <template v-else>
                  {{ product.saldo }}
                </template>
              </td>

              <td>
                <template v-if="editProduct && editProduct.id === product.id">
                  <input v-model.number="editProduct.min_stock" type="number" class="form-input" />
                </template>
                <template v-else>
                  {{ product.min_stock }}
                </template>
              </td>

              <td>
                <template v-if="editProduct && editProduct.id === product.id">
                  <input v-model.number="editProduct.med_stock" type="number" class="form-input" />
                </template>
                <template v-else>
                  {{ product.med_stock }}
                </template>
              </td>

              <td>
                R$ {{ product.value_total | currency }}
              </td>

              <td>
                <span :class="getLevelClass(product.situation)">
                  {{ product.situation }}
                </span>
              </td>


              <td class="col-edit">
                <div class="action-buttons">
                  <template v-if="editProduct && editProduct.id === product.id">
                    <button @click="handleUpdateProduct(editProduct)" class="btn-icon" title="Salvar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12L10 17L20 7" stroke="#48BB78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button @click="cancelEdit" class="btn-icon" title="Cancelar">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M18 6L6 18" stroke="#F56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M6 6L18 18" stroke="#F56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </template>

                  <template v-else>
                    <button @click="startEdit(product)" class="btn-icon" title="Editar">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M13.5 6.5L16.5 9.5L9.5 16.5L6.5 13.5L13.5 6.5Z" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M13.5 6.5L6.5 13.5" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M16 10L14 8" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>

                    <button @click="deleteProduct(product.id)" class="btn-icon" title="Excluir">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M5 7V16C5 17.1046 5.89543 18 7 18H13C14.1046 18 15 17.1046 15 16V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 7V5C8 3.89543 8.89543 3 10 3H10.5C11.6046 3 12.5 3.89543 12.5 5V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 7H18" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <ProductModal 
      :visible="showCreateModal" 
      @close="closeCreateModal" 
      @product-created="fetchProducts" 
    />
    <DeleteProductModal 
      :visible="showDeleteModal" 
      :productName="productToDelete ? productToDelete.name : ''" 
      @close="showDeleteModal = false" 
      @confirm="deleteProductConfirmed"
    />

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
      productToDelete: null,
      loading: false ,
      notification: { visible: false, type: 'info', title: '', message: ''}
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
    closeDeleteModal() {
      this.showDeleteModal = false;
  },
    async fetchProducts() {
      this.loading = true;
      try {
        const res = await axios.get(`${API_URL}/products`);
        console.log('Produtos recebidos:', res.data.data);
        const produtos = res.data.data || res.data.products || res.data;
        this.products = Array.isArray(produtos) ? produtos.map(item => ({
        id: item.id || item._id,
        name: item.name || 'Sem nome',
        price: parseFloat(item.price) || 0,
        quantity: item.quantity || item.saldo || 0,
        saldo: item.saldo || item.quantity || 0,
        min_stock: item.min_stock || 0,
        med_stock: item.med_stock || 0,
        value_total: item.value_total || 0,
        situation: item.situation || 'N/A', 
        })) : [];
      } catch (e) {
        console.error('Erro ao buscar produtos:', e);
        this.products = [];
      } finally {
        this.loading = false; 
      }
    },
async handleCreateProduct(formData) {
  try {
    const payload = {
      name: formData.name?.trim() || '',
      price: parseFloat(formData.price) || 0, 
      saldo: parseInt(formData.saldo) || 0, 
      min_stock: parseInt(formData.min_stock) || 0,
      med_stock: parseInt(formData.med_stock) || 0
    };

    const response = await axios.post(`${API_URL}/products/`, payload, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (response.status === 201 || response.status === 200) {
      this.fetchProducts();
      this.closeCreateModal();
    } else {
      throw new Error(response.data?.message || 'Erro ao criar produto');
    }
  } catch (error) {
    console.error('Erro detalhado:', error);
    alert(error.message);
  }
},

 async handleUpdateProduct(formData) {
  try {
    await axios.put(`${API_URL}/products/${formData.id}`, {
      name: formData.name,
      price: formData.price,
      saldo: formData.saldo,
      min_stock: formData.min_stock,
      med_stock: formData.med_stock
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
getLevelClass(situation) {
  if (!situation) {
    return 'level-default';
  }

  const estado = situation.toUpperCase();

  switch (estado) {
    case 'CRÍTICO':
    case 'CRITICO':
      return 'level-baixa'; 
    case 'NORMAL':
      return 'level-moderado'; 
    case 'EXCESSO':
      return 'level-boa'; 
    default:
      return 'level-default';
  }
},
    handleProductSuccess(newProduct) {
      this.fetchProducts();
      this.showNotification('success', 'Criação Concluída', `Produto "${newProduct.name}" criado com sucesso!`);
    },

    startEdit(product) {
      this.editProduct = { ...product };
    },
    gohome() {
    this.$router.push({ name: 'dashboard-admin' });
    },
    cancelEdit() {
      this.editProduct = null;
    },
  },
  filters: {
    currency(value) {
      if (typeof value !== "number") return value;
      return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
  }
}
</script>
<style scoped>
@import '@/css/Table.css'
</style>