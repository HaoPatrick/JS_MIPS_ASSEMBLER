<template>
  <div class="hello">
    <label for="file-upload"
           class="custom-file-upload">
      <i class="fa fa-cloud-upload"></i>打开一个
    </label>
    <el-select @change="changeOption"
               v-model="currOption"
               placeholder="Select">
      <el-option v-for="item in options"
                 :label="item.label"
                 :value="item.value">
      </el-option>
    </el-select>
    <input id="file-upload"
           @change="onFileChange"
           accept="*"
           type="file">
    <el-button size="small"
               @click="compile"
               type="success">传授经验</el-button>
    <el-row style="margin-top:10px"
            :gutter="10">
      <el-col :span="7"
              style="height:36rem;overflow:auto">
        <codemirror :code="fileContent"
                    :options="editorOption"
                    @change="codeChange"></codemirror>
      </el-col>
      <el-col :span="7"
              style="height:36rem;overflow:auto;font-family:consolas">
        <el-row v-for="(line, index)  in assembleCode"
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
      </el-col>
      <el-col :span="7">
        <el-button type="danger">Debug</el-button>
      </el-col>
    </el-row>
    <el-row style="margin-top:0.7rem">
      <el-col :span="24"
              style="padding:5px; font-family:consolas;min-height:12rem;color:#fefefe;overflow:auto;background-color:rgb(38,50,56)">
        Console:
        <p style=" margin-top:0;margin-bottom:0;"
           v-for="line in consoleOutput">
          {{line}}
        </p>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import constants from '../assets/instructions.js'
import { assemble } from '../assets/temp.js'
import { codemirror } from 'vue-codemirror'

require('codemirror/addon/selection/active-line.js')

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
      consoleOutput: [],
      symbols: {},
      htmlTemp: '',
      editorOption: {
        tabSize: 4,
        styleActiveLine: true,
        line: true,
        mode: 'text/x-mips',
        lineWrapping: true,
        theme: 'material'
      },
      options: [
        { label: 'Binary', value: 0 },
        { label: 'Debug', value: 1 },
        { label: 'Coe', value: 2 }
      ],
      currOption: 0,
      instructRegx: '(\\s*)?(\\w+)(\\s+)(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(,)(\\s*)?(\\$\\w+)(\\s*)?(\\s*)(\\/\\/.*)?',
      commentRegx: '(\\s*)(\\#.*)',
      labelRegx: '(\\s*)(\\.\\w+)(\\s+)(\\w+)(\\s*)(\\/\\/.*)?'
    }
  },
  components: {
    codemirror
  },
  filters: {
  },
  computed: {
    editor() {
      return this.$refs.codeEditor.editor
    }
  },
  methods: {
    codeChange: function (code) {
      this.fileContent = code
    },
    changeOption: function () {
      let self = this
      let currValue = self.options[self.currOption]
      self.toOutput('Assemble mode switched to ' + currValue.label)
    },
    toOutput: function (promote) {
      let self = this
      let dateString = new Date()
      dateString = dateString.getHours().toString() + ':' + dateString.getMinutes().toString() + ':' + dateString.getSeconds().toString()
      let withDate = dateString + ' - ' + promote
      self.consoleOutput.push(withDate)
    },
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
        self.toOutput('Load the file')
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
                hasPostOperand = self.toBaseTwo(instrc.code1, 16, 6)
              }
              resultAssembleLine += self.toBaseTwo(instrc.code, 16, 6)
              continue
            }
            if (currentWord.includes('$')) {
              if (/^(-|\+)?([0-9]+|Infinity)$/.test(constants.register[currentWord])) {
                resultAssembleLine += self.toBaseTwo(constants.register[currentWord], 10, 5)
                continue
              }
            }
            if (/^(-|\+)?([0-9]+|Infinity)$/.test(currentWord)) {
              resultAssembleLine += self.toBaseTwo(currentWord, 10, 16)
              continue
            }
            if (self.symbols[currentWord]) {
              resultAssembleLine += self.symbols[currentWord]
              continue
            }

            // if(/^()/)
            if (/[0-9]+\(\$\w+\)/.test(currentWord)) {
              let tempRex = '([0-9]+)\\((\\$\\w+)\\)'
              tempRex = new RegExp(tempRex)
              let resultList = tempRex.exec(currentWord)
              let offset = resultList[1]
              let rt = resultList[2]
              offset = self.toBaseTwo(offset, 10, 16)
              rt = constants.register[rt]
              rt = self.toBaseTwo(rt, 10, 5)
              console.log(rt + ' ' + offset)
              hasPostOperand = offset
              resultAssembleLine += rt
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
    compile: function () {
      let self = this
      let allFileLines = self.fileContent.replace(/\r/g, ' ').split('\n').filter(line => {
        return line
      })
      self.toOutput('Assemble the source code')
      let result = assemble(allFileLines)
      result = result.map(
        value => {
          return value.instruction.code
        }
      )
      if (self.currOption === 0) {
        self.assembleCode = result
        return
      } else if (self.currOption === 1) {
        self.assembleCode = result.map((value, line) => {
          console.log(line, value)
          let hexString = (line * 4).toString(16)
          while (hexString.length < 8) {
            hexString = '0' + hexString
          }
          return hexString + ': ' + value
        })
      } else if (self.currOption === 2) {
        let coeResult = []
        coeResult.push('memory_initialization_radix=16;')
        coeResult.push('memory_initialization_vector=')
        result.map(value => {
          let bin2hex = value.match(/.{4}/g).map(value => { return parseInt(value, 2).toString(16) }).join('') + ';'
          coeResult.push(bin2hex)
        })
        self.assembleCode = coeResult
      }
    },
    toBaseTwo: function (value, originBase, targetLength) {
      let baseTen = parseInt(value, originBase)
      let baseTwo = (baseTen >>> 0).toString(2)
      let result = ''
      if (baseTwo.length < targetLength) {
        for (let i = 0; i < (targetLength - baseTwo.length); i++) {
          result += '0'
        }
        result += baseTwo
        return result
      }
      if (baseTwo.length > targetLength) {
        result = baseTwo.slice(-1 * targetLength)
        return result
      }
      result = baseTwo
      return result
    },
    wordIsIns: function (word) {
      let allIns = constants.instructions
      for (let index in allIns) {
        if (allIns[index].ins === word) {
          return allIns[index]
        }
      }
      return false
    }
  }
}
</script>
<style>
.CodeMirror {
  border: 1px solid #eee;
  height: auto !important;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type="file"] {
  display: none;
}

.custom-file-upload {
  border: 1px solid #2980b9;
  display: inline-block;
  padding: 2px 6px 4px;
  font-size: 0.85rem;
  color: #2980b9;
  border-radius: 5px;
  cursor: pointer;
}
</style>
