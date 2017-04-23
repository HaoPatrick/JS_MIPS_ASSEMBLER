import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
  registers: {
    '0': 0,
    '1': 0,
    '2': 0,
    '3': 0,
    '4': 0,
    '5': 0,
    '6': 0,
    '7': 0,
    '8': 0,
    '9': 0,
    '10': 0,
    '11': 0,
    '12': 0,
    '13': 0,
    '14': 0,
    '15': 0,
    '16': 0,
    '17': 0,
    '18': 0,
    '19': 0,
    '20': 0,
    '21': 0,
    '22': 0,
    '23': 0,
    '24': 0,
    '25': 0,
    '26': 0,
    '27': 0,
    '28': 0,
    '29': 0,
    '30': 0,
    '31': 0
  },
  stack: [],
  defaultLines: 'set_array: # a0 is num\naddi $sp, $sp, -12\nsw $ra, 0($sp)\nsw $s0, 4($sp)\nsw $s1, 8($sp) # s1 is array[]\naddi $s0, $zero, 0 # s0 is i\nLoop:\nslti $t0, $s0, 10\nbeq $t0, $zero, Compare\nadd $a1, $s0, $zero\njal Compare\nsll $t1, $s0, 2\nadd $t1, $t1, $s1\nsw $v0, 0($t1)\naddi $s0, $s0, 1\njal Loop\n\nlw $ra, 0($sp)\nlw $s0, 4($sp)\nlw $s1, 8($sp)\naddi $sp, $sp, 12\njr $ra\n\nCompare:\naddi $sp, $sp, -4\nsw $ra, 0($sp)\njal Sub\nslt $t0, $zero, $s1\naddi $v0, $zero, 1\nlw $ra, 0($sp)\naddi $sp, $sp, 4\njr $ra\nElse:\naddi $v0, $zero, 0\nlw $ra, 0($sp)\naddi $sp, $sp, 4\njr $ra\n\nSub:\nsub $v0, $a0, $a1\njr $ra\n'
}

const mutations = {
  setRegister(state, registers) {
    state.registers = registers
  },
  resetRegister(state) {
    state.registers = {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
      '10': 0,
      '11': 0,
      '12': 0,
      '13': 0,
      '14': 0,
      '15': 0,
      '16': 0,
      '17': 0,
      '18': 0,
      '19': 0,
      '20': 0,
      '21': 0,
      '22': 0,
      '23': 0,
      '24': 0,
      '25': 0,
      '26': 0,
      '27': 0,
      '28': 0,
      '29': 0,
      '30': 0,
      '31': 0
    }
  },
  pushStack(state, value) {
    state.stack.append(value)
  },
  popStack(state) {
    state.stack.slice(0, -1)
  },
  setStack(state, stack) {
    state.stack = stack
  }
}

const getters = {
  registers: state => state.registers,
  stack: state => state.stack,
  defaultLines: state => state.defaultLines
}

// const actions = {
//   setReg(context) {
//     context.commit('setRegister')
//   }
// }
export default new Vuex.Store({
  state,
  getters,
  mutations
})
