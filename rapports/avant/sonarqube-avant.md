# SonarQube – analyse « avant » correctifs

- Date : 13/10/2026
- SonarQube : 9.9.8 LTS Community (`sonarqube:lts-community`)
- Scanner : `sonarsource/sonar-scanner-cli` (Docker)
- Projet : `Covoiturage` – sources `back/src`, `front/src`
- Commit analysé : tag `avant-correctifs`

## Tableau de bord (Overall Code)

| Indicateur | Valeur | Note |
|---|---|---|
| Quality Gate | **Failed** (2 conditions) | Reliability C, Hotspots reviewed 0 % |
| Bugs | 6 | Reliability **C** |
| Vulnerabilities | 0 | Security A |
| Security Hotspots | **5** (0 % reviewed) | Security Review **E** |
| Code Smells | 262 (dette 2j 5h) | Maintainability A |
| Couverture | 0,0 % (3,5k lignes à couvrir) | aucun test |
| Duplications | 0,9 % (12 blocs) | sur 23k lignes |

Captures : `captures/sast-02-avant-dashboard.png`, `sast-03-avant-bugs.png`, `sast-04-avant-code-smells.png`.

## Premier scan incomplet (faux négatif)

Le premier scan affichait *Quality Gate Passed* et 0 problème, mais sur **617 lignes seulement**.
Le log indiquait `Skipped 333 file(s) because they were not part of any tsconfig.json` :
le TypeScript embarqué dans SonarQube 9.9 ne supporte pas `"target": "ES2023"` (back) ni
`"moduleResolution": "bundler"` (front). Correction : `tsconfig.sonar.json` dédié +
`sonar.typescript.tsconfigPaths`. Capture : `captures/sast-01-avant-scan-incomplet-faux-negatif.png`.

## Security Hotspots (5)

| # | Catégorie | Règle | Fichier | Ligne | Priorité | Capture |
|---|---|---|---|---|---|---|
| 1 | Denial of Service | typescript:S5693 – pas de limite de taille d'upload | back/src/report/report.controller.ts | 28 | MEDIUM | sast-05 |
| 2 | Denial of Service | typescript:S5852 – regex vulnérable au backtracking (ReDoS) | back/src/common/helpers/file-upload.helper.ts | 7 | MEDIUM | sast-06 |
| 3 | Weak Cryptography | typescript:S2245 – `Math.random()` pour nommer un fichier uploadé | back/src/report/report.controller.ts | 31 | MEDIUM | sast-07 |
| 4 | Weak Cryptography | typescript:S2245 – `Math.random()` pour l'id d'une notification | front/src/components/notifications/NotificationProvider.tsx | 536 | MEDIUM | sast-08 |
| 5 | Insecure Configuration | typescript:S5122 – CORS `Access-Control-Allow-Origin: *` | back/src/SSE/sse-notifications.controller.ts | 42 | LOW | sast-09 |

## Problèmes NON détectés par SonarQube (faux négatifs)

Repérés en lisant le code, absents des résultats :

| Problème | Fichier | Gravité |
|---|---|---|
| Secret JWT de secours en dur `'super-secret-key'` (actif : `JWT_SECRET` absent du `.env` d'origine) | back/src/auth/strategies/jwt.strategy.ts:13, back/src/auth/auth.module.ts:23 | Haute |
| CORS WebSocket `origin: '*'` | back/src/chat/chat.gateway.ts:23 | Moyenne |
| Upload sans contrôle du type (XSS stocké via .html/.svg servis par ServeStaticModule) | back/src/report/report.controller.ts | Moyenne à haute |
| Extension de fichier prise dans le MIME fourni par le client (`data:text/html;base64,…` → `.html`) | back/src/common/helpers/file-upload.helper.ts:7-10 | Moyenne |
| Logs SQL avec paramètres (`logging: true`) | back/src/app.module.ts:63 | Faible |

## Bugs (6, tous Major – qualité, hors périmètre sécurité)

| Fichier | Ligne | Problème |
|---|---|---|
| front/src/components/Rides/CarpoolRideList.tsx | 18 | Unexpected empty object pattern |
| front/src/components/Rides/joinRquestModal.tsx | 35 | Hook `useMutation` appelé conditionnellement |
| front/src/components/Rides/joinRquestModal.tsx | 48 | Hook `useMutation` appelé conditionnellement |
| front/src/components/Rides/joinRquestModal.tsx | 67 | Hook `useMutation` appelé conditionnellement |
| front/src/components/notifications/NotificationProvider.tsx | 374 | Hook `useQuery` appelé hors composant/hook |
| front/src/pages/Calendar/calendar.tsx | 50 | Hook `useRidesByUser` appelé hors composant/hook |

## Code Smells (262)

Blocker 0 · Critical 14 · Major 108 · Minor 139 · Info 1.
Majoritairement des imports inutilisés (`Remove this unused import`). Hors périmètre du TP.
