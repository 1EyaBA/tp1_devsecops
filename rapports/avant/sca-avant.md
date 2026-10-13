# SCA – analyse des dépendances « avant » correctifs

- Date : 13/10/2026 – npm 10.9.2, Node 22.16.0
- Fichiers bruts : `npm-audit-back.json` (toutes dépendances), `npm-audit-front.json`

## npm audit – synthèse

| Partie | Critique | Haute | Moyenne | Faible | Total |
|---|---|---|---|---|---|
| back (toutes dépendances) | 1 | 45 | 17 | 0 | 63 |
| back (production, `--omit=dev`) | 1 | 14 | 3 | 0 | 18 |
| front | 1 | 64 | 36 | 3 | 104 |

Remarque : le guide annonçait 0 critique en production côté back ; notre audit en trouve 1, car `tar`
arrive via `bcrypt`, qui est une dépendance de production.

## Snyk – synthèse (`snyk test --all-projects`, fichier `snyk.json`)

| Projet | Dépendances | Problèmes uniques | Critique | Haute | Moyenne | Faible |
|---|---|---|---|---|---|---|
| back (`package-lock.json`) | 467 | 32 | 2 | 19 | 11 | 0 |
| front (`package-lock.json`) | 1367 | 40 | 2 | 13 | 23 | 2 |

Origine des problèmes (dépendance directe qui les introduit) :

| Projet | Dépendance directe | Problèmes | Pire gravité | Détail critique |
|---|---|---|---|---|
| back | `multer` 1.4.5-lts.2 | 12 | **critique** | CVE-2025-48997 (SNYK-JS-MULTER-10299078), corrigé en 2.0.1 ; autres hautes corrigées jusqu'en 2.3.0 |
| back | `apollo-server-express` 3.13.0 | 4 | **critique** | `@apollo/protobufjs` 1.2.6 – CVE-2026-41242 (injection de code) ; paquet abandonné, pas de correctif |
| back | `bcrypt` 5.1.1 | 13 | haute | via `tar` / `@mapbox/node-pre-gyp` |
| back | `graphql-upload`, `@faker-js/faker`, `@apollo/server` | 1 chacun | haute / moyenne | – |
| front | `react-scripts` | 35 | **critique** | `react-dev-utils` 12.0.1 – CVE-2026-14802 |
| front | `swiper` | 1 | **critique** | CVE-2026-27212 |
| front | `next` | 4 | haute | – |

**Apport de Snyk par rapport à npm audit** : npm audit ne signalait ni `multer` ni la critique
d'`apollo-server-express` (classé « moyenne » par npm). Deux outils SCA ne donnent pas les mêmes résultats
(bases de vulnérabilités différentes) : les croiser évite de passer à côté d'une faille critique.

Usage réel dans le code :
- `multer` : uniquement `import { diskStorage } from 'multer'` (report.controller.ts). Le traitement des
  fichiers est fait par le multer embarqué par `@nestjs/platform-express` (déjà en 2.4.0).
- `apollo-server-express` : uniquement `ApolloError` dans `common/filters/graphql-exception.filter.ts`.

## Back – vulnérabilités principales (dépendances directes + critique)

| Gravité | Paquet (version vulnérable) | Identifiants | Introduit par | Correction proposée par npm |
|---|---|---|---|---|
| **Critique** | `tar` ≤ 7.5.20 (transitif) | GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx | `bcrypt` 5.1.1 → `@mapbox/node-pre-gyp` | `bcrypt@6.0.0` (majeure) |
| Haute | `bcrypt` 5.0.1 – 5.1.1 | via `@mapbox/node-pre-gyp` | direct | `bcrypt@6.0.0` (majeure) |
| Haute | `@faker-js/faker` ≤ 10.4.0 | GHSA-qxc2-j82w-r537 | direct (**inutilisé**) | suppression |
| Haute | `@apollo/server` ≤ 5.4.0 | GHSA-9q82-xgwf-vj6h | direct | `@apollo/server@5.5.1` (majeure) |
| Haute | `@nestjs/apollo` 13.1.0 | via `@apollo/server`, playground | direct | 13.4.5 – **exige Apollo 5** (cf. plantage au démarrage, étape 2) |
| Haute | `@nestjs/graphql` | via `@graphql-tools/utils` | direct | 14.x (majeure) |
| Haute | `graphql-upload` ≤ 14 | via `busboy` | direct | 18.x (majeure) |
| Moyenne | `apollo-server-express` (toutes versions) | via `apollo-server-core` | direct | **aucune** (paquet abandonné) |
| Haute | `jest`, `@types/jest`, `@swc/cli` | – | devDependencies | non déployées en production |

## Front – vulnérabilités principales (dépendances directes + critique)

| Gravité | Paquet direct | Identifiants / origine | Utilisé dans le code ? | Correction |
|---|---|---|---|---|
| **Critique** | `swiper` | GHSA-hmx5-qpq5-p643 (pollution de prototype) | **non** (seulement des classes CSS dans `index.css`) | suppression |
| Haute | `react-scripts` | via webpack-dev-server, svgr, babel-jest, eslint… | **non** (projet Vite : scripts `vite`) | suppression |
| Moyenne | `next` | via postcss | **non** | suppression |
| Moyenne | `apollo-angular` | via @angular/core | **non** (client Angular dans un projet React) | suppression |
| – | `@nestjs/serve-static` | paquet backend ; cause aussi le conflit express 4/5 de `npm ci` | **non** | suppression |
| – | `uninstall` | installé par erreur (`npm install uninstall`) | **non** | suppression |
| Haute | `tailwindcss` 3.x | via chokidar, fast-glob, micromatch… | oui | Tailwind 4 (majeure, migration de config) → reporté |
| Moyenne | `tailwind-scrollbar` | via tailwindcss | oui | suit Tailwind 4 → reporté |

Vérification « non utilisé » : aucun `import`/`require` de ces 6 paquets dans `front/src`, `index.html`, `vite.config.ts`.
