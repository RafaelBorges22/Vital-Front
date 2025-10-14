<template>
  <div class="estoque-container">
    <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th>Nome</th>
              <th>Preço</th>
              <th>Saldo</th>
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
                <span :class="getLevelClass(product.situation)">
                  {{ product.situation || 'N/A' }}
                </span>
               </td>
              <td>
                {{ product.stock?.name || product.stockName || 'N/A' }}
              </td>
              <td class="col-edit">
                </td>
            </tr>
          </tbody>
        </table>
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
        min_stock: item.min_stock || 0,
        med_stock: item.med_stock || 0,
        value_total: item.value_total || 0,
        situation: item.situation || 'N/A',
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
      saldo: parseInt(formData.quantity) || 0, 
      min_stock: parseInt(formData.min_stock) || 0,
      med_stock: parseInt(formData.med_stock) || 0,
      value_total: parseFloat(formData.value_total) || 0,
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
            saldo: formData.quantity,
            min_stock: formData.min_stock,
            med_stock: formData.med_stock,
            value_total: formData.value_total,
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