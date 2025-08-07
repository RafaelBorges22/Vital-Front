<template>
  <div>
    <div class="modal">
      <h2 class="title">Gerar Certificado</h2>
      <form @submit.prevent="generatePDF">
        <label>
          Nome:
          <input v-model="form.nome" required />
        </label>

        <label>
          Forma de Pagamento:
          <select v-model="form.pagamento" required>
            <option value="">Selecione</option>
            <option value="produto">Produtos</option>
            <option value="dinheiro">Dinheiro</option>
            <option value="cartao">Cartão</option>
            <option value="pix">Pix</option>
          </select>
        </label>

        <label>
          Endereço:
          <input v-model="form.endereco" required />
        </label>

        <label>
          Data:
          <input type="date" v-model="form.data" required />
        </label>

        <label>
          CNPJ:
          <input type="text" v-model="form.cnpj" required />
        </label>

        <fieldset>
          <legend>Produtos</legend>
          <div v-for="(produto, index) in form.produtos" :key="index" class="produto-item">
            <label>{{ produto.nome }}:</label>
            <input
              type="number"
              v-model.number="produto.quantidade"
              min="0"
              placeholder="Quantidade"
            />
          </div>
        </fieldset>

        <div class="actions">
          <button type="submit">Gerar PDF</button>
          <button type="button" @click="close">Cancelar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import jsPDF from 'jspdf'
import backLogo from '../assets/logo.png'
import '../css/Component.css'

const emit = defineEmits(['close'])

const form = ref({
  nome: '',
  pagamento: '',
  endereco: '',
  data: '',
  cnpj: '',
  produtos: [
    { nome: 'Detergente YPE 500ml', quantidade: 0 },
    { nome: 'Desinfetante 5 litros', quantidade: 0 },
    { nome: 'Limpa alumínio 5 litros', quantidade: 0 },
    { nome: 'Detergente Limpol 500ml', quantidade: 0 },
    { nome: 'Água Sanitária', quantidade: 0 },
    { nome: 'Detergente 5 litros', quantidade: 0 },
    { nome: 'Limpa Chapa 5 litros', quantidade: 0 },
    { nome: 'Pano alvejado', quantidade: 0 },
    { nome: 'Multiuso', quantidade: 0 },
    { nome: 'Vassoura', quantidade: 0 },
    { nome: 'Saco de lixo', quantidade: 0 },
    { nome: 'Pasta de brilho', quantidade: 0 },
    { nome: 'Rodo', quantidade: 0 },
  ],
})

function close() {
  emit('close')
}

function generatePDF() {
  const doc = new jsPDF()

  const backgroundLogo = new Image()
  backgroundLogo.src = backLogo

  backgroundLogo.onload = () => {
    doc.addImage(backLogo, 'PNG', 0, 75, 210, 297)
    renderPDF(doc)
  }

  background.onerror = () => {
    console.warn('Imagem de fundo não carregada. Gerando PDF sem imagem.')
    renderPDF(doc)
  }
}

function renderPDF(doc) {
  doc.setTextColor('#4D3E3E') 

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Vital Reciclagem', 20, 15)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('CNPJ: 16.948.339/0001-54', 150, 20)
  doc.text('Licença Cetesb: 100-217884-4', 150, 25)
  doc.text('E-mail: contato@vitalreciclagem.com', 150, 30)
  doc.text('Tels.: 11 2707-3696 / 11 94794-5346', 150, 35)

  let y = 45
  doc.setFontSize(12)
  doc.text('Certificamos para os devidos fins que os resíduos de óleo de fritura usado foram entregues', 20, y)
  y += 6
  doc.text('à Vital Reciclagem para fabricação de biodiesel, conforme legislação vigente.', 20, y)
  y += 6
  doc.text('A Vital Reciclagem está ciente das obrigações previstas na Lei Federal nº 9.605 de 12/02/2015', 20, y)
  y += 6
  doc.text('(Lei de Crimes Ambientais), atendendo a todas as legislações específicas municipais e estaduais.', 20, y)

  y += 12
  doc.setFontSize(16)
  doc.setFont('helvetica', 'normal')
  doc.text('Dados do Cliente', 20, y)

  doc.setFontSize(12)
  y += 10
  doc.text(`Nome: ${form.value.nome}`, 20, y)
  y += 10
  doc.text(`Forma de Pagamento: ${form.value.pagamento}`, 20, y)
  y += 10
  doc.text(`Endereço: ${form.value.endereco}`, 20, y)
  y += 10
  doc.text(`Data: ${form.value.data}`, 20, y)
  y += 10
  doc.text(`CNPJ: ${form.value.cnpj}`, 20, y)

  y += 10
  doc.text('Produtos:', 20, y)
  y += 8

  form.value.produtos.forEach(produto => {
    if (produto.quantidade > 0) {
      doc.text(`${produto.nome} - Quantidade: ${produto.quantidade}`, 30, y)
      y += 7
    }
  })

  y += 10
  doc.text('_________________________________', 20, y)
  doc.text('EMPRESA', 30, y + 6)

  doc.text('_________________________________', 120, y)
  doc.text('FORNECEDOR', 130, y + 6)

  doc.setFontSize(9)
  doc.text('@vitalreciclagem', 20, 280)
  doc.text('www.vitalreciclagem.com', 150, 280)

  doc.save('CertificadoVital.pdf')
  close()
}
</script>

<style>
@import '../css/Component.css';
</style>
