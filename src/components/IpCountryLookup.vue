<template>
  <div class="ip-lookup-container">
    <div class="header">
      <h1>IP Lookup</h1>
    </div>
    <div class="content">
      <h2>Enter one or more addresses to get their country</h2>
      <button @click="addRow" class="add-button">
        <span class="plus-sign">+</span> Add
      </button>
      <div role="separator" />
      <ul>
        <li v-for="(row, index) in rows" :key="index" class="row-item">
          <div class="row">
            <div class="row-number">{{ index + 1 }}</div>
            <input
              v-model="row.value"
              class="ip-input"
              placeholder="Enter IP address"
              @focus="handleFocus(row)"
              @blur="handleBlur(row)"
              :readonly="isLookupInProgress(row.value)"
            />
            <LoadingIndicator v-if="isLookupInProgress(row.value)" />
            <span v-else-if="getLookupResult(row.value)" class="country-info">
              <template v-if="getLookupResult(row.value)!.type === IPLookupResultType.Success">
                <img :src="`https://flagcdn.com/${(getLookupResult(row.value) as SuccessResult).countryCode}.svg`" alt="flag" />
                <span class="time">
                  {{ getFormattedTime((getLookupResult(row.value) as SuccessResult).utcOffset) }}
                </span>
              </template>

              <template v-else-if="getLookupResult(row.value)!.type === IPLookupResultType.Error">
                <span class="warning">{{ (getLookupResult(row.value) as ErrorResult ).error }}</span>
              </template>

              <template v-else-if="getLookupResult(row.value)!.type === IPLookupResultType.Exception">
                <span class="error">An error occurred</span>
                <button @click="lookupCountry(row.value)">Retry</button>
              </template>
            </span>
          </div>
          <div v-if="getErrorMessage(row)" class="error">{{ getErrorMessage(row) }}</div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  type ErrorResult,
  IPLookupResultType,
  type IPLookupService,
  type SuccessResult
} from '@/components/IpLookup/IPLookupService'
import { useIpLookup } from '@/components/IpLookup/useIPCountryLookup';
import LoadingIndicator from '@/components/icons/LoadingIndicator.vue';
import { isValidIPAddress } from '@/components/IpLookup/utils';

const { ipLookupService } = defineProps<{
  ipLookupService: IPLookupService;
}>();

const ipLookup = useIpLookup(ipLookupService);

interface Row {
  value: string;
  hasFocus: boolean;
}

const rows = ref<Row[]>([{
  value: '',
  hasFocus: false,
}]);

const currentTime = ref<Date>(new Date());

onMounted(() => {
  setInterval(() => {
    currentTime.value = new Date();
  }, 500);
});

const addRow = () => {
  rows.value.push(reactive({
    value: '',
    hasFocus: false,
  }));
};

const getFormattedTime = (utcOffset: string) => {
  const offsetHours = parseInt(utcOffset.slice(0, 3), 10);
  const offsetMinutes = parseInt(utcOffset.slice(3), 10);
  const now = new Date(); // Get current time
  const utcTime = new Date(now.getTime() + now.getTimezoneOffset() * 60000); // Convert to UTC time

  utcTime.setUTCHours(utcTime.getUTCHours() + offsetHours);
  utcTime.setUTCMinutes(utcTime.getUTCMinutes() + offsetMinutes);

  return utcTime.toLocaleTimeString();
};

const withTrimmedInput = <Result,>(fn: (value: string) => Result): (value: string) => Result => (input: string) => {
  const value = input.trim();
  return fn(value);
};

const withValidIpAddress = <Result, Fallback = undefined>(fn: (value: string) => Result, fallback?: Fallback): (value: string) => Result | Fallback => withTrimmedInput((value: string) => {
  if (!isValidIPAddress(value)) {
    return fallback as Fallback;
  }
  return fn(value);
});

const getErrorMessage = (row: Row) => {
  const ip = row.value.trim();

  if (row.hasFocus || !ip) {
    return '';
  }
  if (!isValidIPAddress(ip)) {
    return 'Invalid IP address format';
  }
  return '';
};

const lookupCountry = withValidIpAddress(ipLookup.lookupCountry);

const isLookupInProgress = withValidIpAddress(ipLookup.isLookupInProgress, false);

const getLookupResult = withValidIpAddress(ipLookup.getLookupResult, null);

const handleFocus = (row: Row) => {
  row.hasFocus = true;
};

const handleBlur = (row: Row) => {
  row.hasFocus = false;
  lookupCountry(row.value);
};

</script>

<style scoped>
.ip-lookup-container {
  font-family: Arial, sans-serif;
  border: 1px solid #ccc;
  width: 400px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

[role=separator] {
  height: 1px;
  background-color: #ccc;
  align-self: stretch;
}

img[alt=flag] {
  height: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 20px;
  border-bottom: 1px solid #ccc;
}

.content {
  padding: 10px 20px;
  display: flex;
  flex-flow: column;
  gap: 10px;
  align-items: start;
}

h1 {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

h2 {
  font-size: 14px;
  color: #666;
}

.add-button {
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 5px 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.plus-sign {
  font-size: 20px;
  margin-right: 5px;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.row {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.warning {
  color: orange;
  font-size: 12px;
}

.error {
  color: red;
  font-size: 12px;
}

.row-number {
  background-color: #f0f0f0;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  font-weight: bold;
}

.ip-input {
  padding: 5px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  width: 200px;
}

.ip-input[readonly] {
  background-color: #fdfdfd;
  border: 1px solid #ddd;
  color: #ddd;
}

.country-info {
  display: flex;
  align-items: center;
}

img {
  margin-right: 10px;
}
</style>
