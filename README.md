# fantasy_cycling

objects:
user:
    id: int
    name: string
    team: string
    email: string
    password_hash: string

team:
    id: int
    name: string
    user: id(foreign_key)
    team: int[]
    points: int

league:
    name: string
    teams: ids

