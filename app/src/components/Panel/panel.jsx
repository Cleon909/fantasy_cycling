import { useState, useEffect } from 'react';
import Riders from '../riders/riders';
import Menu from '../Menu/Menu'
import './panel.css';

export default function Panel() {
    const [race, setRace] = useState(null)
    return (
        <>
            <Menu
                selectRace={setRace}
                race={race}
            />
            <Riders race={race} />
        </>
    )
}