import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// const Sextant = definePreset(Aura, {
//   semantic: {
//     primary: {
//       500: '#093564',
//     },
//
//     secondary: {
//       500: '#3866CD',
//       600: '#1A75AE',
//     },
//
//     neutral: {
//       50: '#FFFFFF',
//       100: '#F8F9FA',
//       200: '#F2F5F9',
//       300: '#E0E0E0',
//       400: '#CCCCCC',
//       500: '#6A6E73',
//     },
//
//     background: '#FFFFFF',
//     surface: '#F8F9FA',
//     border: '#E0E0E0',
//     text: '#6A6E73',
//     muted: '#CCCCCC',
//     borderRadius: {
//       md: '16px',
//     },
//   },
//   // components :{
//   //   accordion: {
//   //     panel: {
//   //       borderWidth: '0px',
//   //     },
//   //     header: {
//   //       borderWidth: '0px 0px 1px 0px',
//   //     }
//   //   }
//   // }
// });

const Sextant = definePreset(Aura, {
  extend: {
    myprimary: {
      50: "#E9FBF0",
      100: "#D4F7E1",
      200: "#A8F0C3",
      300: "#7DE8A4",
      400: "#1A75AE",
      500: "#093564", // primary
      600: "#1EAE53",
      700: "#17823E",
      800: "#0F572A",
      900: "#082B15",
      950: "#04160A",
    },
  },
  semantic: {
    primary: {
      50: "{myprimary.50}",
      100: "{myprimary.100}",
      200: "{myprimary.500}",
      300: "{myprimary.300}",
      400: "{myprimary.400}",
      500: "{myprimary.500}",
      600: "{myprimary.600}",
      700: "{myprimary.700}",
      800: "{myprimary.800}",
      900: "{myprimary.900}",
      950: "{myprimary.950}",
    },
  },
});

export default Sextant;
