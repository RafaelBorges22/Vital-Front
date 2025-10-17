<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="product-name">Nome do Produto:</label>
          <input
            id="product-name"
            v-model.trim="formData.name"
            required
            class="form-input"
            placeholder="Digite o nome do Produto"
          >
        </div>

        <div class="form-group">
          <label for="product-price">Preço:</label>
          <input
            id="product-price"
            v-model.number="formData.price"
            type="number"
            min="0"
            step="0.01"
            required
            class="form-input"
            placeholder="0.00"
          >
        </div>

        <div class="form-group">
          <label for="product-saldo">Saldo (Estoque Atual):</label>
          <input
            id="product-saldo"
            v-model.number="formData.saldo"
            type="number"
            min="0"
            required
            class="form-input"
            placeholder="0"
          >
        </div>
        
        <div class="form-group">
          <label for="product-min-stock">Estoque Mínimo (Min_Stock):</label>
          <input
            id="product-min-stock"
            v-model.number="formData.min_stock"
            type="number"
            min="0"
            required
            class="form-input"
            placeholder="0"
          >
        </div>

        <div class="form-group">
          <label for="product-med-stock">Estoque Moderado (Med_Stock):</label>
          <input
            id="product-med-stock"
            v-model.number="formData.med_stock"
            type="number"
            min="0"
            required
            class="form-input"
            placeholder="0"
          >
        </div>

        <div class="modal-actions">
          <button type="button" @click="closeModal" class="btn-cancel">
            Cancelar
          </button>
          <button type="submit" class="btn-confirm">
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
const PRODUCT_API = `${API_URL}/products/`;

export default {
  emits: ['close', 'product-created', 'product-updated', 'api-error'],
  props: {
    visible: Boolean,
    title: {
      type: String,
      default: 'Gerenciar Produto'
    },
    confirmButtonText: {
      type: String,
      default: 'Salvar'
    },
    initialData: {
      type: Object,
      default: () => ({
        id: null,
        name: '',
        price: 0,
        saldo: 0,
        min_stock: 0, 
        med_stock: 0,
      })
    }
  },
  data() {
    return {
      formData: { ...this.initialData },
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal };
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },
    async handleSubmit() {
      try {
        const dataForPost = {
          name: this.formData.name?.toString().trim() || '',
          price: parseFloat(this.formData.price) || 0,
          saldo: Math.round(this.formData.saldo) || 0,
          min_stock: Math.round(this.formData.min_stock) || 0,
          med_stock: Math.round(this.formData.med_stock) || 0,
        };

        if (!dataForPost.name) throw new Error('Nome é obrigatório');
        if (isNaN(dataForPost.price) || dataForPost.price <= 0) throw new Error('Preço inválido');
        if (isNaN(dataForPost.saldo) || dataForPost.saldo < 0) throw new Error('Saldo inválido');

        let res;
        const emittedName = dataForPost.name; 

        if (this.formData.id) {
          res = await axios.put(`${PRODUCT_API}/${this.formData.id}`, dataForPost);
          this.$emit('product-updated', { ...res.data, name: emittedName }); 
        } else {
          res = await axios.post(PRODUCT_API, dataForPost);
          this.$emit('product-created', { ...res.data, name: emittedName }); 
        }

        this.closeModal();
        
      } catch (error) {
        const errorMessage = error.response 
          ? (error.response.data?.error || error.response.data?.message || 'Erro de servidor desconhecido.')
          : (error.message || 'Erro de rede.');
          
        console.error('Erro ao salvar o produto:', errorMessage);
        
        this.$emit('api-error', errorMessage);
      }
    },
    resetForm() {
      this.formData = { ...this.initialData };
    },
  }
}
</script>
<style scoped>
@import '@/css/Modal.css';
</style>