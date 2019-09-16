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
import { getModule } from 'vuex-module-decorators';
import { StudyNote } from './store/types';
import StudyNotesModule from './store/notes';

const notes = getModule(StudyNotesModule);

declare var acquireVsCodeApi: any;

@Component({})
export default class App extends Vue {
  private vscode: any;
  private mounted() {
    window.addEventListener('message', (event: any) => {

      const { command, payload } = event.data;
      if (command === 'study_note') {
        const { path, name, lastReview } = payload;
        notes.setStudyNote( { name, lastReviewed: lastReview });
      }
    });

    if (!this.vscode && acquireVsCodeApi) {
      this.vscode = acquireVsCodeApi();
    }
    if (this.vscode) {
      this.vscode.postMessage({ command: 'ready' });
    }


    this.$router.push({name: 'home'});
  }
}
</script>

<style src="./assets/tailwind.css">