 
=======
# TaskFlow — Application de gestion de projets collaboratifs

## Stack technique
- **Backend** : Node.js, Express, MongoDB, Mongoose
- **Auth** : JWT, bcryptjs
- **Infrastructure** : Docker, Docker Compose
- **Frontend** : HTML, CSS, JavaScript, Axios

## Lancer le projet
```bash
docker-compose up --build
```

## Répartition des fonctionnalités

| Membre | Fonctionnalités |
|--------|----------------|
| Jinane (Chef de projet) | F1 - Authentification, F2 - Gestion des projets, F8 - Gestion des membres, F9 - Historique des activités, Docker & structure |
| Rim | F3 - Gestion des tâches, F4 - Assignation des tâches, F5 - Tableau de bord, F6 - Filtrage & pagination, F7 - Brouillons, F10 - Notifications |

## Branches Git

| Branche | Fonctionnalité |
|---------|----------------|
| feature/authentification | F1 - Auth JWT + bcrypt |
| feature/projets | F2 - CRUD projets |
| feature/membres | F8 - Gestion membres |
| feature/activites | F9 - Historique activités |
| feature/taches | F3 - CRUD tâches |
| feature/assignation | F4 - Assignation tâches |
| feature/dashboard | F5 - Tableau de bord |
| feature/filtrage | F6 - Filtrage & pagination |
| feature/brouillons | F7 - Brouillons LocalStorage |
| feature/notifications | F10 - Notifications |

## Convention de commits
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `refactor:` refactoring
 
