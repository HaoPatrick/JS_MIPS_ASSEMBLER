import { getInstruction, uintToInt } from './deassemble.js'
import store from '../store/store.js'

export default function runCode(line) {
  let allReg = store.getters.registers
  let operateCode = line.slice(0, 6)
  operateCode = parseInt(operateCode, 2).toString(16)
  let funcCode = line.slice(-6)
  funcCode = parseInt(funcCode, 2).toString(16)
  let instruction = getInstruction(operateCode, funcCode)
  if (!instruction) return false

  let rs, rt, imme
  rs = parseInt(line.slice(6, 11), 2)
  rt = parseInt((line.slice(11, 16), 2))
  imme = uintToInt(parseInt(line.slice(16), 2), line.slice(16).length)
  if (instruction.code === 'addi') {
    allReg[rs] = allReg[rt] + imme
  }
  store.commit('setRegister', allReg)
  console.log('done')
}
