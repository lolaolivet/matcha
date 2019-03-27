Services and their API endpoints
================================

## Reference
See full description on [app.apiary.io/pamicel](https://app.apiary.io/matchaprofile)

## Drafts
! NOT THE SOURCE OF TRUTH

### MATCHER
| type | route                             | name                    | `body`                 | reponse          | details                                                                                     |
|------|-----------------------------------|-------------------------|------------------------|------------------|---------------------------------------------------------------------------------------------|
| POST | /matcher/potential-likes          | list of potential likes | `user_id + filtres`    | list of profiles | tell me who I am am interested in                                                           |
| POST | /matcher/block                    | block                   | `user_id + user_2_id ` | success/failure  | checks for previous block and if none exist, create a "user1 blocked user2" token in the db |
| GET  | /matcher/matches?id=1234          | list of matches         |                        | list of profiles |                                                                                             |
| GET  | /matcher/like?id=1234             | list of likes           |                        | list of profiles |                                                                                             |
| POST | /matcher/like                     | like                    | `user_id + user_2_id ` | success/failure  | -- TODO                                                                                     |
| POST | /matcher/unblock                  | unblock                 | `user_id + user_2_id ` | success/failure  | -- TODO                                                                                     |
| POST | /matcher/unlike?id1=1234&id2=3456 | unlike                  | `user_id + user_2_id ` | success/failure  | -- TODO                                                                                     |
| POST | /matcher/consult                  | consulted (add)         | `user_id + user_2_id ` | success/failure  | logs a "user1 consulted user2's profile" token to the db                                    |
| GET  | /matcher/consult?all\             | id1=1234&id2=3456       | retrieve consultations |                  | list of profiles                                                                            |
| POST | /matcher/location                 | log location            | `user_id + location`   | success/failure  |                                                                                             |
| GET  | /matcher/location?id=1234         | get location            |                        | location         |                                                                                             |

<br>

### PROFILE
| type   | route                 | title           | argument(s)                 | response                                                  |
|--------|-----------------------|-----------------|-----------------------------|-----------------------------------------------------------|
| POST   | /profile              | create profile  | body : full profile         | success OR reason for failure                             |
| DELETE | /profile?id=1234      | delete profile  | query : userid              | success OR reason for failure                             |
| GET    | /profile/info?id=1234 | get infos       | query : userid              | full profile                                              |
| POST   | /profile/info         | edit infos      | body : values to be updates | full profile + summary of what was updated an what wasn't |
| GET    | /profile/img?id=1234  | get user images | query : userid              | full profile                                              |
| POST   | /profile/img          | edit images     | body : values to be updates | full profile + summary of what was updated an what wasn't |

<br>

### AUTH
| type | route             | title                                  | ` argument(s) `            | special action             |
|------|-------------------|----------------------------------------|----------------------------|----------------------------|
| GET  | auth/check        | is connected ? (aka "is my jwt valid") | ` jwt `                    |                            |
| POST | auth/register     | create account                         | ` email + password + ... ` | email a token              |
| POST | auth/confirm      | confirm account                        | ` token `                  |                            |
| POST | auth/change-pwd   | ask for pwd change                     | ` email `                  | email a token              |
| POST | auth/new-pwd      | change password                        | ` token `                  |                            |
| POST | auth/change-email | change email                           | ` email `                  | email confirmation request |
| POST | auth/login        | login                                  | ` (email login) + pwd `    |                            |
| GET  | auth/logout       | logout                                 | ` jwt `                    |                            |

<br>


> RQ
>
> normally logging out consists simply in deleting the jwt from the client's computer
> this route is for activity log, in practice the user sends it's jwt, the server checks the
> jwt, if correct logs the activity, if not correct doesn't, and in any case, responds with an
> order to the client to delete the jwt.

> RQ
>
> In case of email change : can't connect from somewhere else until confirm, but no logout on current session.

> TODO
>
> Describe reporting mechanism
