<template>
  <nav class="client-sidebar">
    <div class="sidebar-header">
      <img src="@/assets/logo.png" alt="Logo" class="sidebar-logo" />
    </div>
    <ul class="sidebar-menu">
      <li @click="$emit('navigate', '/info-cliente')" class="sidebar-item">
        <span>👤</span> Informações da Conta
      </li>
      <li @click="logout" class="sidebar-item">
        <span>🚪</span> Logout
      </li>
    </ul>
  </nav>
</template>

<script setup>
function logout() {
  localStorage.clear()
  window.location.href = '/login'
}
</script>

<style scoped>
.client-sidebar {
  width: 260px;
  background: #e8f5e9;
  min-height: 100vh;
  padding: 32px 0 0 0;
  box-shadow: 2px 0 12px rgba(107, 178, 0, 0.07);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 36px;
}

.sidebar-logo {
  width: 140px;  
  height: auto;  
  margin-bottom: 16px;
}

.sidebar-menu {
  list-style: none;
  width: 100%;
  padding: 0;
}

.sidebar-item {
  width: 100%;
  padding: 18px 32px;
  font-size: 1.1rem;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  border-left: 4px solid transparent;
  transition: background 0.2s, border-color 0.2s;
  border-radius: 0;
}

.sidebar-item:hover {
  background: #d2f2b2;
  border-left: 4px solid #6BB200;
  color: #6BB200;
}
</style>