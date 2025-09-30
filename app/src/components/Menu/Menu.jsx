
const races = [{ id: 1, name: 'world-championship' }, { id: 2, name: 'tour-de-france' }, { id: 3, name: 'vuelta-a-espana' }]

export default function Menu({ selectRace, race }) {
    return (
        <div className="Menu">
            <h2>Races</h2>
            <ul>
                {races.map((raceEl) => (
                    <li key={raceEl.id}>
                        <button
                            onClick={() => {
                                selectRace(raceEl.name);
                            }}
                            className={race === raceEl.id ? 'active' : ''}
                        >
                            {raceEl.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div >
    )
}