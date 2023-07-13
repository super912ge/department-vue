<template>
    <h3>Multiple codes found for same name</h3>
    <el-table :data="data" size="large">
        <el-table-column prop="name" label="Name"  />
        <el-table-column prop="code" label="Codes">
            <template #default="scope">
            <p v-for="(p, index) in scope.row.codes" :key="index" style="margin: 5px;">
                {{p}}
            </p>
        </template>
         </el-table-column>
    </el-table>
</template>
  
<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  data: {
    type: Array as PropType<any[]>,
  },
  
})
</script>
  