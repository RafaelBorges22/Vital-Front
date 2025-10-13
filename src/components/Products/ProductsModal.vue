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
          <label for="product-quantity">Quantidade:</label>
          <input
            id="product-quantity"
            v-model.number="formData.quantity"
            type="number"
            min="0"
            required
            class="form-input"
            placeholder="0"
          >
        </div>
        <div class="form-group">
          <label for="product-stock">Estoque:</label>
          <select
            id="product-stock"
            v-model="formData.stockId"
            required
            class="form-input"
          >
            <option value="" disabled>Selecione um estoque</option>
            <option v-for="stock in stocks" :key="stock.id" :value="stock.id">
              {{ stock.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
        <label for="product-description">Descrição:</label>
        <textarea
            id="product-description"
            v-model.trim="formData.description"
            required
            class="form-input"
            placeholder="Digite a descrição do produto"
        ></textarea>
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

export default {
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
        name: '',
        price: 0,
        quantity: 0,
        description: '',
        stockId: ''
      })
    }
  },
  data() {
    return {
      formData: { ...this.initialData },
      stocks: []
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
    visible: {
      handler(val) {
        if (val) this.fetchStocks();
      },
      immediate: true
    }
  },
  methods: {
    closeModal() {
      this.$emit('close');
      this.resetForm();
    },
handleSubmit() {
  try {
    const formData = {
      id: this.formData.id,
      name: this.formData.name?.toString().trim() || '',
      price: parseFloat(this.formData.price) || 0,
      quantity: parseInt(this.formData.quantity) || 0,
      description: this.formData.description?.toString().trim() || '',
      stockId: this.formData.stockId || null
    };

    if (!formData.name) throw new Error('Nome é obrigatório');
    if (isNaN(formData.price) || formData.price <= 0) throw new Error('Preço inválido');
    if (isNaN(formData.quantity) || formData.quantity < 0) throw new Error('Quantidade inválida');

    this.$emit('submit', formData);
  } catch (error) {
    console.error('Erro no formulário:', error);
    alert(error.message);
  }
},

    validateForm() {
        return (
            this.formData.name?.trim() !== '' &&
            !isNaN(parseFloat(this.formData.price)) &&
            parseFloat(this.formData.price) >= 0 &&
            !isNaN(parseInt(this.formData.quantity)) &&
            parseInt(this.formData.quantity) >= 0 &&
            this.formData.description?.trim() !== '' &&
            this.formData.stockId
        );
},
    resetForm() {
      this.formData = { ...this.initialData };
    },
    async fetchStocks() {
      try {
        const res = await axios.get(`${API_URL}/stocks`);
        this.stocks = res.data.data || [];
      } catch (e) {
        this.stocks = [];
      }
    }
  }
}
</script>
<style scoped>
@import '@/css/Modal.css';
</style>