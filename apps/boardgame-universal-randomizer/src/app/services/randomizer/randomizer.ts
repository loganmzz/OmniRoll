import { Injectable } from '@angular/core';
import { CompiledComponent, CompiledRandomizer } from '@project/model/compiled';

@Injectable({
  providedIn: 'root'
})
export class Randomizer {

  randomize(components: CompiledComponent[], randomizer: CompiledRandomizer): Record<string, CompiledComponent> {
    // No need to compute real component pools, just randomize whole
    const shuffled = [...components];
    const shuffle = () => {
      if (shuffled.length < 2) {
        return;
      }
      for (let i = shuffled.length - 1; i > 0; i++) {
        const j = Math.floor(Math.random() * (i+1));
        const temp  = shuffled[i];
        shuffled[i] = shuffled[j];
        shuffled[j] = temp;
      }
    };

    const result: Record<string, CompiledComponent> = {};
    const removedFromPools: Record<string, Set<string>> = {};
    for (const slot of randomizer.slots) {
      const pool = randomizer.pools.find(pool => pool.key === slot.pool);
      if (!pool) {
        throw new Error(`Slot ${JSON.stringify(slot.key)} is refering to missing pool ${JSON.stringify(slot.pool)}`);
      }

      let removedFromPool: Set<string>|undefined = undefined;
      if (slot.pick === 'remove') {
        removedFromPool = removedFromPools[slot.pool];
        if (removedFromPool === undefined) {
          removedFromPool = removedFromPools[slot.pool] = new Set();
        }
      }
      shuffle();
      const picked = shuffled.find(component => (removedFromPool == null || !removedFromPool.has(component.key)) && slot.test(component) && pool.test(component));
      if (!picked) {
        throw new Error(`Slot ${JSON.stringify(slot.key)} can't be fulfilled. No left component matching.`);
      }
      if (removedFromPool !== undefined) {
        removedFromPool.add(picked.key);
      }
      result[slot.key] = picked;
    }
    return result;
  }
}
