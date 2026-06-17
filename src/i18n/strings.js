export const LANGS = ['nl', 'en'];

export const ui = {
  nl: {
    appTitle: 'GRIP Visualizer',
    appSubtitle: 'Koppel de Vlaamse GRIP-maatregelen aan de Microsoft A3/A5-stack',
    viewMatrix: 'Matrix',
    viewJourney: 'Groeitraject',
    matrixHint: 'Klik op een maatregel voor de Microsoft-koppeling.',
    journeyHint: 'Volg het groeipad van Basis 1 naar Basis 6.',
    basis: 'Basis',
    organisational: 'Organisatorisch',
    technical: 'Technisch',
    license: 'Licentie',
    showA5: 'Toon A5-meerwaarde',
    a5Only: 'Alleen A5',
    a5Badge: 'A5-meerwaarde',
    measure: 'Maatregel',
    measures: 'maatregelen',
    microsoftMapping: 'Microsoft-koppeling',
    noMapping: 'Nog geen Microsoft-koppeling toegevoegd.',
    openDocs: 'Documentatie openen',
    close: 'Sluiten',
    selectMeasure: 'Selecteer een maatregel',
    selectMeasureHint: 'Kies een GRIP-maatregel om de bijpassende Microsoft-oplossingen te zien.',
    type: 'Type',
    legend: 'Legende',
    a5Highlight: 'A5 voegt toe',
    sourcePdf: 'Bron: officiële GRIP-matrix (PDF)',
    langLabel: 'Taal',
    disclaimerTitle: 'Disclaimer',
    disclaimerUnofficial:
      'Dit is een onafhankelijk, niet-officieel hulpmiddel. Het wordt niet door Microsoft of de Vlaamse overheid ondersteund, goedgekeurd of onderhouden, en er wordt geen enkele garantie gegeven. De koppeling tussen GRIP-maatregelen en Microsoft-producten is een eigen interpretatie, afgeleid van openbare bronnen, en vertegenwoordigt Microsoft noch de Vlaamse overheid.',
    disclaimerAi:
      'Deze website is mede met behulp van AI gemaakt (GitHub Copilot met Claude Opus 4.8). Controleer de inhoud, de productkoppelingen en de licentievereisten (A1/A3/A5) altijd zelf tegen de actuele officiële Microsoft- en GRIP-documentatie.',
    disclaimerAdvice:
      'Werk steeds samen met je Microsoft-accountteam of een erkende reseller vóór je een aankoopbeslissing neemt.',
  },
  en: {
    appTitle: 'GRIP Visualizer',
    appSubtitle: 'Mapping the Flemish GRIP measures to the Microsoft A3/A5 stack',
    viewMatrix: 'Matrix',
    viewJourney: 'Journey',
    matrixHint: 'Click a measure to see its Microsoft mapping.',
    journeyHint: 'Follow the growth path from Basis 1 to Basis 6.',
    basis: 'Basis',
    organisational: 'Organisational',
    technical: 'Technical',
    license: 'License',
    showA5: 'Highlight A5 value',
    a5Only: 'A5 only',
    a5Badge: 'A5 value-add',
    measure: 'Measure',
    measures: 'measures',
    microsoftMapping: 'Microsoft mapping',
    noMapping: 'No Microsoft mapping added yet.',
    openDocs: 'Open documentation',
    close: 'Close',
    selectMeasure: 'Select a measure',
    selectMeasureHint: 'Pick a GRIP measure to see the matching Microsoft solutions.',
    type: 'Type',
    legend: 'Legend',
    a5Highlight: 'A5 adds',
    sourcePdf: 'Source: official GRIP matrix (PDF)',
    langLabel: 'Language',
    disclaimerTitle: 'Disclaimer',
    disclaimerUnofficial:
      'This is an independent, unofficial tool. It is not supported, endorsed or maintained by Microsoft or the Flemish government, and no warranty is given or implied. The mapping between GRIP measures and Microsoft products is our own interpretation, derived from public sources, and represents neither Microsoft nor the Flemish government.',
    disclaimerAi:
      'This website was created with the help of AI (GitHub Copilot with Claude Opus 4.8). Always verify the content, the product mappings and the license requirements (A1/A3/A5) yourself against the current official Microsoft and GRIP documentation.',
    disclaimerAdvice:
      'Always work with your Microsoft account team or an authorised reseller before making a purchasing decision.',
  },
};

export function t(lang, key) {
  return (ui[lang] && ui[lang][key]) ?? ui.nl[key] ?? key;
}
