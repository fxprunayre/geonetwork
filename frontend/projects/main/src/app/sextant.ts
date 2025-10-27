import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const Sextant = definePreset(Aura, {
  semantic: {
    primary: {
      500: '#093564',
    },

    secondary: {
      500: '#3866CD',
      600: '#1A75AE',
    },

    neutral: {
      50: '#FFFFFF',
      100: '#F8F9FA',
      200: '#F2F5F9',
      300: '#E0E0E0',
      400: '#CCCCCC',
      500: '#6A6E73',
    },

    background: '#FFFFFF',
    surface: '#F8F9FA',
    border: '#E0E0E0',
    text: '#6A6E73',
    muted: '#CCCCCC',
    borderRadius: {
      md: '16px',
    },
  },
  // components :{
  //   accordion: {
  //     panel: {
  //       borderWidth: '0px',
  //     },
  //     header: {
  //       borderWidth: '0px 0px 1px 0px',
  //     }
  //   }
  // }
});

export default Sextant;
