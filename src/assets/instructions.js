let allRegisters = [
  '$zero',
  '$at',
  '$v0',
  '$V1',
  '$a0',
  '$a1',
  '$a2',
  '$a3',
  '$t0',
  '$t1',
  '$t2',
  '$t3',
  '$t4',
  '$t5',
  '$t6',
  '$t7',
  '$s0',
  '$s1',
  '$s2',
  '$s3',
  '$s4',
  '$s5',
  '$s6',
  '$s7',
  '$t8',
  '$t9',
  '$K0',
  '$K1',
  '$gp',
  '$sp',
  '$s8',
  '$ra'
]
let register = {}
allRegisters.forEach(
  (element, index) => {
    register[element] = index
    // console.log(element)
  }
)
export default register
