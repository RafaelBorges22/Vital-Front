<template>
  <div class="estoque-container">
    <div class="header">
      <h1>Gestão de Administradores</h1>
    </div>

    <div class="section">
      <div class="section-title">
        <h2>Administradores Cadastrados</h2>
      </div>

      <div class="action-buttons">
        <button class="new-product-btn" @click="openCreateModal">
          <span>Novo Administrador</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 6V18M18 12H6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
      </div>

      <AdminModal
        :visible="showCreateModal"
        title="Novo Administrador"
        confirmButtonText="Criar"
        @confirm="handleCreateAdmin"
        @close="closeCreateModal"
      />

      <AdminEdit
        v-if="editAdmin"
        :visible="!!editAdmin"
        :initialData="editAdmin"
        title="Editar Administrador"
        confirmButtonText="Salvar"
        @confirm="handleUpdateAdmin"
        @close="cancelEdit"
      />

      <DeleteAdminModal
        :visible="showDeleteModal"
        :adminName="adminToDelete?.name"
        @close="showDeleteModal = false"
        @confirm="deleteAdminConfirmed"
      />

      <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th class="col-nome">Nome</th>
              <th class="col-email">E-mail</th>
              <th class="col-nivel">Nível</th>
              <th class="col-edit">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="admins.length === 0">
              <td colspan="4" class="text-center">Nenhum administrador encontrado</td>
            </tr>
            <tr v-for="admin in admins" :key="admin.id" class="product-row">
              <td class="col-nome">
                {{ admin.name || 'Sem nome' }}
              </td>
              <td class="col-email">
                {{ admin.email || '-' }}
              </td>
              <td class="col-nivel">
                {{ admin.level || '-' }}
              </td>
              <td class="col-edit">
                <div class="action-buttons">
                  <button @click="startEdit(admin)" class="btn-icon" title="Editar">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z" fill="#718096"/>
                      <path d="M11.3787 5.79289L3 14.1716V17H5.82842L14.2071 8.62132L11.3787 5.79289Z" fill="#718096"/>
                    </svg>
                  </button>
                  <button @click="deleteAdmin(admin.id)" class="btn-icon" title="Excluir">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M5 7V16C5 17.1046 5.89543 18 7 18H13C14.1046 18 15 17.1046 15 16V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 7V5C8 3.89543 8.89543 3 10 3H10.5C11.6046 3 12.5 3.89543 12.5 5V7" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M2 7H18" stroke="#718096" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/css/Table.css';
import AdminModal from '@/components/Admin/AdminModal.vue';
import { ref, onMounted } from 'vue';
import axios from '@/utils/axios.js';
const API_URL = import.meta.env.VITE_API_URL;
const admins = ref([]);
const showCreateModal = ref(false);
const editAdmin = ref(null);
const showDeleteModal = ref(false);
const adminToDelete = ref(null);

function openCreateModal() {
  showCreateModal.value = true;
}

function closeCreateModal() {
  showCreateModal.value = false;
}

function startEdit(admin) {
  editAdmin.value = { ...admin };
}

function cancelEdit() {
  editAdmin.value = null;
}

async function handleCreateAdmin(formData) {
  try {
    const payload = {
      name: formData.name,
      email: formData.email || '',
      password: formData.password,
      level: formData.level || '-',
    };
    const response = await axios.post(`${API_URL}/admins/`, payload); 

    if (response.status === 201) {
      await fetchAdmins(); 
      closeCreateModal();
    } else {
      throw new Error(response?.data?.error || 'Erro desconhecido');
    }
  } catch (error) {
    console.error('Erro ao criar administrador:', error);
  }
}

async function handleUpdateAdmin(formData) {
  try {
    await axios.put(`${API_URL}/admins/${formData.id}`, {
      name: formData.name,
      email: formData.email,
      level: formData.level,
    });
    await fetchAdmins(); 
    cancelEdit();
  } catch (error) {
    console.error('Erro ao atualizar administrador:', error);
  }
}

function deleteAdmin(id) {
  adminToDelete.value = admins.value.find(a => a.id === id);
  showDeleteModal.value = true;
}

async function deleteAdminConfirmed() {
  if (!adminToDelete.value) return;
  try {
    await axios.delete(`${API_URL}/admins/${adminToDelete.value.id}`);
    await fetchAdmins(); 
    showDeleteModal.value = false;
    adminToDelete.value = null;
  } catch (error) {
    console.error('Erro ao deletar administrador:', error);
    showDeleteModal.value = false;
    adminToDelete.value = null;
  }
}

async function fetchAdmins() { 
  try {
    const res = await axios.get(`${API_URL}/admins/`); 
    console.log('Resposta da API:', res.data);
    let data = [];

    if (Array.isArray(res.data.admins)) {
      data = res.data.admins;
    } else if (Array.isArray(res.data.data)) {
      data = res.data.data;
    } else if (res.data.items) {
      data = res.data.items;
    } else if (Array.isArray(res.data)) {
      data = res.data;
    } else {
      console.warn('Estrutura de dados inesperada:', res.data);
    }

    admins.value = data.map(item => ({
      id: item.id || item._id,
      name: item.name || 'Sem nome',
      email: item.email || '',
      level: item.level || '-', 
    }));
  } catch (e) {
    console.error('Erro ao buscar administradores:', e); 
    admins.value = [];
  }
}

onMounted(fetchAdmins);
</script>

<style scoped>
@import '@/css/Table.css';
</style>