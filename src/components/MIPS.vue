<template>
  <div class="hello">
    <el-menu theme="dark"
             style="margin-bottom:8px"
             :default-active="activeIndex"
             class="el-menu-demo"
             mode="horizontal"
             @select="handleSelect">
      <el-menu-item index="1">HLH 的 MIPS 汇编器</el-menu-item>
      <el-menu-item index="open">
        <label for="file-uploada">
          打开一个
        </label>
        <input id="file-uploada"
               @change="onFileChange"
               accept="*"
               type="file">
      </el-menu-item>
      <el-submenu index="compile">
        <template slot="title">开始编译</template>
        <el-menu-item index="binary-mode">到Binary</el-menu-item>
        <el-menu-item index="debug-mode">调试模式</el-menu-item>
        <el-menu-item index="coe-mode">到Coe</el-menu-item>
      </el-submenu>
      <el-menu-item index="decompile">开始反编译</el-menu-item>
      <el-menu-item index="debug">调试</el-menu-item>
      <el-submenu index="2">
        <template slot="title">选项</template>
        <el-menu-item index="line-num">显示/隐藏行号</el-menu-item>
        <el-menu-item index="resetpc">重置 PC</el-menu-item>
        <el-menu-item index="resetreg">重置 Register</el-menu-item>
      </el-submenu>
  
    </el-menu>
    <el-row v-if="fileContent"
            style="margin:10px 0 0 0"
            :gutter="10">
      <el-col :span="8"
              style="height:36rem;overflow:auto">
        <codemirror :code="fileContent"
                    :options="editorOption"
                    @change="codeChange"></codemirror>
      </el-col>
      <el-col :span="9"
              style="height:36rem;overflow:auto;font-family:consolas">
        <el-row v-for="(line, index)  in assembleCode"
                style="background-color:rgb(38,50,56);"
                :key="index">
          <el-col v-if="!displayLineNum"
                  :span="1"
                  style=" color:rgb(73, 122, 99); text-align:right;padding-right:2px;">{{index+1}}</el-col>
          <el-col :span="23"
                  v-bind:class="{ 'hight-light': index==debugInfo.pc&&debugInfo.debug }"
                  style="padding-left:8px;color:#ecf0f1;">{{line}}</el-col>
        </el-row>
      </el-col>
      <el-col :span="4">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="R Type"
                       name="first">
            <el-table :data="sType">
              <el-table-column prop="regName"
                               label="寄存器">
              </el-table-column>
              <el-table-column prop="regValue"
                               label="值">
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="T Type"
                       name="second">
            <el-table :data="tType">
              <el-table-column prop="regName"
                               label="寄存器">
              </el-table-column>
              <el-table-column prop="regValue"
                               label="值">
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="Others"
                       name="third">
            <el-table :data="otherType">
              <el-table-column prop="regName"
                               label="寄存器">
              </el-table-column>
              <el-table-column prop="regValue"
                               label="值">
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
  
      </el-col>
    </el-row>
    <el-row style="margin-top:0.7rem; background-color:rgb(38,50,56)">
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
import run from '../assets/run.js'
import { codemirror } from 'vue-codemirror'
import deassemble from '../assets/deassemble.js'
import { mapGetters, mapMutations } from 'vuex'

require('codemirror/addon/selection/active-line.js')

export default {
  name: 'hello',
  data() {
    return {
      fileContent: '',
      fileLineList: [],
      validLines: [],
      assembleCode: [],
      file: '',
      activeIndex: '1',
      activeTab: 'first',
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
      debugInfo: {
        pc: 0,
        debug: false
      },
      displayLineNum: false,
      regData: [
        { regName: '$r1', regValue: 0 },
        { regName: '$r2', regValue: 0 },
        { regName: '$r3', regValue: 0 },
        { regName: '$r4', regValue: 0 },
        { regName: '$r5', regValue: 0 },
        { regName: '$r6', regValue: 0 },
        { regName: '$r7', regValue: 0 },
        { regName: '$r8', regValue: 0 }
      ],
      currOption: 0
    }
  },
  components: {
    codemirror
  },
  filters: {
  },
  computed: {
    ...mapGetters([
      'registers'
    ]),
    editor() {
      return this.$refs.codeEditor.editor
    },
    tType: function () {
      return [
        { regName: '$t0', regValue: this.registers[8] },
        { regName: '$t1', regValue: this.registers[9] },
        { regName: '$t2', regValue: this.registers[10] },
        { regName: '$t3', regValue: this.registers[11] },
        { regName: '$t4', regValue: this.registers[12] },
        { regName: '$t5', regValue: this.registers[13] },
        { regName: '$t6', regValue: this.registers[14] },
        { regName: '$t7', regValue: this.registers[15] },
        { regName: '$t8', regValue: this.registers[24] },
        { regName: '$t9', regValue: this.registers[25] }
      ]
    },
    sType: function () {
      return [
        { regName: '$s0', regValue: this.registers[16] },
        { regName: '$s1', regValue: this.registers[17] },
        { regName: '$s2', regValue: this.registers[18] },
        { regName: '$s3', regValue: this.registers[19] },
        { regName: '$s4', regValue: this.registers[20] },
        { regName: '$s5', regValue: this.registers[21] },
        { regName: '$s6', regValue: this.registers[22] },
        { regName: '$s7', regValue: this.registers[23] },
        { regName: '$s8', regValue: this.registers[30] }
      ]
    },
    otherType: function () {
      return [
        { regName: '$zero', regValue: 0 },
        { regName: '$at', regValue: this.registers[1] },
        { regName: '$v0', regValue: this.registers[2] },
        { regName: '$v1', regValue: this.registers[3] },
        { regName: '$a0', regValue: this.registers[4] },
        { regName: '$a1', regValue: this.registers[5] },
        { regName: '$a2', regValue: this.registers[6] },
        { regName: '$k0', regValue: this.registers[26] },
        { regName: '$k1', regValue: this.registers[27] },
        { regName: '$gp', regValue: this.registers[28] },
        { regName: '$sp', regValue: this.registers[29] },
        { regName: '$ra', regValue: this.registers[31] }
      ]
    }
  },
  methods: {
    ...mapMutations([
      'resetRegister'
    ]),
    codeChange: function (code) {
      this.fileContent = code
    },
    handleSelect: function (key, path) {
      let self = this
      if (key === 'line-num') {
        self.displayLineNum = !self.displayLineNum
        self.toOutput((!self.displayLineNum ? 'Show' : 'Hide') + ' line number')
      } else if (key === 'compile') {
        self.compile()
      } else if (key === 'decompile') {
        self.toOutput('Begin decompile')
        let result = deassemble(self.validLines)
        self.assembleCode = result
      } else if (key === 'debug') {
        self.debug()
      } else if (key === 'binary-mode') {
        self.currOption = 0
        self.toOutput('Source code => binary')
        self.compile()
      } else if (key === 'debug-mode') {
        self.toOutput('Source code => debug')
        self.currOption = 1
        self.compile()
      } else if (key === 'coe-mode') {
        self.toOutput('Source code => coe')
        self.currOption = 2
        self.compile()
      } else if (key === 'resetpc') {
        self.toOutput('Reset PC to 0')
        self.debugInfo.pc = 0
      } else if (key === 'resetreg') {
        self.resetRegister()
      }
    },
    debug: function () {
      let self = this
      self.debugInfo.debug = true
      // self.compile()
      if (!self.assembleCode) {
        self.compile()
      }
      let allLines = self.assembleCode
      self.debugInfo.pc = run(allLines[self.debugInfo.pc], self.debugInfo.pc)
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
        self.fileLineList = contents.replace(/\r/g, '').split('\n')
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
      let allFileLines = self.fileContent.replace(/\r/g, '').split('\n').filter(line => {
        return line
      })
      console.log('all: ', allFileLines)
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
        let bin2hex = result.map(value => {
          return value.match(/.{4}/g).map(value => { return parseInt(value, 2).toString(16) }).join('')
        }).join(',')
        bin2hex = bin2hex.slice(0, -1) + ';'
        coeResult.push(bin2hex)
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

.el-col::-webkit-scrollbar {
  width: 0.4rem;
}

.el-col::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px #99A9BF;
}

.el-col::-webkit-scrollbar-thumb {
  background-color: darkgrey;
  outline: 1px solid slategrey;
}

.hight-light {
  background-color: #d35400
}
</style>
