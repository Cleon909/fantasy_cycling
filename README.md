# fantasy_cycling

## Design Considerations

1. need to be able to pick a team
    - allow user to set team name and avatar
    - user has a budget
    - provide list of riders in that race with costs assigned
    - restrict what riders you can choose, 1gc, 1 sprinter etc, ned to classify riders
    - able to swap some riders on rest days?
    - display team with points earned next to riders and total team points
    - need to lock changes after the race has started
    - Only able to change own team!
    - Display rider history

2. need to show race results
    - results widget, ability to look back on previous stage results
    - update results when present on site
    - assign points to riders, could assign points in categories?

3. need to show league table
    - rank teams on points
    - ?could also rank them on points categories, green, polka, gc etc, allow sorting by category
    - also display rider points history through the race

4. Ability to view other teams members
     - only after it is no longer possible to change team
     - Access them via clicking on leage table

5. ?Display upcoming stage details
    - list of stages showing profile, etc. procycling provide lists of climbs, might need to do some own scraping for any images

6. Page showing game rules and how points are allocated

How to have system recognise when races start end etc?





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

