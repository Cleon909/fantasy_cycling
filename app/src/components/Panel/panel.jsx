import { useState, useEffect } from 'react';
import Riders from '../Riders/Riders';
import Menu from '../Menu/Menu'
import './Panel.css';

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