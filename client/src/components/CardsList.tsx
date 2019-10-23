import React , { FC } from 'react';
import { FlashCard } from '../store/types';
import Card from './Card';

interface CardListProps {
    cards: FlashCard[]
}

const CardList: FC<CardListProps> = ({ cards }) => {
    return (
        <div>
            <div className="flex flex-row">
                <div className="px-6 py-1 font-bold"> Card Name </div>
                <div className="px-6 py-1 font-bold"> Deck </div>
            </div>
             { cards && cards.map(card => <Card {...card } key={card.title} />) } 
        </div>
    )
}

export default CardList;