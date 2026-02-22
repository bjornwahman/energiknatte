const fs = require('fs');
const path = require('path');

const templates = [
  {
    baseName: 'bananboost med nötsvirvel',
    energy: 320,
    boost: 'Kalium + nyttiga fetter för jämn energi',
    ingredients: ['1 stor banan', '2 msk krämigt jordnötssmör', '1 msk chiafrön', '1 tsk kakaonibs'],
    time: '3 min',
    moods: ['sött', 'crunch'],
    kind: 'quick',
    instructions: [
      'Skala bananen och skiva den i 1 cm tjocka bitar.',
      'Lägg skivorna på ett fat eller en tallrik.',
      'Bred jordnötssmör på varje skiva och strö över chiafrön.',
      'Toppa med kakaonibs och servera direkt eller kyl i 5 minuter för extra crunch.'
    ]
  },
  {
    baseName: 'havre-yoghurt swirl',
    energy: 290,
    boost: 'Protein + långsamma kolhydrater för hållbar mättnad',
    ingredients: ['2 dl grekisk yoghurt 4%', '0.75 dl havregryn', '0.5 dl frysta blåbär', '1 tsk honung'],
    time: '5 min',
    moods: ['sött'],
    kind: 'quick',
    instructions: [
      'Rör ihop yoghurt och havregryn i en skål.',
      'Tina de frysta blåbären lätt (20 sek i mikro) om du vill undvika iskristaller.',
      'Vänd ner blåbären i yoghurten och ringla över honungen.',
      'Servera direkt eller låt svälla 5 minuter för mjukare havre.'
    ]
  },
  {
    baseName: 'quesadilla med ost & bönor',
    energy: 350,
    boost: 'B-vitaminer och fiber för hjärnfokus',
    ingredients: ['1 fullkornstortilla 20 cm', '0.75 dl svarta bönor, sköljda', '0.75 dl riven ost', '2 msk majs'],
    time: '7 min',
    moods: ['salt'],
    kind: 'quick',
    instructions: [
      'Värm en torr stekpanna på medelhög värme.',
      'Lägg tortillan i pannan och strö ost, bönor och majs över halva ytan.',
      'Vik tortillan dubbel och stek 2–3 minuter per sida tills osten smälter.',
      'Skär i trekanter och servera med valfri dip.'
    ]
  },
  {
    baseName: 'trail mix raketer',
    energy: 360,
    boost: 'Snabb energi + omega 3 från nötter och frön',
    ingredients: ['3 msk mandlar', '2 msk pumpafrön', '2 msk torkad mango i bitar', '1 msk mörka chokladknappar'],
    time: '1 min',
    moods: ['crunch', 'sött'],
    kind: 'quick',
    instructions: [
      'Hacka mandlarna grovt om du vill ha mindre bitar.',
      'Blanda alla ingredienser i en liten burk eller skål.',
      'Rosta snabbt i torr panna 1 minut för extra smak (valfritt).',
      'Ät direkt eller ta med som on-the-go-snack.'
    ]
  },
  {
    baseName: 'riskakor med avokadokross',
    energy: 305,
    boost: 'Kombination av bra fetter och knaprig textur',
    ingredients: ['2 fullkornsriskakor', '1/2 mogen avokado', '1 tsk limejuice', '1 nypa chiliflakes'],
    time: '4 min',
    moods: ['salt', 'crunch'],
    kind: 'quick',
    instructions: [
      'Mosa avokadon med limejuice i en liten skål.',
      'Salta lätt och smaksätt med chiliflakes.',
      'Bred avokadokrossen på riskakorna.',
      'Toppa med extra chiliflakes eller frön om du vill.'
    ]
  },
  {
    baseName: 'power muffins med morot',
    energy: 250,
    boost: 'Järn + protein i förberedd batch',
    ingredients: ['1.5 dl havregryn', '1 dl riven morot', '1 ägg', '0.5 dl osötat äppelmos', '0.5 tsk kanel'],
    time: '15 min',
    moods: ['sött'],
    kind: 'batch',
    instructions: [
      'Sätt ugnen på 190 °C och klä en minimuffinsplåt.',
      'Blanda alla ingredienser i en skål till en tjock smet.',
      'Fördela smeten i 8–10 formar (fyll till 3/4).',
      'Grädda 12–14 minuter, låt svalna och förvara i kyl upp till 4 dagar.'
    ]
  },
  {
    baseName: 'äppelskivor med tahini-karamell',
    energy: 315,
    boost: 'Balans mellan sött och salt + magnesium',
    ingredients: ['1 äpple i klyftor', '2 msk tahini', '1 msk dadelsirap', '1 tsk rostade sesamfrön'],
    time: '3 min',
    moods: ['sött', 'salt'],
    kind: 'quick',
    instructions: [
      'Skär äpplet i tunna klyftor eller ringar.',
      'Vispa ihop tahini och dadelsirap till en sås.',
      'Doppa eller ringla såsen över äpplet.',
      'Strö över sesamfrön precis innan servering.'
    ]
  },
  {
    baseName: 'chokladig chia deluxe',
    energy: 295,
    boost: 'Omega 3 och magnesium för lugn fokus',
    ingredients: ['3 msk chiafrön', '2.5 dl havremjölk', '1 msk kakao', '1 msk lönnsirap'],
    time: 'förbereds kvällen innan',
    moods: ['sött'],
    kind: 'batch',
    instructions: [
      'Vispa ihop havremjölk, kakao och lönnsirap i en burk.',
      'Rör ner chiafrön och låt stå 10 minuter, rör igen så att klumpar försvinner.',
      'Ställ i kyl över natten.',
      'Toppa med frukt eller kokos på morgonen.'
    ]
  },
  {
    baseName: 'grön smoothie rocket',
    energy: 300,
    boost: 'Snabbt grönsaksintag plus protein',
    ingredients: ['2 dl spenat', '1 kiwi utan skal', '1 dl ananas i bitar', '1 dl naturell yoghurt', '0.5 dl vatten'],
    time: '4 min',
    moods: ['sött'],
    kind: 'quick',
    instructions: [
      'Lägg alla ingredienser i en blender.',
      'Mixa 30–40 sekunder tills konsistensen är helt slät.',
      'Justera tjockleken med mer vatten vid behov.',
      'Servera iskall direkt.'
    ]
  },
  {
    baseName: 'proteinplättar mini-stack',
    energy: 330,
    boost: 'Ägg + havre ger långvarig energi',
    ingredients: ['1 ägg', '0.75 dl havregryn', '0.5 banan', '0.5 tsk bakpulver'],
    time: '8 min',
    moods: ['sött'],
    kind: 'quick',
    instructions: [
      'Mixa alla ingredienser till en jämn smet.',
      'Hetta upp en liten stekpanna med lite smör eller kokosolja.',
      'Stek små plättar (ca 2 msk smet) 1–2 minuter per sida.',
      'Stapla på en tallrik och toppa med bär eller yoghurt.'
    ]
  },
  {
    baseName: 'edamame crunch-koppar',
    energy: 310,
    boost: 'Proteinrikt snack med salt crunch',
    ingredients: ['2 dl frysta edamame, tinade', '1 tsk sesamolja', '1 tsk soja', '1 tsk rostade sesamfrön'],
    time: '6 min',
    moods: ['salt', 'crunch'],
    kind: 'quick',
    instructions: [
      'Tina edamame (2 min i mikro eller i varmt vatten).',
      'Blanda med sesamolja och soja i en skål.',
      'Rosta lätt i torr panna 2 minuter för extra smak.',
      'Strö över sesamfrön och servera i små koppar.'
    ]
  },
  {
    baseName: 'rostad kikärtsskål',
    energy: 335,
    boost: 'Fiber + protein = hållbar energi',
    ingredients: ['2 dl kokta kikärter', '1 msk olivolja', '0.5 tsk rökt paprikapulver', '1 tsk honung'],
    time: '12 min',
    moods: ['salt'],
    kind: 'quick',
    instructions: [
      'Sätt ugnen på 200 °C eller värm en airfryer.',
      'Blanda kikärter med olja, paprikapulver och honung.',
      'Rosta 10–12 minuter tills de är knapriga.',
      'Låt svalna 2 minuter innan servering.'
    ]
  },
  {
    baseName: 'cottage cloud bowl',
    energy: 300,
    boost: 'Kalciumrikt mellanmål med crunch',
    ingredients: ['1.5 dl cottage cheese', '0.5 dl granola', '0.5 dl hallon', '1 tsk pumpakärnor'],
    time: '3 min',
    moods: ['sött', 'crunch'],
    kind: 'quick',
    instructions: [
      'Skeda upp cottage cheese i en skål.',
      'Toppa med hallon och granola.',
      'Strö över pumpakärnor.',
      'Ät direkt eller ta med i burk.'
    ]
  },
  {
    baseName: 'wrap med kalkon & hummus',
    energy: 340,
    boost: 'Protein och komplexa kolhydrater',
    ingredients: ['1 fullkornswrap 20 cm', '2 skivor kalkon', '3 msk hummus', '0.5 dl rivna morötter'],
    time: '5 min',
    moods: ['salt'],
    kind: 'quick',
    instructions: [
      'Bred hummus över hela wrapen.',
      'Lägg på kalkon och rivna morötter.',
      'Rulla ihop hårt och skär i bitar eller ät som rulle.',
      'Packa i folie om den ska med i väskan.'
    ]
  },
  {
    baseName: 'granola cups med yoghurt',
    energy: 285,
    boost: 'Balans mellan crunch och krämigt',
    ingredients: ['0.75 dl granola', '1 dl vaniljyoghurt', '0.25 dl hackad mango', '1 tsk hampafrön'],
    time: '2 min',
    moods: ['sött'],
    kind: 'quick',
    instructions: [
      'Fördela granola i två små skålar eller glas.',
      'Toppa med vaniljyoghurt.',
      'Strö över mango och hampafrön.',
      'Servera direkt så granolan behåller sin crunch.'
    ]
  },
  {
    baseName: 'sötpotatis-toast med feta',
    energy: 320,
    boost: 'Betakaroten + protein',
    ingredients: ['2 skivor rostad sötpotatis (1 cm)', '2 msk färskost', '2 msk smulad fetaost', '1 tsk honung'],
    time: '10 min',
    moods: ['sött', 'salt'],
    kind: 'quick',
    instructions: [
      'Rosta sötpotatisskivorna i brödrost eller ugn ca 5 minuter.',
      'Bred färskost på varje skiva.',
      'Smula över fetaost och ringla honung.',
      'Avsluta med lite svartpeppar.'
    ]
  },
  {
    baseName: 'overnight oats duo',
    energy: 300,
    boost: 'Förberedd burk med fiber och protein',
    ingredients: ['1 dl havregryn', '1 dl mjölk eller växtdryck', '0.5 dl kvarg', '1 msk chiafrön', '0.5 dl bär'],
    time: 'förbereds kvällen innan',
    moods: ['sött'],
    kind: 'batch',
    instructions: [
      'Blanda havregryn, mjölk, kvarg och chia i en burk.',
      'Rör om ordentligt och toppa med bär.',
      'Ställ i kyl minst 4 timmar eller över natten.',
      'Ät kall eller värm snabbt i mikro.'
    ]
  },
  {
    baseName: 'mini pita pizzor',
    energy: 345,
    boost: 'Varmt mellanmål med järn och B12',
    ingredients: ['1 mini pita 12 cm', '2 msk tomatsås', '0.5 dl riven ost', '2 msk hackad paprika'],
    time: '9 min',
    moods: ['salt'],
    kind: 'quick',
    instructions: [
      'Sätt ugnen på 220 °C (grillläge funkar också).',
      'Bred tomatsås på pitabrödet och strö över ost och paprika.',
      'Baka 6–7 minuter tills osten bubblar.',
      'Skär i små trianglar och servera.'
    ]
  },
  {
    baseName: 'nötfri solrossmör-toast',
    energy: 310,
    boost: 'Nötfritt fett + fiber',
    ingredients: ['1 skiva fullkornsbröd', '1.5 msk solrossmör', '5 skivor jordgubb', '1 tsk hampafrön'],
    time: '3 min',
    moods: ['sött'],
    kind: 'quick',
    instructions: [
      'Rosta brödet lätt om du vill.',
      'Bred solrossmör över hela skivan.',
      'Toppa med jordgubbsskivor.',
      'Strö över hampafrön innan servering.'
    ]
  },
  {
    baseName: 'frostig proteinshake',
    energy: 330,
    boost: 'Snabbt flytande mellanmål med protein',
    ingredients: ['2 dl mjölk/växtdryck', '0.5 fryst banan', '1 msk jordnötssmör', '1 msk kakaopulver', 'is efter smak'],
    time: '4 min',
    moods: ['sött'],
    kind: 'quick',
    instructions: [
      'Lägg alla ingredienser i en mixer.',
      'Mixa tills shaken är slät och fluffig.',
      'Tillsätt mer is om du vill ha den tjockare.',
      'Häll upp i glas och servera direkt.'
    ]
  }
];

const variantStyles = [
  { alias: 'hallondamm-twist', extra: 'Topping: fryst hallondamm', energyDelta: 0 },
  { alias: 'citrus-swirlad', extra: 'Ringla: citrusyoghurt', energyDelta: 4 },
  { alias: 'kokos-crunch', extra: 'Crunch: rostade kokoschips', energyDelta: 8 },
  { alias: 'matcha-damm', extra: 'Dust: matchagranulat', energyDelta: 12 },
  { alias: 'kakaolime-boost', extra: 'Boost: kakaonibs + limezest', energyDelta: 16 },
  { alias: 'blåbärschia-swirl', extra: 'Swirl: blåbärschia-kompott', energyDelta: 20 },
  { alias: 'solroskola-topp', extra: 'Topp: karamelliserade solrosfrön', energyDelta: 24 },
  { alias: 'pistageknaster', extra: 'Extra crunch: krossade pistagenötter', energyDelta: 28 },
  { alias: 'passionshonung', extra: 'Ringla: passionsfruktshonung', energyDelta: 32 },
  { alias: 'kanel-flingsalt', extra: 'Dust: kanel + flingsalt', energyDelta: 36 }
];
const colors = [
  '#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff', '#ff4d6d', '#06d6a0', '#ff9f1c', '#4cc9f0', '#f72585',
  '#b5179e', '#7209b7', '#3a0ca3', '#4361ee', '#4895ef', '#80ffdb', '#64dfdf', '#48bfe3', '#5390d9', '#5e60ce',
  '#ffb703', '#fb8500', '#8ecae6', '#219ebc', '#ffccd5', '#cdb4db', '#ffc8dd', '#bde0fe', '#a2d2ff', '#ffafcc'
];

const snacks = [];

templates.forEach((template, tIndex) => {
  variantStyles.forEach((variant, pIndex) => {
    const uniqueIngredients = [...template.ingredients, variant.extra];
    const item = {
      name: `${template.baseName} – ${variant.alias}` ,
      energy: `${template.energy + variant.energyDelta} kcal`,
      boost: template.boost,
      ingredients: uniqueIngredients,
      time: template.time,
      moods: template.moods,
      kind: template.kind,
      color: colors[(tIndex * variantStyles.length + pIndex) % colors.length],
      instructions: template.instructions
    };
    snacks.push(item);
  });
});


const seenKeys = new Set();
const dedupedSnacks = [];
snacks.forEach(item => {
  const key = `${item.ingredients.slice().sort().join('|')}::${item.time}`;
  if (!seenKeys.has(key)) {
    seenKeys.add(key);
    dedupedSnacks.push(item);
  }
});

const expectedTotal = templates.length * variantStyles.length;
if (dedupedSnacks.length !== expectedTotal) {
  console.warn(`Expected ${expectedTotal} snacks, got`, dedupedSnacks.length);
}

const dest = path.join(__dirname, '..', 'data', 'snacks.json');
fs.writeFileSync(dest, JSON.stringify(dedupedSnacks, null, 2));
console.log('Saved', dedupedSnacks.length, 'snacks to', dest);
