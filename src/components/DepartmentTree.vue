<template>
  <div>
    <h1>Department Tree </h1>
    <el-input v-model="filterText" placeholder="Filter keyword" />
    <el-tree :data="data" ref="treeRef"  :filter-node-method="filterNode" :props="defaultProps"
      @node-click="handleNodeClick" />
  </div>
</template>
  
<script lang="ts" setup>
import { ElTree } from 'element-plus'
import { PropType, ref, watch } from 'vue'
import { Node } from '../type'

interface Tree {
  label: string
  children?: Tree[]
}

const handleNodeClick = (data: Tree) => {
  console.log(data)
}
const filterText = ref('');
watch(filterText, (val) => {
  treeRef.value!.filter(val)
})
const treeRef = ref<InstanceType<typeof ElTree>>()

const filterNode = (value: string, data: Node | any) => {
  if (!value) return true
  return data.label.toLowerCase().includes(value.toLowerCase())
}


defineProps({
  data: {
    type: Array as PropType<any[]>,
  },

})
const defaultProps = {
  children: 'children',
  label: 'label',
}
</script>
<style>
/* .dep {
    float: left;;
    width: 40%;
  } */
</style>