import { Theme, useTheme } from '@aws-amplify/ui-react';
export function AuthStyle() {
  const { tokens } = useTheme();
  const theme: Theme = {
    name: 'Auth Example Theme',
    tokens: {
      colors: {
        font: {
          default: { value: '#000000' },
          primary: { value: '#000000' },
          interactive: {
            value: tokens.colors.black.value,
          },
        },
        border: {},
      },
      components: {
        text: {
          color: { value: '#000000' },
        },
        button: {
          primary: {
            color: { value: tokens.colors.black.value },
            borderColor: { value: tokens.colors.black.value },
            _hover: {
              color: { value: tokens.colors.teal[60].value },
              borderColor: { value: tokens.colors.teal[60].value },
            },
          },
        },
        tabs: {
          item: {
            _focus: {
              color: {
                value: tokens.colors.black.value,
              },
            },
            _hover: {
              color: {
                value: tokens.colors.teal[60].value,
              },
            },
            _active: {
              color: {
                value: tokens.colors.teal[60].value,
              },
            },
          },
        },
      },
    },
  };

  return theme;
}
