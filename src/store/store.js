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
  stack: []
}

const mutations = {
  setRegister(state, registers) {
    state.registers = registers
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
  stack: state => state.stack
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
