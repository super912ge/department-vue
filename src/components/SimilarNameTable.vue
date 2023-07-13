<template>
    <h3>Departments in two system with similiar name</h3>
    <el-table :data="data" size="large">
     
        <el-table-column prop="name1" label="Camsis Name" />
        <el-table-column label="Camsis Code" width="150">
            <template #default="scope">
                <p v-for="(p, index) in scope.row.codes1" :key="index" style="margin: 5px;">
                    {{p}}
                </p>
            </template>
         </el-table-column>
         <el-table-column prop="name2" label="Gao Name" />
         <el-table-column label="Gao Codes" width="150">
            <template #default="scope">
                <p v-for="(p, index) in scope.row.codes2" :key="index" style="margin: 5px;">
                    {{p}}
                </p>
            </template>
         </el-table-column>
         <el-table-column sortable prop="similarity" label="Similarity"/>
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
<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
  background-color: #e6a23c;
}
</style>
  