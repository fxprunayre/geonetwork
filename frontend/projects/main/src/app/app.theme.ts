import { Preset } from '@primeuix/themes/types';

// https://github.com/primefaces/primeuix/blob/main/packages/themes/src/presets/aura/base/index.ts

const AppTheme: Preset = {
  primitive: {
    myprimary: {
      '50': '#f3f5f7',
      '100': '#c4cfda',
      '200': '#95a8bc',
      '300': '#66829f',
      '400': '#385b81',
      '500': '#093564',
      '600': '#082d55',
      '700': '#062546',
      '800': '#051d37',
      '900': '#041528',
      '950': '#020d19',
    },
    emerald: {
      '50': '{myprimary.50}',
      '100': '{myprimary.100}',
      '200': '{myprimary.200}',
      '300': '{myprimary.300}',
      '400': '{myprimary.400}',
      '500': '{myprimary.500}',
      '600': '{myprimary.600}',
      '700': '{myprimary.700}',
      '800': '{myprimary.800}',
      '900': '{myprimary.900}',
      '950': '{myprimary.950}',
    },
    sky: {
      '50': '#f4f7fe',
      '100': '#cbdafa',
      '200': '#a1bcf6',
      '300': '#789ef3',
      '400': '#4e81ef',
      '500': '#2563eb',
      '600': '#1f54c8',
      '700': '#1a45a5',
      '800': '#143681',
      '900': '#0f285e',
      '950': '#09193b',
    },
    green: {
      '50': '#f3fcf9',
      '100': '#c6eee1',
      '200': '#98e1c9',
      '300': '#6bd4b1',
      '400': '#3dc699',
      '500': '#10b981',
      '600': '#0e9d6e',
      '700': '#0b825a',
      '800': '#096647',
      '900': '#064a34',
      '950': '#042e20',
    },
    orange: {
      '50': '#fffaf3',
      '100': '#fde8c4',
      '200': '#fbd596',
      '300': '#f9c368',
      '400': '#f7b039',
      '500': '#f59e0b',
      '600': '#d08609',
      '700': '#ac6f08',
      '800': '#875706',
      '900': '#623f04',
      '950': '#3d2803',
    },
    red: {
      '50': '#fef6f6',
      '100': '#fbd2d2',
      '200': '#f8afaf',
      '300': '#f58b8b',
      '400': '#f26868',
      '500': '#ef4444',
      '600': '#cb3a3a',
      '700': '#a73030',
      '800': '#832525',
      '900': '#601b1b',
      '950': '#3c1111',
    },
    slate: {
      '50': '#f7f7f7',
      '100': '#d6d6d7',
      '200': '#b6b6b7',
      '300': '#969697',
      '400': '#767678',
      '500': '#565658',
      '600': '#49494b',
      '700': '#3c3c3e',
      '800': '#2f2f30',
      '900': '#222223',
      '950': '#161616',
    },
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: '4px',
      md: '6px',
      lg: '8px',
      xl: '12px',
    },
  },
  semantic: {
    colorScheme: {
      light: {
        primary: {
          color: '{myprimary.500}',
          contrastColor: '#ffffff',
          // hoverColor: '#fceb2e',
          hoverColor: '{myprimary.600}',
          activeColor: '{myprimary.700}',
        },
        text: {
          color: '{surface.800}',
          hoverColor: '{surface.800}',
          mutedColor: '{surface.500}',
          hoverMutedColor: '{surface.600}',
        },
        content: {
          background: '{surface.0}',
          hoverBackground: '{surface.100}',
          borderColor: '{surface.200}',
          color: '{surface.800}',
          hoverColor: '{text.hover.color}',
        },
      },
    },
  },
  components: {
    // eg. https://github.com/primefaces/primeuix/blob/main/packages/themes/src/presets/aura/button/index.ts
    button: {
      colorScheme: {
        light: {
          root: {},
        },
      },
      // Here we override the border radius for button component - which by default is set by the primitive value
      // root: {
      //   borderRadius: '0'
      // }
    },
    chip: {
      // root: {
      //   borderRadius: '4px'
      // }
    },
    tabs: {
      activeBar: {
        height: '8px',
      },
    },
    accordion: {
      header: {},
    },
  },
};
export default AppTheme;
