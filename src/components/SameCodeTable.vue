<template>
    <h3>Departments in two system with same name</h3>
    <el-table :data="data" size="large" :row-class-name="tableRowClassName">
     
        <el-table-column prop="name" label="Name" />
        <el-table-column label="Camsis Codes"  width="150">
            <template #default="scope">
                <p v-for="(p, index) in scope.row.code1" :key="index" style="margin: 5px;">
                    {{p}}
                </p>
            </template>
         </el-table-column>
         <el-table-column label="Gao Codes"  width="150">
            <template #default="scope">
                <p v-for="(p, index) in scope.row.code2" :key="index" style="margin: 5px;">
                    {{p}}
                </p>
            </template>
         </el-table-column>
         <el-table-column prop="identical" label="Identical"  :filters="[
        { text: 'Show Identical', value: 'true' },
        { text: 'Show Different', value: 'false' },
      ]"
      :filter-method="filterSame"
      />
    </el-table>
</template>
  
<script lang="ts" setup>
import { PropType } from 'vue';

defineProps({
  data: {
    type: Array as PropType<any[]>,
  },

})
const filterSame = (value, row: any) => {
   return row.identical.toString() === value
}
const tableRowClassName = ({row, index}:{row: any, index: number}) => {
    if(row.identical) return '';
    else return 'warning-row'
  };
</script>
<style>
.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
  background-color: #e6a23c;
}
</style>
  