<template>
  <div class="hello">
    <label for="file-upload"
           class="custom-file-upload">
      <i class="fa fa-cloud-upload"></i>打开一个
    </label>
    <input id="file-upload"
           @change="onFileChange"
           accept="*"
           type="file">
    <el-button size="small"
               @click="aNewOne"
               type="success">传授经验</el-button>
  
    <el-row style="margin-top:10px"
            :gutter="10">
      <el-col :span="12">
        <codemirror :code="fileContent"
                    :options="editorOption"
                    @changed="codeChange"></codemirror>
      </el-col>
      <el-col style="font-family:consolas"
              :span="12">
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
    </el-row>
  </div>
</template>

<script>
import constants from '../assets/instructions.js'
import { assemble } from '../assets/temp.js'
import { codemirror } from 'vue-codemirror'
// require('codemirror/addon/selection/active-line.js')
// require active-line.js
require('codemirror/addon/selection/active-line.js')
// styleSelectedText
require('codemirror/addon/selection/mark-selection.js')
require('codemirror/addon/search/searchcursor.js')
// hint
require('codemirror/addon/hint/show-hint.js')
require('codemirror/addon/hint/show-hint.css')
require('codemirror/addon/hint/javascript-hint.js')
require('codemirror/addon/selection/active-line.js')
// highlightSelectionMatches
require('codemirror/addon/scroll/annotatescrollbar.js')
require('codemirror/addon/search/matchesonscrollbar.js')
require('codemirror/addon/search/searchcursor.js')
require('codemirror/addon/search/match-highlighter.js')
// keyMap
require('codemirror/mode/clike/clike.js')
require('codemirror/addon/edit/matchbrackets.js')
require('codemirror/addon/comment/comment.js')
require('codemirror/addon/dialog/dialog.js')
require('codemirror/addon/dialog/dialog.css')
require('codemirror/addon/search/searchcursor.js')
require('codemirror/addon/search/search.js')
require('codemirror/keymap/sublime.js')
// foldGutter
require('codemirror/addon/fold/foldgutter.css')
require('codemirror/addon/fold/brace-fold.js')
require('codemirror/addon/fold/comment-fold.js')
require('codemirror/addon/fold/foldcode.js')
require('codemirror/addon/fold/foldgutter.js')
require('codemirror/addon/fold/indent-fold.js')
require('codemirror/addon/fold/markdown-fold.js')
require('codemirror/addon/fold/xml-fold.js')
export default {
  name: 'hello',
  data() {
    return {
      msg: 'Welcome to Your Vue.js App',
      fileContent: '',
      // fileLineList: [],
      // validLines: [],
      assembleCode: [],
      file: '',
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
    },
    fileLineList: function () {
      return this.fileContent.replace(/\r/g, '').split('\n')
    },
    validLines: function () {
      return this.fileLineList.filter(
        value => {
          return value
        }
      )
    }
  },
  methods: {
    codeChange: function (code) {
      console.log(code)
      this.fileContent = code
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
    aNewOne: function () {
      let self = this
      let allFileLines = self.validLines
      let result = assemble(allFileLines)
      self.assembleCode = result.map(
        value => {
          return value.instruction.code
        }
      )
      console.log(self.assembleCode)
      console.log(result)
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
