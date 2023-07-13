<script setup lang="ts">
import { ref } from "vue";
import { ElMessage } from "element-plus";
import { SheetResult, SameNameItem } from "~/type";

defineProps<{ msg: string }>();

const count = ref(0);
const input = ref("element-plus");
const tree = ref([]);
const multiParentItems = ref([]);
const multiCodeItems = ref([]);
const sameNameDiffCodes = ref([]);
const nameToCodes = [];
const name1NotFound = [];
const name2NotFound = [];
const curDate = ref("");
const similarityItems = ref([])
const name1NoSim = ref([]);
const name2NoSim = ref([]);

const toast = () => {
  ElMessage.success("Hello");
};
const handleTree = (result: SheetResult) => {
  tree.value.push(result.roots);
  // console.log("tree pass, multi parents", result.multipleParents);
  multiParentItems.value.push(result.multipleParents);
  multiCodeItems.value.push(result.multipleCodes);
  nameToCodes.push(result.nameToCodes);
  compareSameName();
  findSimilar();
};

function compareSameName() {
  if (nameToCodes.length > 1) {
    for (const name in nameToCodes[0]) {
      const node1 = nameToCodes[0][name];
      const node2 = nameToCodes[1][name];
      if (node2) {
        const item: SameNameItem = {
          name,
          code1: node1,
          code2: node2,
          identical: node1[0] === node2[0]
        }
        sameNameDiffCodes.value.push(item);
      } else {
        name1NotFound.push(name);
      }
    }
    for (const name in nameToCodes[1]) {
      const node1 = nameToCodes[0][name];
      if (!node1) {
        name2NotFound.push(name);
      }
    }
  }
}

function findSimilar() {
  if (name1NotFound.length > 0 && name2NotFound.length > 0) {
    const keyword1 = []
    for (const name of name1NotFound) {
      const keyword = convertToKeyword(name);
      keyword1.push(keyword);
    }

    const keyword2 = []
    const sim2Found = []
    for (const name of name2NotFound) {
      const keyword = convertToKeyword(name);
      keyword2.push(keyword);
    }
    for (const keyword of keyword1) {
      let max = 0.0;
      let similiarWord;
      const name1 = name1NotFound[keyword1.indexOf(keyword)];
      for (const otherKeyword of keyword2) {
        let similarity = compareStringArray(keyword, otherKeyword);
        if (similarity > 0.4) {
          if (max < similarity) {
            max = similarity;
            similiarWord = otherKeyword;
          }
        }
      }
      if (similiarWord) {

        const name2 = name2NotFound[keyword2.indexOf(similiarWord)];
        sim2Found.push(name2);
        const similarityItem = {
          name1,
          name2,
          codes1: nameToCodes[0][name1],
          codes2: nameToCodes[1][name2],
          similarity: max
        }
        similarityItems.value.push(similarityItem);
      } else {
        name1NoSim.value.push(name1);
      }
    }
    for (const name of name2NotFound) {
      if (!sim2Found.includes(name)) {
        name2NoSim.value.push(name);
      }
    }
  }
  function convertToKeyword(name) {
    return name.toLocaleLowerCase().replaceAll(',', ' ').replaceAll('department', '').replaceAll(/[^a-zA-Z0-9 ]/g, ' ').replaceAll('school', '').replaceAll('engineering', '').replaceAll('the', '')
      .replaceAll('faculty', '').replaceAll('science', '').replaceAll('of', '').replaceAll('and', '').replaceAll('for', '').replaceAll(' s', '').replaceAll('dept', '')
      .replaceAll('centre', '').replaceAll('institute', '').replaceAll('division', '').replaceAll('studies', '').trim().replaceAll(/\s+/g, ' ').split(' ');
  }
  function compareStringArray(arr1, arr2) {
    let count1 = 0.0;
    let count2 = 0.0;
    for (const word of arr1) {
      const similiarWord = arr2.filter(w => w === word || w.includes(word));
      if (similiarWord.length > 0) {
        count1++;
      }
    }
    for (const word of arr2) {
      const similiarWord = arr1.filter(w => w === word || w.includes(word));
      if (similiarWord.length > 0) {
        count2++;
      }
    }
    return ((count1 / arr1.length) + (count2 / arr2.length)) / 2;
  }
}
</script>

<template>
  <h1 color="$ep-color-primary">{{ msg }}</h1>

  <FileUploader @uploadDep="handleTree" />
  <el-row>
    <el-col :span="10" :offset="1" v-if="tree.length > 0" v-for="(item, index) in tree" :key="index">
      <DepartmentTree :data="item" />
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="10" :offset="1" v-if="multiParentItems.length > 0" v-for="(item, index) in multiParentItems"
      :key="index">
      <MultiparentTable :data="item" />
    </el-col>

  </el-row>
  <el-row>
    <el-col :span="10" :offset="1" v-if="multiCodeItems.length > 0" v-for="(item, index) in multiCodeItems" :key="index">
      <MultiCodeTable :data="item" />
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="10" :offset="1">
      <SameCodeTable v-if="sameNameDiffCodes.length > 0" :data="sameNameDiffCodes" />
    </el-col>
  </el-row>
  <el-row>
    <el-col :span="16" :offset="1">
      <SimilarNameTable v-if="similarityItems.length > 0" :data="similarityItems" />
    </el-col>
  </el-row>
  <el-row style="margin-bottom: 30px;" v-if="name1NoSim.length > 0">
    <el-col :span="11" :offset="1">
      <h4>College</h4>
      <p>{{ name1NoSim.filter(i => i.toLowerCase().includes('college')).join(', ') }}</p>
      <h4>Museum</h4>
      <p>{{ name1NoSim.filter(i => i.toLowerCase().includes('museum')).join(', ') }}</p>
      <h4>Departments</h4>
      <p>{{ name1NoSim.filter(i => i.toLowerCase().includes('dep')).join(', ') }}</p>
      <h4>Centre</h4>
      <p>{{ name1NoSim.filter(i => i.toLowerCase().includes('cent')).join(', ') }}</p>
      <h4>Institution</h4>
      <p>{{ name1NoSim.filter(i => i.toLowerCase().includes('inst')).join(', ') }}</p>
      <h4>Committee</h4>
      <p>{{ name1NoSim.filter(i => i.toLowerCase().includes('commi')).join(', ') }}</p>
      <h4>Ohter</h4>
      <p> {{ name1NoSim.filter(i =>!i.toLowerCase().includes('college') && !i.toLowerCase().includes('museum') 
      && !i.toLowerCase().includes('dep') &&!i.toLowerCase().includes('cent') &&  !i.toLowerCase().includes('inst') 
      && !i.toLowerCase().includes('commi')).join(', ')}}</p>

    </el-col>
    <el-col :span="11" :offset="1">
      <h4>College</h4>
      <p>{{ name2NoSim.filter(i => i.toLowerCase().includes('college')).join(', ') }}</p>
      <h4>Museum</h4>
      <p>{{ name2NoSim.filter(i => i.toLowerCase().includes('museum')).join(', ') }}</p>
      <h4>Departments</h4>
      <p>{{ name2NoSim.filter(i => i.toLowerCase().includes('dep')).join(', ') }}</p>
      <h4>Centre</h4>
      <p>{{ name2NoSim.filter(i => i.toLowerCase().includes('cent')).join(', ') }}</p>
      <h4>Institution</h4>
      <p>{{ name2NoSim.filter(i => i.toLowerCase().includes('inst')).join(', ') }}</p>
      <h4>Committee</h4>
      <p>{{ name2NoSim.filter(i => i.toLowerCase().includes('commi')).join(', ') }}</p>
      <h4>Ohter</h4>
      <p> {{ name2NoSim.filter(i =>!i.toLowerCase().includes('college') && !i.toLowerCase().includes('museum') 
      && !i.toLowerCase().includes('dep') &&!i.toLowerCase().includes('cent') &&  
      !i.toLowerCase().includes('inst') && !i.toLowerCase().includes('commi')).join(', ')}}</p>
    </el-col>
  </el-row>
</template>

<style>
.ep-button {
  margin: 4px;
}

.ep-button+.ep-button {
  margin-left: 0;
  margin: 4px;
}
</style>
