<template>
  <div class="hello">
    <input id="file-upload"
           @change="onFileChange"
           accept="*"
           type="file">
    <input type="button"
           @click="processSymbols"
           value="symbols">
    <input type="button"
           @click="replaceWithIns"
           value="replace">
    <el-row>
      <el-col :span="12">
        <div v-if="fileLineList"
             style="font-family:consolas">
          <el-row v-for="(line, index)  in fileLineList"
                  style="background-color:#3f556b"
                  :key="index">
            <el-col :span="1"
                    style="background-color:#34495e;
                                                                                                                                                                                                                                                                                                                                                                                                 color:#ecf0f1; text-align:right;
                                                                                                                                                                                                                                                                                                                                                                                                 padding-right:4px;">{{index}}</el-col>
            <el-col :span="23"
                    style="padding-left:8px;color:#ecf0f1;"
                    v-html="line"></el-col>
          </el-row>
        </div>
      </el-col>
      <el-col :span="12">
        <p v-if="symbols"
           v-for="(prop,value,index) in symbols">
          {{prop}} - {{value}} - {{index}}
        </p>
        <p v-for="line in assembleCode">{{line}}</p>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import constants from '../assets/instructions.js'
export default {
  name: 'hello',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      fileContent: '',
      fileLineList: [],
      validLines: [],
      assembleCode: [],
      file: '',
      symbols: {},
      htmlTemp: '',
      instructRegx: '(\\s*)?(\\w+)(\\s+)(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(\\s*)(\\/\\/.*)?',
      commentRegx: '(\\s*)(\\#.*)',
      labelRegx: '(\\s*)(\\.\\w+)(\\s+)(\\w+)(\\s*)(\\/\\/.*)?'
    }
  },
  filters: {
  },
  computed: {
  },
  methods: {
    onFileChange: function (e) {
      let self = this
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
        self.fileLineList = contents.split('\n')
        self.validLines = self.fileLineList.filter(
          value => {
            return value !== '' && value !== '\r'
          }
        )
      }
      reader.readAsText(self.file)
    },
    processSymbols: function () {
      let self = this
      let allFileLines = self.validLines
      let newSymbol = {}
      allFileLines.forEach(
        (line, index) => {
          if (!line) {
            return
          }
          let insList = line
          if (line.includes(':')) {
            insList = line.replace(':', ' ').split(' ')
            insList.filter(
              value => {
                return value !== ''
              }
            )
            newSymbol[insList[0]] = index
            // newSymbol.push({ key: insList[0], value: index })
          }
        }
      )
      self.symbols = newSymbol
    },
    replaceWithIns: function () {
      let self = this
      let allFileLines = self.validLines
      allFileLines.forEach(
        (line, index) => {
          if (!line) {
            return
          }
          if (line.includes(':')) {
            return
          }
          let insList = line.replace(/,/g, ' ').split(' ')
          let hasPostOperand = false
          let resultAssembleLine = ''
          for (let wordIndex in insList) {
            let currentWord = insList[wordIndex].trim()
            if (!currentWord) continue

            let instrc = self.wordIsIns(currentWord)
            if (instrc) {
              if (instrc.code1) {
                hasPostOperand = instrc.code1.toString(2)
              }
              resultAssembleLine += instrc.code.toString(2)
              continue
            }
            if (currentWord.includes('$')) {
              if (/^(-|\+)?([0-9]+|Infinity)$/.test(constants.register[currentWord])) {
                resultAssembleLine += constants.register[currentWord]
                continue
              }
            }
            if (/^(-|\+)?([0-9]+|Infinity)$/.test(currentWord)) {
              resultAssembleLine += parseInt(currentWord)
              continue
            }
            if (self.symbols[currentWord]) {
              resultAssembleLine += self.symbols[currentWord]
              continue
            }

            // if(/^()/)
            if (/[0-9]+\(\$\w+\)/.test(currentWord)) {
              // console.log('get' + currentWord)
              continue
            }
            if (currentWord.includes('#')) {
              break
            }
            console.log(currentWord)
          }
          if (hasPostOperand) resultAssembleLine += hasPostOperand
          self.assembleCode.push(resultAssembleLine)
        }
      )
    },
    wordIsIns: function (word) {
      let allIns = constants.instructions
      for (let index in allIns) {
        if (allIns[index].ins === word) {
          return allIns[index]
        }
      }
      return false
    },
    syntaxRegx: function (line) {
      // let self = this
      // let insRegx = new RegExp(self.instructRegx)
      // let commRegx = new RegExp(self.commentRegx)
      // let labelRegx = new RegExp(self.labelRegx)
      // let stringList = insRegx.exec(line)
      // let commList = commRegx.exec(line)
      // // let labelList = labelRegx.exec(line)
      // if (stringList) {
      //   return self.getSyntax(stringList)
      // } else if (labelList) {
      //   return self.getSyntax(labelList)
      // } else if (commList) {
      //   return self.getSyntax(commList)
      // } else {
      //   return line
      // }
      return line
    },
    getSyntax: function (valueList) {
      let result = ''
      for (let i = 1; i < valueList.length; i++) {
        if (!valueList[i]) continue
        if (valueList[i].includes('//')) {
          result += ('<span style="color: #bdc3c7">' + valueList[i] + '</span>')
        } else if (valueList[i].includes('.')) {
          // console.log(valueList[i])
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
