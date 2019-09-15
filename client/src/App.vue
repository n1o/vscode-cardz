<template>
  <div id="app">
    <div id="nav flex flex-row">
      <router-link class="px-4" :to="{name: 'home'}">Card Overview</router-link>
    </div>
    <router-view/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

declare var acquireVsCodeApi: any;

@Component({})
export default class App extends Vue {
  private vscode: any;

  private mounted() {
    if (!this.vscode) {
       this.vscode = acquireVsCodeApi();
    }
    if (this.vscode) {
      this.vscode.postMessage({ command: 'ready' });
    }
    this.$router.push({name: 'home'});
    window.addEventListener('study_note', (event: any) => {
      const { command, payload } = event;
      if(command === 'study_note') {
        const { path, name, lastReviewd } = payload;
      } 
    })
  }
}
// window.addEventListener('load_note', (listener: any) => {
//   const { command, data } = listener.data;
//   console.log(command, data);
// })
</script>

<style src="./assets/tailwind.css">