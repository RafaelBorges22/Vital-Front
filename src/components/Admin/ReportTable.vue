<template>
  <div class="estoque-container">
    <div class="header">
      <div class="back-icon" @click="$router.back()" style="cursor:pointer;">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M15 18L9 12L15 6" stroke="#000A1A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </div>
      <h1>Relatórios Diários</h1>
    </div>
    <button @click="showModal = true" class="btn new-product-btn">
      Criar Relatório +
    </button>

    <div class="filter-section">
      <label for="driverFilter">Filtrar por Motorista:</label>
      <div class="select-wrapper">
        <select id="driverFilter" v-model="selectedDriver">
          <option value="">Todos</option>
          <option
            v-for="driver in uniqueDrivers"
            :key="driver"
            :value="driver"
          >
            {{ driver }}
          </option>
        </select>
        <svg class="dropdown-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </div>

    <div
      v-for="(group, index) in groupedReports"
      :key="index"
      class="section"
    >
      <div class="report-header">
        <div class="report-meta">
          <p><strong>Data:</strong> {{ formatDate(group.date) }}</p>
          <p><strong>Motorista:</strong> {{ group.driver }}</p>
          <p><strong>Placa:</strong> {{ group.plate }}</p>
        </div>
      </div>

      <div class="table-container">
        <table style="width:100%; border-collapse:collapse;">
          <thead>
            <tr class="header-row">
              <th>Produto</th>
              <th>Saldo</th>
              <th>Entregue</th>
              <th>Sobra</th>
              <th>Anotação</th>
              <th>Diferença</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="report in group.items"
              :key="report.report_id"
              class="product-row"
            >
              <td>{{ report.products_name }}</td>
              <td>{{ report.product_saldo }}</td>
              
              <td>
                <template v-if="editReport && editReport.report_id === report.report_id">
                    <input v-model.number="editReport.delivered" type="number" min="0" class="form-input-inline" />
                </template>
                <template v-else>
                    {{ report.delivered }}
                </template>
              </td>
              
              <td>
                {{ calcSurplus(editReport && editReport.report_id === report.report_id ? editReport : report) }}
              </td>
              
              <td>
                <template v-if="editReport && editReport.report_id === report.report_id">
                    <input v-model.trim="editReport.notes" class="form-input-inline" />
                </template>
                <template v-else>
                    {{ report.notes || '-' }}
                </template>
              </td>
              
              <td>
                <span
                  :class="{
                      'status-ok': isReportOK(editReport && editReport.report_id === report.report_id ? editReport : report),
                      'status-diff': !isReportOK(editReport && editReport.report_id === report.report_id ? editReport : report)
                  }"
                >
                  {{ isReportOK(editReport && editReport.report_id === report.report_id ? editReport : report) ? 'OK' : 'Diferença' }}
                </span>
              </td>

              <td class="col-edit">
                <div class="action-buttons">
                    <template v-if="editReport && editReport.report_id === report.report_id">
                        <button @click="handleUpdateReport(editReport)" class="btn-icon" title="Salvar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12L10 17L20 7" stroke="#48BB78" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <button @click="cancelEdit" class="btn-icon" title="Cancelar">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18" stroke="#F56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6L18 18" stroke="#F56565" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </template>
                    <template v-else>
                        <button @click="startEdit(report)" class="btn-icon" title="Editar">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M13.5 6.5L16.5 9.5L9.5 16.5L6.5 13.5L13.5 6.5Z" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M13.5 6.5L6.5 13.5" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M16 10L14 8" stroke="#3182CE" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                    </template>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <ReportModal 
          :visible="showModal"
          @close="showModal = false"
          @report-generated="handleReportGenerated"
          @api-error="handleApiError"
          />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineExpose } from 'vue';
import axios from "axios";
import ReportModal from '@/components/Report/ReportModal.vue'; 

const API_URL = import.meta.env.VITE_API_URL;

const reports = ref([]);
const selectedDriver = ref("");
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const editReport = ref(null); 

const calcSurplus = (report) => {
  return (report.product_saldo || 0) - (report.delivered || 0);
};


const isReportOK = (report) => {
    const surplus = calcSurplus(report);

    let notesValue = (report.notes || '').toString().trim();

    return surplus.toString() === notesValue; 
};


const fetchReports = async () => {
  try {
    loading.value = true;
    const response = await axios.get(`${API_URL}/reports`);
    
    let reportsData = response.data;
    
    if (reportsData && reportsData.data && Array.isArray(reportsData.data)) {
        reportsData = reportsData.data;
    } 

    reportsData.sort((a, b) => {
        return b.report_id - a.report_id;
    });
    reports.value = reportsData;

  } catch (err) {
    error.value = err.message || "Erro ao buscar relatórios";
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const filteredReports = computed(() => {
  if (!selectedDriver.value) return reports.value;
  return reports.value.filter(
    (r) => r.driver_name === selectedDriver.value
  );
});

const groupedReports = computed(() => {
  const grouped = {};
  filteredReports.value.forEach((r) => {
    const key = `${r.report_date}-${r.driver_name}-${r.vehicle_plate}`;
    if (!grouped[key]) {
      grouped[key] = {
        date: r.report_date,
        driver: r.driver_name,
        plate: r.vehicle_plate,
        items: [],
      };
    }
    grouped[key].items.push(r);
  });
  return Object.values(grouped);
});

const uniqueDrivers = computed(() => {
  const names = reports.value.map((r) => r.driver_name);
  return [...new Set(names)];
});

const startEdit = (report) => {
    editReport.value = { 
      ...report,
      surplus: calcSurplus(report) 
    };
};

const cancelEdit = () => {
    editReport.value = null;
};

const handleUpdateReport = async (report) => {
    try {
        const dataForUpdate = {
            delivered: parseFloat(report.delivered) || 0,
            notes: report.notes || '',

        };
        await axios.put(`${API_URL}/reports/${report.report_id}`, dataForUpdate);

        await fetchReports();
        cancelEdit();
    } catch (e) {
        console.error('Erro ao atualizar relatório:', e);
    }
};


const handleReportGenerated = (reportData) => {
    console.log('Relatório gerado com sucesso:', reportData);
    showModal.value = false; 

    fetchReports(); 
    alert('Relatório gerado com sucesso! Tabela atualizada.'); 
};

const handleApiError = (errorMessage) => {
    console.error('Erro na API ao gerar relatório:', errorMessage);
    alert(`Erro ao gerar relatório: ${errorMessage}`);
};

onMounted(() => {
  fetchReports();
});
defineExpose({
    fetchReports 
});
</script>

<style scoped>
@import '@/css/Table.css';

.form-input-inline {
    width: 100%;
    padding: 2px 5px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 13px;
    text-align: center;
}

/* --- ESTILO DO BOTÃO CRIAR (Ajustado para o estilo do ProductsTable) --- */
.new-product-btn {
    background-color: #6BB200; 
    color: white;
    padding: 10px 18px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: 600;
    font-size: 14px;
    transition: background-color 0.3s;
    margin-bottom: 20px; 
    box-shadow: 0 4px 8px rgba(107, 178, 0, 0.3);
}

.new-product-btn:hover {
    background-color: #5A9900;
}

/* --- ESTILO DO HEADER DE CADA RELATÓRIO (Aprimorado) --- */
.report-header {
  /* Fundo mais claro e borda suave */
  background-color: #f0f4f8; 
  border: 1px solid #c0ccda;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.report-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 15px; /* Aumento do espaçamento */
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
}

.report-meta p strong {
    color: #000A1A; /* Destaca os títulos */
    font-weight: 700;
}

/* --- FILTRO DE MOTORISTA ESTILIZADO (Melhorado com select-wrapper) --- */
.filter-section {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
  padding: 15px 20px;
  background-color: #FFFFFF; /* Fundo branco ou claro */
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  font-family: 'Poppins', sans-serif;
}

.filter-section label {
  font-weight: 600;
  color: #000A1A;
  font-size: 14px;
  white-space: nowrap;
}

.select-wrapper {
  position: relative;
  flex-grow: 1; 
  max-width: 300px;
}

.filter-section select {
  width: 100%;
  padding: 10px 35px 10px 15px; /* Aumenta o padding para o ícone */
  border-radius: 8px;
  border: 1px solid #c0ccda; 
  font-size: 14px;
  background-color: #FFFFFF;
  
  /* Remove o ícone padrão do navegador */
  -webkit-appearance: none; 
  -moz-appearance: none; 
  appearance: none; 
  cursor: pointer;
  transition: border-color 0.2s;
}

.filter-section select:hover {
  border-color: #6BB200;
}

.filter-section select:focus {
  outline: none;
  border-color: #48BB78;
  box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.2);
}

.dropdown-icon {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  color: #4a5568;
  pointer-events: none; /* Garante que o clique no ícone ative o select */
}


/* --- CORES DE STATUS DA TABELA (Mantidas) --- */
.status-ok {
  background-color: #fff2cc;
  color: #333;
  border: 1px solid #e6b800;
  border-radius: 6px;
  padding: 4px 10px;
  font-weight: 600;
}

.status-diff {
  background-color: #f4cccc;
  color: #a61c00;
  border: 1px solid #cc0000;
  border-radius: 6px;
  padding: 4px 10px;
  font-weight: 600;
}
</style>