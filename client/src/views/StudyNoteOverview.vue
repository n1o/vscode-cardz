<template>
  <div>
    <StudyNoteInfo :note="currentStudyNote" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { mapState } from 'vuex';
import { StudyNote } from '../store/types';
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
  public thing!: StudyNote;
}
</script>
