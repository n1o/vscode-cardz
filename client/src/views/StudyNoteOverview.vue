<template>
  <div>
    <StudyNoteInfo :name="currentStudyNote.name" :lastReviewed="currentStudyNote.lastReviewed" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { CurrentStudyNote } from '../store/types';
import StudyNoteInfo from '@/components/StudyNoteInfo.vue';

@Component({
  components: {
    StudyNoteInfo,
  },
  computed: {
    ...mapState({
      currentStudyNote: 'currentStudyNote',
    }),
  },
})
export default class AllCardsView extends Vue {
  public thing!: CurrentStudyNote;
}
</script>
