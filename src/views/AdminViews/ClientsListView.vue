<template>
    <div class="blank-page">
        <ClientList />
        <Sidebar />
    </div> 
</template>   
<script setup>
import ClientList from '@/components/Clients/ClientsTable.vue';
import Sidebar from '@/components/Admin/Sidebar.vue';
</script>