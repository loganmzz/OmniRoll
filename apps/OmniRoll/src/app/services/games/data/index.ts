import { aeonsend } from './aeons-end';
import { GameDataLoader } from './loader';
import { skytearhorde } from './skytear-horde';

export const data: Record<string, GameDataLoader> = {
  ...aeonsend,
  ...skytearhorde,
};
