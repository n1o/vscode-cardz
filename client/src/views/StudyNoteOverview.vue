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
import { getModule } from 'vuex-module-decorators';
import StudyNotesModule from '../store/notes';

const notes = getModule(StudyNotesModule);

@Component({
  components: {
    StudyNoteInfo,
  },
})
export default class AllCardsView extends Vue {
  get currentStudyNote(): StudyNote {
    return notes.currentStudyNote;
  }
}
</script>
