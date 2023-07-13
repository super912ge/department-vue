
<template>
  <el-upload v-model:file-list="fileList" class="upload-demo"
    action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15" multiple method="get"
    :on-preview="handlePreview" :on-remove="handleRemove" :before-remove="beforeRemove" :limit="2"
    :on-exceed="handleExceed" ref="treeRef">
    <el-button type="primary">Click to upload</el-button>
    <template #tip>
      <div class="el-upload__tip">
        Upload Camsis(first), Gao department file to compare department sturcture. The columns need to have code, name, parent_code, refresh page to reset.
      </div>
    </template>
  </el-upload>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as XLSX from 'xlsx';
import type { UploadProps, UploadUserFile } from 'element-plus'
import { MultiCodeItem, MultiParentItem, Node, SheetResult } from '~/type';




const emit = defineEmits(['uploadDep'])

function findRootNode(codeToNodeMap: Record<string, Node[]>): SheetResult {
  const result: SheetResult = {
    roots: [],
    multipleParents: [],
    multipleCodes: [],
    nameToCodes: {}
  };
  for (const code in codeToNodeMap) {
    let nodes = codeToNodeMap[code];

    if (nodes[0].parent.length === 0) {
      result.roots.push(nodes[0]);
    }
    if (nodes.length > 1) {

      const item: MultiParentItem = {
        code,
        name: nodes[0].name,
        parents: []
      }
      nodes.forEach(node => {
        item.parents.push(...node.parent.flatMap(n => n.label));
      });
      result.multipleParents.push(item);
    } else if (nodes[0].parent.length > 1) {
      const item: MultiParentItem = {
        code,
        name: nodes[0].name,
        parents: []
      }
      item.parents.push(...nodes[0].parent.flatMap(n => n.label));
      result.multipleParents.push(item);
    }
  }

  return result; // No root node found
}
function findMultipleName(nameToNodes: Record<string, string[]>): MultiCodeItem[] {
  const items: MultiCodeItem[] = [];
  for (const name in nameToNodes) {
    if (nameToNodes[name].length > 1) {
      items.push({ name, codes: nameToNodes[name] })
    }
  }
  return items;
}
const fileList = ref<UploadUserFile[]>([
])

const handleRemove: UploadProps['onRemove'] = (file, uploadFiles) => {
  console.log(file, uploadFiles)
}

const handlePreview: UploadProps['onPreview'] = (uploadFile) => {
  readExcelFile(uploadFile.raw as File);
}

const handleExceed: UploadProps['onExceed'] = (files, uploadFiles) => {
  ElMessage.warning(
    `The limit is 2, you selected ${files.length} files this time, add up to ${files.length + uploadFiles.length
    } totally`
  )
}

const beforeRemove: UploadProps['beforeRemove'] = (uploadFile, uploadFiles) => {
  return ElMessageBox.confirm(
    `Cancel the transfer of ${uploadFile.name} ?`
  ).then(
    () => true,
    () => false
  )
}

function readExcelFile(file: File) {
  const reader = new FileReader();
  reader.onload = (e) => {
    if (e.target == null) return;
    const result = e.target.result;
    const workbook = XLSX.read(result, {
      type: 'binary',
    });

    let data = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]]
    ) as {
      code: string;
      name: string;
      parent_code?: string;
    }[];

    const codeToNodeMap: Record<string, Node[]> = {};
    let rest = [];
    let count = 0;
    const nameToCode: Record<string, string[]> = {};
    data.forEach((row) => {
      const code = row.code;
      const name = row.name;
      if (!nameToCode[name]) {
        nameToCode[name] = [code]
      } else {
        if (!nameToCode[name].includes(code)) {
          nameToCode[name].push(code);
        }
      }
    })

    while (data.length > 1 && count < 10) {

      count++;

      data.forEach((row, index) => {
        const code = row.code.toString();
        const name = row.name.toString();
        const cleanParentCode = row.parent_code.trim().replace(/[^a-zA-Z0-9 ]/g, '');

        const parentCode = (cleanParentCode.trim() !== '' && cleanParentCode != "N") ? cleanParentCode : undefined;
        const label = `${name} - ${code}`;
        const node: Node = {
          id: index,
          code,
          name,
          parent: [],
          children: [],
          label,
        };
        if (!parentCode) {

          if (!codeToNodeMap[code])
            codeToNodeMap[code] = [node];
          else
            codeToNodeMap[code].push(node);
        } else if (codeToNodeMap[parentCode]) {

          if (!codeToNodeMap[code]) {
            codeToNodeMap[code] = [node];
          }
          else {
            codeToNodeMap[code].push(node);
          }
          const parentNode = codeToNodeMap[parentCode];
          parentNode.forEach((p) => {
            p.children.push(node);
            node.parent.push(p);
          })

        } else {
          rest.push(row);
        }
      });
      data = rest;
      rest = [];
    }
    const sheetResult = findRootNode(codeToNodeMap);

    sheetResult.multipleCodes = findMultipleName(nameToCode);
    sheetResult.nameToCodes = nameToCode;

    emit('uploadDep', sheetResult);

  };
  reader.onerror = (ex) => {
    console.log(ex);
  };
  reader.readAsBinaryString(file);
}

</script>
  