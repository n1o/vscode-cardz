export interface FlashCard {
    front: string;
    deck: string;
}
export interface StudyNote {
    name: string;
    lastReview: Date;
    cards: FlashCard[];
}