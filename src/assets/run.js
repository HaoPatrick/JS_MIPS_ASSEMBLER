import { getInstruction } from './deassemble.js'
import store from '../store/store.js'

export default function runCode(line) {
  let allReg = store.getters.registers
  let operateCode = line.slice(0, 6)
  operateCode = parseInt(operateCode, 2).toString(16)
  let funcCode = line.slice(-6)
  funcCode = parseInt(funcCode, 2).toString(16)
  let instruction = getInstruction(operateCode, funcCode)
  console.log(allReg)
  if (!instruction) return false
}
