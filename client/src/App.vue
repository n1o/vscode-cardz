<template>
  <div id="app">
    <div id="nav">
      <router-link :to="{name: 'home'}">Card Overview</router-link>
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
</script>