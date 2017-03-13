<template>
  <div class="hello">
    <input id="file-upload" @change="onFileChange" accept="text/*" type="file" >
    <div>
      {{fileContent}}
    </div>
    <ol v-if="fileLineList">
      <li contenteditable="true" v-for="line in fileLineList">{{line}}</li>
    </ol>
  </div>
</template>

<script>
export default {
  name: 'hello',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      fileContent: '',
      file: ''
    }
  },
  computed: {
    fileLineList: function () {
      if (this.fileContent === '') return ''
      let lineList = this.fileContent.split('\n')
      return lineList
    }
  },
  methods: {
    onFileChange: function (e) {
      let self = this
      let files = e.target.files || e.dataTransfer.files
      if (files.length === 1) {
        self.file = files[0]
        console.log('asdf')
      } else {
        return
      }

      let reader = new FileReader()
      reader.onload = function (e) {
        let contents = e.target.result
        self.fileContent = contents
      }
      reader.readAsText(self.file)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
