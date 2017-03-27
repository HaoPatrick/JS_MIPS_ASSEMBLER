import constants from './instructions.js'
function tokenize(line) {
  if (!line) return false
  let splitWordList = line.replace(/,/g, ' ').split(' ')
  splitWordList = splitWordList.map(
    value => {
      return value.trim()
    }
  )
  splitWordList = splitWordList.filter(
    value => {
      return value
    }
  )
  let op = splitWordList[0]
  let operation = constants.newIns[splitWordList[0]]
  let data = splitWordList.slice(1)
  return {
    'op': op,
    'data': data,
    'operation': operation
  }
}


function handleI(operation, data, symbol, currAddr) {
  let operateCode = operation.op
  let format = operation.format
  let func = operation.func
  let result = toBaseTwo(operateCode.toString(2), 6)
  let rt, rs, imm, label
  try {
    switch (format) {
      case 'rt/rs/imm':
        rt = data[0]
        rs = data[1]
        imm = data[2]

        result += toBaseTwo(constants.register[rs].toString(2), 5)
        result += toBaseTwo(constants.register[rt].toString(2), 5)
        result += toBaseTwo(parseInt(imm).toString(2), 5)
        break
      case 'rs/imm':
        rs = data[0]
        imm = data[1]
        result += toBaseTwo(constants.register[rs].toString(2), 5)
        result += toBaseTwo(parseInt(imm).toString(2), 5)
        break
      case 'rt/imm/rs':
        rt = data[0]
        let immAndRegList = /([0-9]+)\\((\\$\\w+)\\)/.exec(data[1])
        imm = immAndRegList[1]
        rs = immAndRegList[2]
        result += toBaseTwo(constants.register[rs].toString(2), 5)
        result += toBaseTwo(constants.register[rt].toString(2), 5)
        result += toBaseTwo(parseInt(imm).toString(2), 16)
        break
      case 'rs/label':
        rs = data[0]
        label = data[1]
        result += toBaseTwo(constants.register[rs].toString(2), 5)
        result += toBaseTwo(func.toSting(2), 5)
        result += toBaseTwo(
          ((label, symbol, currAddr) => {
            if (symbol[label] != undefined) {
              return symbol[label] - currAddr
            } else {
              return -1
            }
          }).toString(2), 5
        )
        break
      case 'rs/rt/label':
        rs = data[0]
        rt = data[1]
        label = data[2]
        result += toBaseTwo(constants.register[rs].toString(2), 5)
        result += toBaseTwo(constants.register[rt].toString(2), 5)
        result += toBaseTwo(
          ((label, symbol, currAddr) => {
            if (symbol[label] != undefined) {
              return symbol[label] - currAddr
            } else {
              return -1
            }
          }).toString(2).slice(0, -2), 16
        )
        break
      case 'rt/imm':
        rt = data[0]
        imm = data[1]
        result += toBaseTwo(constants.register[rt].toString(2), 10)
        result += toBaseTwo(parseInt(imm).toString(2), 16)
        break
    }
  } catch (e) {
    console.log(e)
  }
  console.log(res)
  return res
}

function toBaseTwo(inString, length) {
  while (inString.length < length) {
    inString = '0' + inString
  }
  return inString
}

function translate(operation, data, symbols, currAddr) {
  let type = operation.type
  let result = {}
  result.type = type

  let handleIns = {
    'J': handleJ,
    'I': handleI,
    'R': handleR
  }
}
let assemble = {}
assemble.tokenize = tokenize
export default assemble
