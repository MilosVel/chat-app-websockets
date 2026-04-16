- Project Setup

0. kreira se fajl .nvmrc
   0.1 node --version
   0.2 u .nvmrc se ubaci verzija noda 22.12.0 (bitno je da nema slovo v ispred verzije)

1. npm init -y
2. u package.json se dodaje "type": "module",
3. npm i express
4. npm i -D typescript @types/node @types/express @tsconfig/node22
5. npx tsc --init (ovo kreira tsconfig.josn)
6. (npx tsc - ova komanda kreira dist folder i sada se u terminalu za pokretanje projekta moze koristiti sledeca komanda: node dist/index.js - Ali ovo je zastareo nacin za pokretanje aplikcaije, pogledati primer ispod)
7. npm i -D tsx (sada se u terminalu za pokretanje projekta koristi komanda: npx tsx --watch src/index.ts)

- npx tsc --noEmit && npx tsx src/index.ts (ova komanda mi nije jasna sta znaci, to je isto kao i npm run type-check )

- Installing Prettier

1. npm i -D prettier
2. echo '{}' > .prettierrc (ovo kreire .prettierrc)

- ESLint

1. npm i -D eslint typescript-eslint @eslint/js eslint-plugin-perfectionist
2. New-Item eslint.config.js (touch eslint.config.js) ovim se kreira eslint.config.js i u njemu imamo dve varijante

- Adding subpath imports

Ako imamo ovakvu folder strukturu:
src/
├── middlewares/
│ └── middlewares.ts
└── subfolder/
└── subsubfolder/
└── app/
└── index.ts

importovanje fajla u index.ts bi izgledalo ovako
import { middleware } from "../../../middlewares/middlewares.js";

We can fix this by adding an “import” option in our package.json file.

"imports": {
"#_": "./src/_"
}

i sada importovanje fajla u index.ts izgleda ovako:
import { middleware } from "#middlewares/middlewares.js";

- Adding tests with Vitest

1. npm i -D vitest @vitest/coverage-v8 @vitest/eslint-plugin
2. New-Item tsconfig.build.json (touch tsconfig.build.json) ovde se dodaju fajlovi koji nece biti komilirani
3. npm run test
4. New-Item vitest.config.js (touch vitest.config.js)

- Husky

1. npm i -D husky lint-staged
2. npx husky init

- Da se eleminisu prethonde commit messages:
  git checkout --orphan new-main
  git add .
  git commit -m "Website"
  git branch -D main
  git branch -m main
  git push -f origin main
