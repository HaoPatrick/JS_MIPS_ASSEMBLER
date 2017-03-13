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
      if (stringList) {
        let result = ''
        for (let i = 1; i < stringList.length; i++) {
          if (!stringList[i]) continue
          if (stringList[i].includes('$')) {
            result += ('<span style="color: #e67e22">' + stringList[i] + '</span>')
          } else if (stringList[i].includes(',') || stringList[i].includes(';')) {
            result += ('<span style="color: #8e44ad">' + stringList[i] + '</span>')
          } else if (stringList[i].includes('//')) {
            console.log('comment')
            result += ('<span style="color: #bdc3c7">' + stringList[i] + '</span>')
          } else {
            result += ('<span style="color: #27ae60">' + stringList[i] + '</span>')
          }
        }
        return result
      } else {
        return line
      }
    },
    getSyntax: function (value) {

    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
