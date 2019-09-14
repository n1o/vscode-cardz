export interface CurrentStudyNote {
    name: string;
    lastReviewed: Date;
  }

export interface State {
    currentStudyNote?: CurrentStudyNote;
  }
