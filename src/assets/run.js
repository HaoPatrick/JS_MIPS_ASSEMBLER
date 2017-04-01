import { getInstruction, uintToInt } from './deassemble.js'
import store from '../store/store.js'

export default function runCode(line) {
  let allReg = store.getters.registers
  let stack = store.getters.stack
  let operateCode = line.slice(0, 6)
  operateCode = parseInt(operateCode, 2).toString(16)
  let funcCode = line.slice(-6)
  funcCode = parseInt(funcCode, 2).toString(16)
  let instruction = getInstruction(operateCode, funcCode)
  if (!instruction) return false

  let rs, rt, imme
  rs = parseInt(line.slice(6, 11), 2)
  rt = parseInt(line.slice(11, 16), 2)
  imme = uintToInt(parseInt(line.slice(16), 2), line.slice(16).length)
  if (instruction.code === 'addi') {
    allReg[rs] = allReg[rt] - imme / 4
  } else if (instruction.code === 'sw') {
    let offset = allReg[rs] - imme / 4
    stack[offset] = allReg[rt]
  } else if (instruction.code === 'slti') {
    allReg[rs] < imme ? allReg[rt] = 1 : allReg[rt] = 0
  }
  store.commit('setStack', stack)
  store.commit('setRegister', allReg)
  console.log('done')
  return true
}
