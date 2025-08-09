<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2>{{ title }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="admin-name">Nome do Administrador:</label>
          <input
            id="admin-name"
            v-model.trim="formData.name"
            required
            class="form-input"
            placeholder="Digite o nome do Administrador"
          >
        </div>
        <div class="form-group">
          <label for="admin-email">E-mail:</label>
          <input
            id="admin-email"
            v-model.trim="formData.email"
            type="email"
            required
            class="form-input"
            placeholder="admin@email.com"
          >
        </div>
        <div class="form-group">
          <label for="admin-password">Senha:</label>
          <input
            id="admin-password"
            v-model.trim="formData.password"
            type="password"
            required
            class="form-input"
            placeholder="Digite a senha"
          >
        </div>
        <div class="form-group">
          <label for="level">Nível do Administrador:</label>
          <select
            id="level"
            v-model="formData.level"
            required
            class="form-input"
          >
            <option value="">Selecione um Nível</option>
            <option value="PLENO">Pleno</option>
            <option value="JUNIOR">Junior</option>
            <option value="MASTER">Master</option>
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
      default: 'Gerenciar Administrador'
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
      email: '',
      password: '',
      level:''
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
          email: '',
          password: ''
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
        password: 'Senha',
        email: 'E-mail',
        level: 'Nível'
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
        email: '',
        password: '',
        level: ''
      };
      this.formData = { ...defaultData, ...this.initialData };
    }
  }
}
</script>

<style scoped>
@import '@/css/Modal.css';
</style>