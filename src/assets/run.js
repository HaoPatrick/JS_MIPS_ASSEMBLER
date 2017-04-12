import { getInstruction, uintToInt } from './deassemble.js'
import store from '../store/store.js'

export default function runCode(line, currPC) {
  let allReg = store.getters.registers
  let stack = store.getters.stack
  let operateCode = line.slice(0, 6)
  operateCode = parseInt(operateCode, 2).toString(16)
  let funcCode = line.slice(-6)
  funcCode = parseInt(funcCode, 2).toString(16)
  let instruction = getInstruction(operateCode, funcCode)
  if (!instruction) return false

  let rs, rt, imme, rd
  rs = parseInt(line.slice(6, 11), 2)
  rt = parseInt(line.slice(11, 16), 2)
  rd = parseInt(line.slice(16, 21), 2)
  imme = uintToInt(parseInt(line.slice(16), 2), line.slice(16).length)

  if (instruction.code === 'addi') {
    allReg[rs] = allReg[rt] - imme / 4
  } else if (instruction.code === 'sw') {
    let offset = allReg[rs] - imme / 4
    stack[offset] = allReg[rt]
  } else if (instruction.code === 'slti') {
    allReg[rs] < imme ? allReg[rt] = 1 : allReg[rt] = 0
  } else if (instruction.code === 'beq') {
    if (allReg[rs] === allReg[rt]) return imme + currPC
  } else if (instruction.code === 'jal') {
    return imme + currPC
  } else if (instruction.code === 'lw') {
    let offset = allReg[rs] - imme / 4
    allReg[rt] = stack[offset]
  } else if (instruction.code === 'add') {
    allReg[rt] = allReg[rs] + allReg[rd]
  } else if (instruction.code === 'sub') {
    allReg[rt] = allReg[rs] - allReg[rd]
  } else if (instruction.code === 'and') {
    allReg[rt] = allReg[rs] & allReg[rd]
  } else if (instruction.code === 'or') {
    allReg[rt] = allReg[rs] | allReg[rd]
  } else if (instruction.code === 'slt') {
    allReg[rs] < allReg[rd] ? allReg[rt] = 1 : allReg[rt] = 0
  } else if (instruction.code === 'jr') {
    return allReg[rs]
  }

  store.commit('setStack', stack)
  store.commit('setRegister', allReg)
  console.log('done')
  return 1 + currPC
}
