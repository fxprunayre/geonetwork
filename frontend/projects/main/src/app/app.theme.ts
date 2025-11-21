import { Preset } from '@primeuix/themes/types';

// https://github.com/primefaces/primeuix/blob/main/packages/themes/src/presets/aura/base/index.ts

const AppTheme: Preset = {
  primitive: {
    myprimary: {
      '50': '#ffffff',
      '100': '#cfd2de',
      '200': '#a0a8bf',
      '300': '#727fa0',
      '400': '#445881',
      '500': '#093564',
      '600': '#102b50',
      '700': '#11223c',
      '800': '#10192a',
      '900': '#0b0f19',
      '950': '#000000',
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
    // To change danger color scale, an option is to redefine the 'red' scale
    sky: {
      '50': '#ffffff',
      '100': '#dfddfc',
      '200': '#bcbdf9',
      '300': '#979ef5',
      '400': '#6c7ff0',
      '500': '#2563eb',
      '600': '#294fb7',
      '700': '#263c86',
      '800': '#202958',
      '900': '#16182e',
      '950': '#000000',
    },
    green: {
      '50': '#ffffff',
      '100': '#d9f2e5',
      '200': '#b3e4cb',
      '300': '#8ad6b2',
      '400': '#5dc899',
      '500': '#10b981',
      '600': '#1c9166',
      '700': '#1d6b4c',
      '800': '#1a4734',
      '900': '#13261d',
      '950': '#000000',
    },
    orange: {
      '50': '#ffffff',
      '100': '#ffebd2',
      '200': '#ffd7a6',
      '300': '#ffc47b',
      '400': '#fdb14d',
      '500': '#f59e0b',
      '600': '#c07c14',
      '700': '#8d5c16',
      '800': '#5d3e14',
      '900': '#31220f',
      '950': '#000000',
    },
    red: {
      '50': '#ffffff',
      '100': '#ffdcd7',
      '200': '#ffb9b0',
      '300': '#ff968a',
      '400': '#f97066',
      '500': '#ef4444',
      '600': '#bb3937',
      '700': '#8a2e2b',
      '800': '#5b221f',
      '900': '#301613',
      '950': '#000000',
    },
    // Surface
    slate: {
      '50': '#ffffff',
      '100': '#dbdbdb',
      '200': '#b8b8b8',
      '300': '#969697',
      '400': '#757577',
      '500': '#565658',
      '600': '#454546',
      '700': '#353536',
      '800': '#252526',
      '900': '#161616',
      '950': '#000000',
    },
    // borderRadius: {
    //   "none": "0",
    //   "xs": "6px",
    //   "sm": "12px",
    //   "md": "18px",
    //   "lg": "24px",
    //   "xl": "30px"
    // }
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
  },
};
export default AppTheme;
