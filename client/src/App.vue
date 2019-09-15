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

@Component({})
export default class App extends Vue {

  private mounted() {
    this.$router.push({name: 'home'});
  }
}
// window.addEventListener('load_note', (listener: any) => {
//   const { command, data } = listener.data;
//   console.log(command, data);
// })
</script>

<style src="./assets/tailwind.css">