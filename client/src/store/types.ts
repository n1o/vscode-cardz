export interface StudyNote {
    name: string;
    lastReviewed: Date;
  }

export interface State {
    currentStudyNote?: StudyNote;
  }
