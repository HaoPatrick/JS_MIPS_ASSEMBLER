import { registers, dictionary } from './instructions.js'
let baseAddr = 0
let curAddr = 0
let addrPointer = 0
let dataAddr = 0
let labelTable = {}
let parseMode = 'instruction'
let memory = []

function labelToAddress(label) {
  if (labelTable[label] !== undefined) {
    return labelTable[label]
  } else {
    return -1
  }
}

function labelToOffset(label) {
  if (labelTable[label] !== undefined) {
    return labelTable[label] - curAddr
  } else {
    return -1
  }
}

function getStrategy(op) {
  try {
    return dictionary[op]
  } catch (e) {
    throw new Error('Illegal instruction')
  }
}

export function assemble(content) {
  memory = []
  curAddr = 0
  let i, line
  let tempAddr = 0
  for (i in content) {
    line = content[i].trim()
    if (line.match(':')) {
      line = line.split(':')
      if (line.length === 2) {
        let label = line[0]
        labelTable[label] = tempAddr * 4
      }
      continue
    }
    tempAddr += 1
  }
  console.log('first round')
  for (i in content) {
    line = content[i].trim()
    if (line.match(':')) {
      continue
    }

    let token = tokenize(line)
    if (!token) continue

    if (token.operation.type === 'M') {
      if (token.operation.op === 'base') {
        if (token.data[0].match(/x/)) {
          curAddr = parseInt(token.data, 16)
        } else {
          curAddr = parseInt(token.data)
        }
      }
    } else {
      memory.push({
        addr: curAddr,
        instruction: translate(token.operation, token.data),
        asmData: token.data,
        asm: token.operation,
        line: i
      })
      curAddr += 4
    }
  }
  // for (let i in memory) {
  //   if (memory[i].asm.type === 'J') {
  //     let transJ = translate(memory[i].asm, memory[i].asmData)
  //     if (transJ) {
  //       memory[i].instruction = transJ
  //     }
  //   }
  // }
  return memory
}

export function tokenize(line) {
  if (line === '') {
    return false
  }
  // let instruction = line.split('//')[0].trim()
  // instruction = instruction.split(' ')[0].trim()
  let instruction = line.split('#')[0] // stripe the comment
  if (instruction === '') {
    return false
  }
  let instructionArray = line.replace(/,/g, ' ').split(' ')
  instructionArray = instructionArray.map(
    value => {
      return value.trim()
    }
  ).filter(
    value => {
      return value
    }
    )

  let op = instructionArray[0].trim()
  let data = instructionArray.slice(1)

  let operation = getStrategy(op)
  return {
    'op': op,
    'marker': true,
    'data': data,
    'operation': operation
  }
}

function leftpad(string, length) {
  while (string.length < length) {
    string = '0' + string
  }
  return string
}

function translateRegister(reg) {
  try {
    return registers[reg]
  } catch (e) {
    throw new Error('Illegal Register')
  }
}

// function markPosition(lineNum, mark) {
// }

function translate(operation, data) {
  let type = operation.type
  let res = {}

  res.type = type

  let handleInstruction = {
    'J': handleInstructionJ,
    'I': handleInstructionI,
    'R': handleInstructionR,
    'M': handleInstructionM,
    'E': handleInstructionE
  }

  try {
    res.code = handleInstruction[type](operation, data)
  } catch (e) {
    console.error(e)
  }

  return res
}

function handleInstructionJ(operation, data) {
  let opcode = operation.op
  let res = leftpad(opcode.toString(2), 6)

  if (labelToOffset(data) !== -1) {
    res = res + toBaseTwo(labelToOffset(data) / 4, 26)
    return res
  } else if (operation.op === 3) {
    // jal
    res += toBaseTwo(registers[data], 26)
    return res
  } else {
    return false
  }
}

function toBaseTwo(value, targetLength) {
  let baseTen = parseInt(value, 10)
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
}

function handleInstructionI(operation, data) {
  let opcode = operation.op
  let format = operation.format
  let func = operation.func

  let res = leftpad(opcode.toString(2), 6)

  let rt, rs, imm, label
  try {
    switch (format) {
      case 'rt/rs/imm':
        rt = data[0]
        rs = data[1]
        imm = data[2]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(translateRegister(rt).toString(2), 5)
        res = res + toBaseTwo(imm, 16)

        break
      case 'rs/imm':
        rs = data[0]
        imm = data[1]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + toBaseTwo(imm, 21)

        break
      case 'rt/imm/rs':
        rt = data[0]
        let regres = /(.+)\((.+)\)/.exec(data[1])
        imm = regres[1]
        rs = regres[2]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(translateRegister(rt).toString(2), 5)
        res = res + toBaseTwo(imm, 16)

        break
      case 'rs/label':

        rs = data[0]
        label = data[1]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(func.toString(2), 5)
        res = res + leftpad(labelToOffset(label).toString(2).slice(0, -2), 16)

        break
      case 'rs/rt/label':
        rs = data[0]
        rt = data[1]
        label = data[2]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(translateRegister(rt).toString(2), 5)
        res = res + toBaseTwo(labelToOffset(label), 18).slice(0, -2)

        break
      case 'rt/imm':
        rt = data[0]
        imm = data[1]

        res = res + leftpad(translateRegister(rt).toString(2), 10)
        res = res + toBaseTwo(imm, 16)

        break
    }
  } catch (e) {
    console.error(e)
  }
  return res
}

function handleInstructionR(operation, data) {
  let opcode = operation.op
  let func = operation.func
  let format = operation.format
  let res = leftpad(opcode.toString(2), 6)
  let rt, rs, rd, sa

  try {
    switch (format) {
      case 'rd/rs/rt':
        rd = data[0]
        rs = data[1]
        rt = data[2]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(translateRegister(rt).toString(2), 5)
        res = res + leftpad(translateRegister(rd).toString(2), 5)
        res = res + leftpad(func.toString(2), 11)
        break
      case 'rs/rt':
        rs = data[0]
        rt = data[1]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(translateRegister(rt).toString(2), 5)
        res = res + leftpad(func.toString(2), 16)
        break
      case 'rd':
        rd = data[0]

        res = res + leftpad(translateRegister(rd).toString(2), 15)
        res = res + leftpad(func.toString(2), 11)
        break
      case 'rs':
        rs = data[0]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(func.toString(2), 21)

        break
      case 'rd/rt/shamt':
        rd = data[0]
        rt = data[1]
        sa = data[2]

        res = res + leftpad(translateRegister(rt).toString(2), 10)
        res = res + leftpad(translateRegister(rd).toString(2), 5)
        res = res + toBaseTwo(sa, 5)
        res = res + leftpad(func.toString(2), 6)
        break
      case 'rd/rt/rs':
        rd = data[0]
        rt = data[1]
        rs = data[2]

        res = res + leftpad(translateRegister(rs).toString(2), 5)
        res = res + leftpad(translateRegister(rt).toString(2), 5)
        res = res + leftpad(translateRegister(rd).toString(2), 5)
        res = res + leftpad(func.toString(2), 11)
        break
    }
  } catch (e) {
    console.error(e)
  }
  return res
}

function handleInstructionM(opcode, format, data) {
  if (opcode === 'data') {
    dataAddr = parseInt(data, 16)
    parseMode = 'data'
  } else if (opcode === 'base') {
    baseAddr = parseInt(data, 16)
    parseMode = 'instruction'
    addrPointer = baseAddr
  } else {
    throw new Error('Undefined marker')
  }
  return ''
}

function handleInstructionE(opcode, format, data) {
  console.log(addrPointer)
  console.log(parseMode)
  console.log(dataAddr)
  console.log(labelToAddress)
}
