import { fireEvent, render, screen } from '@testing-library/react-native';

import { DEFAULT_SETTINGS, MAX_PLAYERS, type Settings } from '../game';
import { t } from '../i18n';
import { SetupScreen } from '../screens/SetupScreen';

async function setup(settings: Settings = DEFAULT_SETTINGS, recordMs = 0) {
  const onChange = jest.fn();
  const onStart = jest.fn();
  await render(<SetupScreen settings={settings} recordMs={recordMs} onChange={onChange} onStart={onStart} />);
  return { onChange, onStart };
}

it('adds a trimmed player name', async () => {
  const { onChange } = await setup();
  await fireEvent.changeText(screen.getByPlaceholderText(t.namePlaceholder), '  Ana ');
  await fireEvent.press(screen.getByText(t.add));
  expect(onChange).toHaveBeenCalledTimes(1);
  const next: Settings = onChange.mock.calls[0][0];
  expect(next.players).toHaveLength(1);
  expect(next.players[0]).toMatchObject({ name: 'Ana' });
});

it('ignores empty names', async () => {
  const { onChange } = await setup();
  await fireEvent.changeText(screen.getByPlaceholderText(t.namePlaceholder), '   ');
  await fireEvent.press(screen.getByText(t.add));
  expect(onChange).not.toHaveBeenCalled();
});

it('explains team mode and elimination mode', async () => {
  await setup();
  expect(screen.getByText(t.teamHint)).toBeTruthy();
  await screen.unmount();
  await setup({
    ...DEFAULT_SETTINGS,
    players: [
      { id: 'a', name: 'Ana', color: '#F472B6' },
      { id: 'b', name: 'Leo', color: '#60A5FA' },
    ],
  });
  expect(screen.getByText(t.eliminationHint)).toBeTruthy();
  expect(screen.getByText(t.speakNames)).toBeTruthy();
});

it('removes a player when the chip is tapped', async () => {
  const players = [
    { id: 'a', name: 'Ana', color: '#F472B6' },
    { id: 'b', name: 'Leo', color: '#60A5FA' },
  ];
  const { onChange } = await setup({ ...DEFAULT_SETTINGS, players });
  await fireEvent.press(screen.getByLabelText(t.removePlayer('Ana')));
  expect(onChange.mock.calls[0][0].players).toEqual([players[1]]);
});

it('gives each new player a free color', async () => {
  const players = Array.from({ length: MAX_PLAYERS - 1 }, (_, i) => ({ id: `${i}`, name: `P${i}`, color: '' }));
  const { onChange } = await setup({ ...DEFAULT_SETTINGS, players: players.slice(0, 1).map((p) => ({ ...p, color: '#F472B6' })) });
  await fireEvent.changeText(screen.getByPlaceholderText(t.namePlaceholder), 'Leo');
  await fireEvent.press(screen.getByText(t.add));
  expect(onChange.mock.calls[0][0].players[1].color).not.toBe('#F472B6');
});

it('changes the duration and starts the game', async () => {
  const { onChange, onStart } = await setup(DEFAULT_SETTINGS, 75_000);
  await fireEvent.press(screen.getByText(t.minutes(10)));
  expect(onChange.mock.calls[0][0].minutes).toBe(10);
  expect(screen.getByText(t.record('1:15'))).toBeTruthy();
  await fireEvent.press(screen.getByText(t.start));
  expect(onStart).toHaveBeenCalled();
});
