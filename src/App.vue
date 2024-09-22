<script setup lang="ts">
import IpCountryLookup from '@/components/IpCountryLookup.vue';
import { IpApiService } from '@/components/IpLookup/IpApiService';

const ipLookupService = new IpApiService();
</script>

<template>
  <main>
    <IpCountryLookup :ipLookupService="ipLookupService" />
  </main>
</template>

<style scoped>
</style>
