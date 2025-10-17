<template>
  <div class="estoque-container">
    <div class="header">
      <div class="back-icon" @click="$router.back()">
        <i class="fas fa-arrow-left"></i>
      </div>
      <h1>Relatórios Diários</h1>
    </div>

    <!-- Filtro por motorista -->
    <div class="filter-section">
      <label for="driverFilter">Filtrar por Motorista:</label>
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
    </div>

    <div
      v-for="(group, index) in groupedReports"
      :key="index"
      class="section"
    >
      <!-- Cabeçalho da data e motorista -->
      <div class="report-header">
        <div class="report-meta">
          <p><strong>Data:</strong> {{ formatDate(group.date) }}</p>
          <p><strong>Motorista:</strong> {{ group.driver }}</p>
          <p><strong>Placa:</strong> {{ group.plate }}</p>
        </div>
      </div>

      <!-- Tabela -->
      <div class="table-container">
        <table>
          <thead>
            <tr class="header-row">
              <th>Produto</th>
              <th>Saldo</th>
              <th>Entregue</th>
              <th>Sobra</th>
              <th>Anotação</th>
              <th>Diferença</th>
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
              <td>{{ report.delivered }}</td>
              <td>{{ report.surplus }}</td>
              <td>{{ report.notes || '-' }}</td>
              <td>
            <span
            :class="{
                'status-ok': calcDifference(report) === 0,
                'status-diff': calcDifference(report) !== 0
            }"
            >
            {{ calcDifference(report) === 0 ? 'OK' : `Diferença: ${calcDifference(report)}` }}
            </span>

              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL;

export default {
  name: "ReportsTable",
  data() {
    return {
      reports: [],
      selectedDriver: "",
      loading: true,
      error: null,
    };
  },
  computed: {
    filteredReports() {
      if (!this.selectedDriver) return this.reports;
      return this.reports.filter(
        (r) => r.driver_name === this.selectedDriver
      );
    },
    groupedReports() {
      const grouped = {};
      this.filteredReports.forEach((r) => {
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
    },
    uniqueDrivers() {
      const names = this.reports.map((r) => r.driver_name);
      return [...new Set(names)];
    },
  },
  methods: {
    calcDifference(report) {
    return report.product_saldo - report.delivered;
  },
    async fetchReports() {
      try {
        const response = await axios.get(`${API_URL}/reports`);
        this.reports = response.data;
      } catch (err) {
        this.error = err.message || "Erro ao buscar relatórios";
      } finally {
        this.loading = false;
      }
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
  mounted() {
    this.fetchReports();
  },
};
</script>

<style scoped>
@import '@/css/Table.css'
</style>

<style scoped>
/* --- Cabeçalho de cada relatório --- */
.report-header {
  background-color: #c6efce;
  border: 2px solid #6aa84f;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 10px;
}

.report-meta {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #333;
}

/* --- Filtro de motorista --- */
.filter-section {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  font-family: 'Poppins', sans-serif;
}

.filter-section label {
  font-weight: 600;
  color: #333;
}

.filter-section select {
  padding: 6px 10px;
  border-radius: 8px;
  border: 1px solid #ccc;
  font-size: 14px;
}

/* --- Cores estilo planilha --- */
th {
  background-color: #d9ead3;
  color: #333;
  border-bottom: 2px solid #b6d7a8;
}

td {
  text-align: center;
}

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
