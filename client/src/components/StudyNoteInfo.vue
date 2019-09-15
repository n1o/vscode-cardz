<template>
    <div>
        <div class="flex flex-row">
            <div class="px-4 py-2 font-bold"> Note: <span class="font-light"> {{ note.name }} </span> </div>
            <div class="px-4 py-2 font-bold"> Last revieved: <span class="font-light"> {{ note.lastReviewed | fromNow }} </span> </div>
            <button class="px-4 py-1 border-solid border-2">Review Now</button>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { StudyNote } from '../store/types';
@Component({ })
export default class StudyNoteInfo extends Vue {
    @Prop()private readonly note: StudyNote | undefined;
}
</script>