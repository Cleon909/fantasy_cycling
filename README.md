# fantasy_cycling

## Front End
1. Login page - simple page that just shows the login message, gets skipped if already logged in
2. Home page - redirects to login if not logged in otherwise:
    bar at top shows logged in status, user name, user icon, pull down menus. 
    races: (list of races that have been completed)
    riders: (list of riders, where to pull it from, store it ourselves?)
    rules: page with list of scoring rules, rules on picking a team etc.
    account: (account info, change password, what else?)
    main page should show current upcoming race, and team of user if selected if not then a n option to pick the team. 
3. races:
    list of stages: each page with links to pro cycling stats or gets info from it and displays it
    if historical then results
    if current then current standings








## DB Design
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

