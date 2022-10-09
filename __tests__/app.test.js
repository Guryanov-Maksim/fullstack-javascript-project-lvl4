import { result } from 'lodash';
import init from '../server/plugin.js';

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});
