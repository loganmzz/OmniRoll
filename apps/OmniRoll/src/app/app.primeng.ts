import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import { Preset } from '@primeuix/themes/types';
import { providePrimeNG } from 'primeng/config';

const PRESET: Preset | undefined = Aura;

export const primeNGProviders = providePrimeNG({
  ...(
    PRESET === undefined ? {
      unstyled: true,
    } : {
      theme: {
        options: {
          cssLayer: {
            name: 'primeng',
            order: 'base, primeng, omniroll',
          },
        },
        preset: definePreset(
          PRESET,
          {
            semantic: {
              primary: {
                50: '{zinc.50}',
                100: '{zinc.200}',
                200: '{zinc.300}',
                300: '{zinc.400}',
                400: '{zinc.500}',
                500: '{zinc.600}',
                600: '{zinc.700}',
                700: '{zinc.800}',
                800: '{zinc.900}',
                900: '{zinc.950}',
                950: '{zinc.950}'
              },
            },
            components: {
              inplace: {
                display: {
                  hoverBackground: '',
                },
              },
              treetable: {
                bodyCell: {
                  padding: '0',
                },
                nodeToggleButton: {
                  size: 'var(--text-sm)',
                }
              },
              tree: {
                root: {
                  gap: '3px',
                  padding: '0',
                },
                node: {
                  padding: '0',
                },
              },
            }
          },
        ),
      },
    }
  ),
});
