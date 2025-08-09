<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="product-name">Nome do Estoque:</label>
          <input 
            id="product-name"
            v-model.trim="formData.name" 
            required 
            class="form-input"
            placeholder="Digite o nome do Estoque"
          >
        </div>
        
        <div class="form-group">
          <label for="product-quantity">Quantidade de Produtos:</label>
          <input 
            id="product-quantity"
            v-model.number="formData.quantity_products" 
            type="number" 
            min="0"
            required 
            class="form-input"
            placeholder="0"
          >
        </div>
        
        <div class="form-group">
          <label for="product-end-date">Data de Validade:</label>
          <input 
            id="product-end-date"
            v-model="formData.end_date" 
            type="date" 
            class="form-input"
            :min="new Date().toISOString().split('T')[0]"
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
import '@/css/Modal.css'

export default {
  props: {
    visible: Boolean,
    title: {
      type: String,
      default: 'Gerenciar Estoque'
    },
    confirmButtonText: {
      type: String,
      default: 'Salvar'
    },
    initialData: {
      type: Object,
      default: () => ({
        name: '',
        quantity_products: 0,
        end_date: ''
      })
    }
  },
  data() {
    return {
      formData: { ...this.initialData }
    }
  },
  watch: {
    initialData: {
      handler(newVal) {
        this.formData = { ...newVal };
        if (this.formData.end_date && this.formData.end_date.includes('T')) {
          this.formData.end_date = this.formData.end_date.split('T')[0];
        }
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
    handleSubmit() {
      if (this.validateForm()) {
        this.$emit('submit', { 
          ...this.formData,
          quantity_products: Number(this.formData.quantity_products)
        });
      }
    },
    validateForm() {
      return this.formData.name.trim() !== '' && 
             this.formData.quantity_products >= 0;
    },
    resetForm() {
      this.formData = { ...this.initialData };
    }
  }
}
</script>
<style scoped>
@import '@/css/Modal.css';
</style>