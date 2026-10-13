# SonarQube – analyse « après » correctifs SAST

- Date : 13/10/2026
- SonarQube : 9.9.8 LTS Community (l'interface signale que cette version n'est plus maintenue)
- Commit analysé : `b1682f0`

## Avant / après (Overall Code)

| Indicateur | Avant | Après |
|---|---|---|
| Security Hotspots à revoir | **5** | **0** |
| Hotspots revus | 0 % | **100 %** |
| Security Review | **E** | **A** |
| Vulnerabilities | 0 | 0 |
| Bugs | 6 (C) | 6 (C) – qualité React, hors périmètre |
| Code Smells | 262 | 262 – hors périmètre |

Captures : `captures/sast-02-avant-dashboard.png` → `captures/sast-17-apres-final-dashboard-hotspots-100pct.png`.

## Traitement de chaque hotspot

| # | Règle | Fichier | Traitement | Résultat |
|---|---|---|---|---|
| 1 | S5693 – taille d'upload | back/src/report/report.controller.ts | `limits: { fileSize: 5_242_880, files: 1 }` | Corrigé |
| 2 | S5852 – regex ReDoS | back/src/common/helpers/file-upload.helper.ts | découpage `indexOf`/`slice` sans regex, extension imposée par liste blanche, 5 Mo max | Corrigé |
| 3 | S2245 – `Math.random()` | back/src/report/report.controller.ts | `randomUUID()` (module `crypto`) | Corrigé |
| 4 | S2245 – `Math.random()` | front/src/components/notifications/NotificationProvider.tsx | aucun changement – marqué **Safe** | Faux positif |
| 5 | S5122 – CORS `*` | back/src/SSE/sse-notifications.controller.ts | origine limitée à `http://localhost:5173` | Corrigé |

Justification du hotspot #4 (Safe) : `Math.random()` sert uniquement d'identifiant d'affichage local d'une
notification dans le navigateur ; aucune donnée sensible, aucun usage cryptographique ni d'authentification.

## Corrections hors détection SonarQube (faux négatifs)

| Problème | Fichier | Correction |
|---|---|---|
| Secret JWT de secours `'super-secret-key'` | back/src/auth/strategies/jwt.strategy.ts, back/src/auth/auth.module.ts | `configService.getOrThrow('JWT_SECRET')` : démarrage refusé sans secret |
| CORS WebSocket `origin: '*'` | back/src/chat/chat.gateway.ts | `origin: ['http://localhost:5173'], credentials: true` |
| Upload sans contrôle de type (XSS stocké) | back/src/report/report.controller.ts | `fileFilter` : liste blanche MIME + extension |

## Difficultés rencontrées avec l'outil

1. **Faux négatif massif** au premier scan : 333 fichiers TS ignorés (tsconfig ES2023 / `bundler` non supportés
   par SonarQube 9.9) → `tsconfig.sonar.json` dédié.
2. **S5693 toujours signalé avec une limite de 10 Mo** : le seuil par défaut de la règle est 8 Mo → limite ramenée à 5 Mo.
3. **S5693 toujours signalé avec `5 * 1024 * 1024`** : la règle ne lit qu'une valeur littérale → `5_242_880`.
   La protection était déjà effective : c'était un faux positif dû à l'analyse statique.

## Quality Gate toujours « Failed » : pourquoi

Les 3 conditions en échec portent sur le **New Code** (fiabilité C, maintenabilité E, couverture 0 %).
La période « New Code » démarre au premier scan, qui était incomplet : tout le code TypeScript est donc compté
comme « nouveau », avec ses 6 bugs React et 258 code smells préexistants. Aucune condition de **sécurité**
n'échoue. Corriger ces points (tests, refactoring React) dépasse le périmètre SAST du TP.
