# Pénzügykezelő Alkalmazás 2.0 Tervezet

## A projekt bemutatása és célja
A projekt egy személyes pénzügyeket és kiadásokat kezelő webalkalmazás, amely a 2025 őszi félév Webfejlesztés1 tárgy React alapú frontendjére építkezik. Célja a napi bevételek, kiadások rögzítése, különböző devizájú számlák naprakész kezelése, valamint az adatok egyszerű vizualizációja. A féléves feladat keretében ez kiegészül egy teljes értékű Node.js + MongoDB alapú backenddel.

## Követelmények
- **Node.js backend:** Express.js alapú REST API.
- **Felhasználókezelés:** JWT alapú bejelentkezés és regisztráció, profiladatok (alapvaluta, havi célok) módosítása, valamint a saját bejegyzések kezelése.
- **MongoDB adatbázis:** Mongoose segítségével tároljuk a felhasználókat, számlákat, bejegyzéseket, címkéket és limiteket.
- **HTTP Metódusok:** Minden fő entitás teljes CRUD műveleteket kap (pl. bejegyzések lekérdezése, hozzáadása, szerkesztése, törlése).
- **Meglévő UI integráció:** A meglévő React frontend át lesz alakítva, hogy a localStorage helyett az új backend szerverrel kommunikáljon.
- **File feltöltés:** A kiadásokhoz/bevételekhez bizonylatokat (img/pdf) lehet csatolni, amelyeket a szerver tárol multer segítségével.

## Főbb funkciók és működés
A rendszer az alapvető pénzügyi műveleteken túl a következő főbb funkciókra épül:

- **Felhasználói fiókok kezelése**
  Minden felhasználó saját profillal rendelkezik, miután regisztrált. A bejelentkezést követően a rendszer teljes adatszeparációt biztosít: mindenki kizárólag a saját számláit, bejegyzéseit és kiadásait látja és kezelheti. A profilban lehetőség van a preferált alapvaluta beállítására is.

- **Bizonylatok csatolása (Fájlfeltöltés)**
  Bármelyik kiadáshoz vagy bevételhez lehetőség van dokumentumok (például  blokkok, nyugták, e-számlák fényképei) feltöltésére, amelyeket a szerver eltárol.

- **Címkék használata**
  A fix kategóriákon felül a tranzakciókhoz egyedi címkék adhatók, így jóval átláthatóbb és szűrhetőbb lesz a pénzköltés.

- **Költési limitek és vizualizáció**
  A felhasználó havi költségkeretet tud meghatározni, aninek az állapota a főképernyőn jelenik meg.