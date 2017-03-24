<template>
  <div class="hello">
    <input id="file-upload"
           @change="onFileChange"
           accept="*"
           type="file">
    <el-row>
      <el-col :span="12">
        <div v-if="fileLineList">
          <el-row v-for="(line, index)  in fileLineList"
                  style="background-color:#3f556b"
                  :key="index">
            <el-col :span="1"
                    style="background-color:#34495e; color:#ecf0f1; text-align:right;padding-right:4px;">{{index}}.</el-col>
            <el-col :span="23"
                    v-html="line"></el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="12">
      </el-col>
    </el-row>
  </div>
</template>

<script>
import registers from '../assets/instructions.js'
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fileContent: '',
      file: '',
      htmlTemp: '',
      instructRegx: '(\\s*)?(\\w+)(\\s+)(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(;)(\\s*)(\\/\\/.*)?',
      commentRegx: '(\\s*)(\\/\\/.*)',
      labelRegx: '(\\s*)(\\.\\w+)(\\s+)(\\w+)(\\s*)(\\/\\/.*)?'
    }
  },
  filters: {
  },
  computed: {
    fileLineList: function () {
      if (this.fileContent === '') return ''
      let self = this
      let lineList = this.fileContent.split('\n')
      let newLineList = lineList.map(self.syntaxRegx)
      return newLineList
    }
  },
  methods: {
    onFileChange: function (e) {
      let self = this
      console.log(registers)
      let files = e.target.files || e.dataTransfer.files
      if (files.length === 1) {
        self.file = files[0]
      } else {
        return
      }

      let reader = new FileReader()
      reader.onload = function (e) {
        let contents = e.target.result
        self.fileContent = contents
      }
      reader.readAsText(self.file)
    },
    syntaxRegx: function (line) {
      let self = this
      let insRegx = new RegExp(self.instructRegx)
      let commRegx = new RegExp(self.commentRegx)
      let labelRegx = new RegExp(self.labelRegx)
      let stringList = insRegx.exec(line)
      let commList = commRegx.exec(line)
      let labelList = labelRegx.exec(line)
      if (stringList) {
        return self.getSyntax(stringList)
      } else if (labelList) {
        return self.getSyntax(labelList)
      } else if (commList) {
        return self.getSyntax(commList)
      } else {
        return line
      }
    },
    getSyntax: function (valueList) {
      let result = ''
      for (let i = 1; i < valueList.length; i++) {
        if (!valueList[i]) continue
        if (valueList[i].includes('//')) {
          result += ('<span style="color: #bdc3c7">' + valueList[i] + '</span>')
        } else if (valueList[i].includes('.')) {
          console.log(valueList[i])
          result += ('<span style="color: #27ae60">' + valueList[i] + '</span>')
        } else if (valueList[i].includes('$') || valueList[i].includes('x')) {
          result += ('<span style="color: #e67e22">' + valueList[i] + '</span>')
        } else if (valueList[i].includes('x')) {
          result += ('<span style="color: #2980b9">' + valueList[i] + '</span>')
        } else if (valueList[i].includes(',') || valueList[i].includes(';')) {
          result += ('<span style="color: #8e44ad">' + valueList[i] + '</span>')
        } else {
          result += ('<span style="color: #27ae60">' + valueList[i] + '</span>')
        }
      }
      return result
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
