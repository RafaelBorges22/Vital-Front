<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="client-name">Nome do Cliente:</label>
          <input
            id="client-name"
            v-model.trim="formData.name"
            required
            class="form-input"
            placeholder="Digite o nome do Cliente"
          >
        </div>
        <div class="form-group">
          <label for="client-address">Endereço:</label>
          <input
            id="client-address"
            v-model.trim="formData.address"
            required
            class="form-input"
            placeholder="Digite o endereço"
          >
        </div>
        <div class="form-group">
          <label for="client-cnpj">CNPJ:</label>
          <input
            id="client-cnpj"
            v-model.trim="formData.cnpj"
            required
            class="form-input"
            placeholder="Digite o CNPJ"
          >
        </div>
        <div class="form-group">
          <label for="client-email">E-mail:</label>
          <input
            id="client-email"
            v-model.trim="formData.email"
            type="email"
            required
            class="form-input"
            placeholder="cliente@email.com"
          >
        </div>
        <div class="form-group">
          <label for="client-date">Data de Abertura:</label>
          <input
            id="client-date"  
            v-model="formData.opening_date"
            type="date"
            required
            class="form-input"
            :max="new Date().toISOString().split('T')[0]"
          >
        </div>
        <div class="form-group">
          <label for="payment-method">Método de Pagamento:</label>
          <select
            id="payment-method"
            v-model="formData.payment_method"
            required
            class="form-input"
          >
            <option value="">Selecione um método</option>
            <option value="Credito">Cartão de Crédito</option>
            <option value="Debito">Cartão de Débito</option>
            <option value="Pix">PIX</option>
            <option value="Dinheiro">Dinheiro</option>
            <option value="Produto">Produto</option>
          </select>
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
      default: 'Gerenciar Cliente'
    },
    confirmButtonText: {
      type: String,
      default: 'Salvar'
    },
    initialData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const defaultData = {
      name: '',
      address: '',
      cnpj: '',
      email: '',
      payment_method: '',
      opening_date: new Date().toISOString().split('T')[0]
    };
    return {
      formData: { ...defaultData, ...this.initialData }
    };
  },
  watch: {
    initialData: {
      handler(newVal) {
        const defaultData = {
          name: '',
          address: '',
          cnpj: '',
          email: '',
          payment_method: '',
          opening_date: new Date().toISOString().split('T')[0]
        };
        this.formData = { ...defaultData, ...newVal };
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    validateForm() {
      const requiredFields = {
        name: 'Nome',
        payment_method: 'Método de pagamento',
        opening_date: 'Data de abertura'
      };

      const missingFields = Object.entries(requiredFields)
        .filter(([field]) => !this.formData[field]?.toString().trim())
        .map(([, name]) => name);

      if (missingFields.length > 0) {
        this.$toast?.error?.(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
        return false;
      }

      return true;
    },

    handleSubmit() {
      if (!this.validateForm()) return;

      this.$emit('confirm', { ...this.formData }); 
    },

    closeModal() {
      this.$emit('close'); 
    },

    resetForm() {
      const defaultData = {
        name: '',
        address: '',
        cnpj: '',
        email: '',
        payment_method: '',
        opening_date: new Date().toISOString().split('T')[0]
      };
      this.formData = { ...defaultData, ...this.initialData };
    }
  }
}
</script>
