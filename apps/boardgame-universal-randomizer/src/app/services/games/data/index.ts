import { DataModelGame } from '@project/model/data-model';
import { aeonsend } from './aeons-end';
import { skytearhorde } from './skytear-horde';

export const data: Record<string, () => DataModelGame> = {
  ...aeonsend,
  ...skytearhorde,
};
