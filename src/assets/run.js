import { getInstruction } from './deassemble.js'
export default function runCode(line) {
  let operateCode = line.slice(0, 6)
  operateCode = parseInt(operateCode, 2).toString(16)
  let funcCode = line.slice(-6)
  funcCode = parseInt(funcCode, 2).toString(16)
  let instruction = getInstruction(operateCode, funcCode)
  if (!instruction) return false

  switch (instruction.code) {
  }
}
