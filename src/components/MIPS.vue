<template>
  <div class="hello">
    <input id="file-upload" @change="onFileChange" accept="text/*" type="file" >
    <ol v-if="fileLineList">
      <div v-for="line in fileLineList" contenteditable="true" v-html="line"></div>
    </ol>
    <li v-html="htmlTemp"></li>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fileContent: '',
      file: '',
      htmlTemp: '',
      instructRegx: '(\\s*)?(\\w+)(\\s+)(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(;)(\\s*)(\\/\\/.*)?',
      commentRegx: '(\\s*)(\\/\\/.*)'
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
      let files = e.target.files || e.dataTransfer.files
      if (files.length === 1) {
        self.file = files[0]
        console.log('asdf')
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
      let stringList = insRegx.exec(line)
      let commList = commRegx.exec(line)
      console.log(stringList)
      console.log(commList)
      if (stringList) {
        return self.getSyntax(stringList)
      } else if (commList) {
        return self.getSyntax(commList)
      } else {
        return line
      }
    },
    getSyntax: function (valueList) {
      let result = ''
      console.log(valueList)
      for (let i = 1; i < valueList.length; i++) {
        if (!valueList[i]) continue
        if (valueList[i].includes('//')) {
          result += ('<span style="color: #bdc3c7">' + valueList[i] + '</span>')
        } else if (valueList[i].includes('$') || valueList[i].includes('x')) {
          result += ('<span style="color: #e67e22">' + valueList[i] + '</span>')
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
