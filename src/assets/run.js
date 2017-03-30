import { tokenize } from './temp.js'
export default function run(line) {
  if (line.match(':')) {
    return
  }
  let token = tokenize(line)
  if (!token) return false

  // let rt, rs, imm
  if (token.op === 'addi') {
    // rt = token.data[0]
    // rs = token.data[1]
    // imm = token.data[3]
  }
  console.log(token)
}
