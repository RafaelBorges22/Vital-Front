<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <h2 class="modal-title">Confirmar Exclusão</h2>
      <p style="margin-bottom: 32px; text-align: center;">
        Tem certeza que deseja excluir <b>{{ productName }}</b>?<br>
        Esta ação não poderá ser desfeita.
      </p>
      <div class="modal-actions">
        <button type="button" @click="$emit('close')" class="btn-cancel">
          Cancelar
        </button>
        <button type="button" @click="$emit('confirm')" class="btn-confirm">
          Excluir
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import '@/css/Modal.css'

export default {
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    productName: {
      type: String,
      default: ''
    }
  }
}
</script>