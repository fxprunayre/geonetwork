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
      '50': '#f4f8fb',
      '100': '#c8deec',
      '200': '#9dc4dc',
      '300': '#71a9cd',
      '400': '#468fbd',
      '500': '#1a75ae',
      '600': '#166394',
      '700': '#12527a',
      '800': '#0e4060',
      '900': '#0a2f46',
      '950': '#071d2c',
    },
    green: {
      '50': '#f7fcfe',
      '100': '#dbeff9',
      '200': '#bee2f4',
      '300': '#a1d5ef',
      '400': '#84c9ea',
      '500': '#67bce5',
      '600': '#58a0c3',
      '700': '#4884a0',
      '800': '#39677e',
      '900': '#294b5c',
      '950': '#1a2f39',
    },
    orange: {
      '50': '#fffcf5',
      '100': '#fdf3cf',
      '200': '#fce9a9',
      '300': '#fbdf84',
      '400': '#f9d65e',
      '500': '#f8cc38',
      '600': '#d3ad30',
      '700': '#ae8f27',
      '800': '#88701f',
      '900': '#635216',
      '950': '#3e330e',
    },
    red: {
      '50': '#fcf4f4',
      '100': '#f1c9c9',
      '200': '#e69e9e',
      '300': '#da7373',
      '400': '#cf4848',
      '500': '#c41d1d',
      '600': '#a71919',
      '700': '#891414',
      '800': '#6c1010',
      '900': '#4e0c0c',
      '950': '#310707',
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
    tabs: {},
    accordion: {
      header: {},
    },
  },
};
export default AppTheme;
