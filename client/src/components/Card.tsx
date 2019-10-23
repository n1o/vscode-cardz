import React, { FC } from 'react';

interface CardProps {
    title: string;
    deck: string;
}

const Card: FC<CardProps> = ({ title, deck }) => {
    return (
        <div className="flex flex-row">
            <div className="px-6 py-1">{title}</div>
            <div className="px-6 py-1">{deck}</div>
        </div>
    )
}

export default Card;