function loadWithLanguage(languageCode: string, languageTag: string) {
  jest.resetModules();
  jest.doMock('expo-localization', () => ({ getLocales: () => [{ languageCode, languageTag }] }));
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- re-evaluated per locale
  return require('../i18n') as typeof import('../i18n');
}

describe('i18n', () => {
  it('uses Spanish on Spanish devices', () => {
    const { t, speechLanguage } = loadWithLanguage('es', 'es-MX');
    expect(t.start).toBe('¡A jugar!');
    expect(speechLanguage).toBe('es-MX');
    expect(t.winner(['Ana'])).toBe('¡Ana gana!');
    expect(t.winner(['Ana', 'Leo', 'Sara'])).toBe('¡Ganan Ana, Leo y Sara!');
  });

  it('falls back to English on any other language', () => {
    const { t, speechLanguage } = loadWithLanguage('fr', 'fr-FR');
    expect(t.start).toBe('Let’s play!');
    expect(speechLanguage).toBe('en-US');
    expect(t.winner(['Ana', 'Leo'])).toBe('Ana and Leo win!');
    expect(t.playersLeft(1)).toBe('1 player left');
  });
});
