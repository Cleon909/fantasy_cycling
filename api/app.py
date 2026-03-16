from application import app
from application import db
from sqlalchemy import text


def _migrate_race_league_schema():
    """Migrate sqlite schema for RaceLeague to be (race, year)-scoped.

    This project uses sqlite + create_all (no Alembic). SQLite won't alter
    existing tables automatically, so we rebuild `race_league` when needed.
    """

    # Only intended for sqlite.
    uri = app.config.get('SQLALCHEMY_DATABASE_URI', '')
    if not uri.startswith('sqlite:'):
        return

    with app.app_context():
        # Does the table exist?
        exists = db.session.execute(
            text("SELECT name FROM sqlite_master WHERE type='table' AND name='race_league'")
        ).fetchone()
        if not exists:
            return

        cols = db.session.execute(text("PRAGMA table_info('race_league')")).fetchall()
        col_names = {row[1] for row in cols}
        needs_year = 'year' not in col_names

        # If old schema: `race` was unique. We want UNIQUE(race, year).
        index_list = db.session.execute(text("PRAGMA index_list('race_league')")).fetchall()
        has_old_unique_race = False
        for idx in index_list:
            # idx columns: (seq, name, unique, origin, partial)
            if int(idx[2]) != 1:
                continue
            idx_name = idx[1]
            idx_cols = db.session.execute(text(f"PRAGMA index_info('{idx_name}')")).fetchall()
            idx_col_names = [c[2] for c in idx_cols]
            if idx_col_names == ['race']:
                has_old_unique_race = True
                break

        if not needs_year and not has_old_unique_race:
            return

        # Rebuild the table.
        db.session.execute(text("ALTER TABLE race_league RENAME TO race_league_old"))
        db.session.execute(
            text(
                "CREATE TABLE race_league ("
                "id INTEGER PRIMARY KEY, "
                "race VARCHAR(64), "
                "year INTEGER NOT NULL DEFAULT 2026, "
                "league TEXT, "
                "CONSTRAINT uq_race_league_race_year UNIQUE (race, year)"
                ")"
            )
        )
        if 'league' in col_names and 'race' in col_names:
            db.session.execute(
                text(
                    "INSERT INTO race_league (id, race, year, league) "
                    "SELECT id, race, 2026, league FROM race_league_old"
                )
            )
        db.session.execute(text("DROP TABLE race_league_old"))
        db.session.commit()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        _migrate_race_league_schema()
        app.run(host="0.0.0.0", port=5051, debug=True)