import { dictionary, registers } from './instructions.js'
export function deassemble(content) {
  let realContent = []
  const regex = /([a-fA-F0-9]{8})/g
  if (content[0].includes('memory')) {
    for (let i in content) {
      let temp = content[i].match(regex)
      realContent.push.apply(realContent, temp)
    }
    realContent = realContent.map(value => {
      let baseTen = parseInt(value, 16)
      let baseTwo = (baseTen >>> 0).toString(2)
      let result = ''
      if (baseTwo.length < 32) {
        for (let i = 0; i < (32 - baseTwo.length); i++) {
          result += '0'
        }
        result += baseTwo
        return result
      }
      if (baseTwo.length > 32) {
        result = baseTwo.slice(-1 * 32)
        return result
      }
      result = baseTwo
      return result
    })
  } else {
    realContent = content
  }

  let result = []
  for (let i in realContent) {
    let operateCode = realContent[i].slice(0, 6)
    operateCode = parseInt(operateCode, 2).toString(16)
    let funcCode = realContent[i].slice(-6)
    funcCode = parseInt(funcCode, 2).toString(16)
    let instruction = getInstruction(operateCode, funcCode)

    if (!instruction) continue
    if (instruction.type === 'J') {
      let resultLine = handleInstructionJ(instruction, realContent[i])
      result.push(resultLine)
    } else if (instruction.type === 'R') {
      let resultLine = handleInstructionR(instruction, realContent[i])
      result.push(resultLine)
    } else if (instruction.type === 'I') {
      let resultLine = handleInstructionI(instruction, realContent[i])
      result.push(resultLine)
    }
  }
  return result
}

function handleInstructionJ(operateCode, data) {
  let assemblyLine = operateCode.code
  let offset = data.slice(6)
  offset = uintToInt(parseInt(offset, 2), offset.length)
  assemblyLine += ' ' + offset.toString()
  return assemblyLine
}

function handleInstructionI(operateCode, data) {
  let assemblyLine = operateCode.code + ' '
  let rs, rt, imme
  rs = getRegister(data.slice(6, 11)).code
  rt = getRegister(data.slice(11, 16)).code
  imme = uintToInt(parseInt(data.slice(16), 2), data.slice(16).length)

  switch (operateCode.format) {
    case 'rt/rs/imm':
      assemblyLine += rt + ', ' + rs + ', ' + imme
      break
    case 'rs/imm':
      assemblyLine += rs + ', ' + imme
      break
    case 'rt/imm/rs':
      assemblyLine += rt + ', ' + imme + '(' + rs + ')'
      break
    case 'rs/label':
      console.log('WTF? I didnt use label')
      assemblyLine += rs + ', ' + imme
      break
    case 'rt/imm':
      assemblyLine += rt + imme
      break
    case 'rs/rt/label':
      assemblyLine += rs + ', ' + rt + ', ' + imme
  }
  return assemblyLine
}

function handleInstructionR(operateCode, data) {
  let assemblyLine = operateCode.code + ' '
  let rs, rt, rd, shamt
  rs = getRegister(data.slice(6, 11)).code
  rt = getRegister(data.slice(11, 16)).code
  rd = getRegister(data.slice(16, 21)).code
  shamt = parseInt(data.slice(21, 26), 2)

  switch (operateCode.format) {
    case 'rd/rs/rt':
      assemblyLine += rd + ', ' + rs + ', ' + rt
      break
    case 'rs/rt':
      assemblyLine += rs + ', ' + rt
      break
    case 'rd':
      assemblyLine += rd
      break
    case 'rs':
      assemblyLine += rs
      break
    case 'rd/rt/shamt':
      assemblyLine += rd + ', ' + rt + ', ' + shamt
      break
    case 'rd/rt/rs':
      assemblyLine += rd + ', ' + rt + ', ' + rs
      break
  }
  return assemblyLine
}

export function uintToInt(uint, nbit) {
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
export function getInstruction(operateCode, funcCode) {
  for (let i in dictionary) {
    if (dictionary[i].op.toString(16) === operateCode && operateCode !== '0') {
      let result = dictionary[i]
      result.code = i
      return result
    }
    if (dictionary[i].op.toString(16) === operateCode &&
      dictionary[i].func !== undefined &&
      dictionary[i].func.toString(16) === funcCode) {
      let result = dictionary[i]
      result.code = i
      return result
    }
  }
  return false
}
export default deassemble
