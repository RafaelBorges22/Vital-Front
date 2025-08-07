<template>
  <div v-if="show" :class="['notification', type]">
    <p>{{ message }}</p>
    <button @click="hideNotification" class="close-btn">&times;</button>
  </div>
</template>

<script>
export default {
  props: {
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'success', 
      validator: (value) => ['success', 'error'].includes(value)
    }
  },
  data() {
    return {
      show: false,
      timeout: null
    };
  },
  methods: {
    showNotification() {
      this.show = true;
      // Esconde a notificação automaticamente após 3 segundos
      this.timeout = setTimeout(() => {
        this.hideNotification();
      }, 3000);
    },
    hideNotification() {
      this.show = false;
      clearTimeout(this.timeout);
    }
  }
};
</script>

<style scoped>
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 15px 30px;
  border-radius: 5px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}
.notification.success {
  background-color: #4caf50;
}
.notification.error {
  background-color: #f44336;
}
.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  margin-left: 10px;
}
</style>