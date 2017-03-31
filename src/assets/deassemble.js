import { dictionary, registers } from './instructions.js'
export function deassemble(content) {
  let result
  for (let i in content) {
    let operateCode = content[i].slice(0, 6)
    operateCode = parseInt(operateCode, 2).toString(16)
    let funcCode = content[i].slice(-6)
    funcCode = parseInt(funcCode, 2).toString(16)
    let instruction = getInstruction(operateCode, funcCode)

    if (!instruction) continue
    if (instruction.type === 'J') {
      let resultLine = handleInstructionJ(instruction, content[i])
      console.log(resultLine)
    } else if (instruction.type === 'R') {
      let resultLine = handleInstructionR(instruction, content[i])
      console.log(resultLine)
    }
    // console.log(instruction)
  }

  console.log(result)
}

function handleInstructionJ(operateCode, data) {
  let assemblyLine = operateCode.code
  let offset = data.slice(6)
  offset = uintToInt(parseInt(offset, 2), offset.length)
  assemblyLine += ' ' + offset.toString()
  return assemblyLine
}

function handleInstructionR(operateCode, data) {
  let assemblyLine = operateCode.code
  let rs, rt, rd, shamt, func
  rs = getRegister(data.slice(6, 11))
  rt = getRegister(data.slice(11, 16))
  rd = getRegister(data.slice(16, 21))
  shamt = data.slice(21, 26)
  func = data.slice(26, 31)
  assemblyLine += rs + rt + rd + shamt + func
  return assemblyLine
}

function uintToInt(uint, nbit) {
  nbit = +nbit || 32
  if (nbit > 32) throw new RangeError('uintToInt only supports ints up to 32 bits')
  uint <<= 32 - nbit
  uint >>= 32 - nbit
  return uint
}

function getRegister(regCode) {
  for (let i in registers) {
    if (registers[i] === parseInt(regCode, 2)) {
      let result = {}
      result.code = i
      result.value = registers[i]
      return result
    }
  }
  return false
}
function getInstruction(operateCode, funcCode) {
  for (let i in dictionary) {
    if (dictionary[i].op.toString(16) === operateCode && operateCode !== '0') {
      let result = dictionary[i]
      result.code = i
      return result
    }
    if (dictionary[i].op.toString(16) === operateCode &&
      dictionary[i].func &&
      dictionary[i].func.toString(16) === funcCode) {
      let result = dictionary[i]
      result.code = i
      return result
    }
  }
  return false
}
export default deassemble
