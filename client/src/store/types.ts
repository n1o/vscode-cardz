export interface FlashCard {
    title: string;
    deck: string;
}
export interface StudyNote {
    name: string;
    lastReview: Date;
    cards: FlashCard[];
}