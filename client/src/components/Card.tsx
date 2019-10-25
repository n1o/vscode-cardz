import React, { FC } from 'react';

interface CardProps {
    front: string;
    deck: string;
}

const Card: FC<CardProps> = ({ front, deck }) => {
    return (
        <div className="flex flex-row">
            <div className="px-6 py-1">{front}</div>
            <div className="px-6 py-1">{deck}</div>
        </div>
    )
}

export default Card;