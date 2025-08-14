// components/FontManager.ts
import { Font } from "@react-pdf/renderer";

export const registerPdfFonts = () => {
  try {
    Font.register({
      family: 'Calibri',
      fonts: [
        {
          src: '/fonts/calibri-regular.ttf',
          fontWeight: 'normal',
        },
        {
          src: '/fonts/calibri-bold.ttf',
          fontWeight: 'bold',
        },
      ],
    });
  } catch (error) {
    console.error('Error al registrar fuentes:', error);
  }
};

export const pdfFontStyles = {
  normal: {
    fontFamily: 'Calibri',
    fontWeight: 'normal',
  },
  bold: {
    fontFamily: 'Calibri',
    fontWeight: 'bold',
  },
};
