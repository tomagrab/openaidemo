export function handleFunctionCall(
  fnCallItem: {
    [key: string]: unknown;
    content?: string;
  },
  setHeaderEmoji: (emoji: string) => void,
  setTheme: (theme: string) => void,
  setHomePageContent: (content: string) => void,
) {
  const parsedArgs =
    typeof fnCallItem.arguments === 'string'
      ? JSON.parse(fnCallItem.arguments)
      : fnCallItem.arguments;

  switch (fnCallItem.name) {
    case 'setHeaderEmoji':
      try {
        if (
          typeof parsedArgs === 'object' &&
          parsedArgs &&
          'emoji' in parsedArgs &&
          typeof parsedArgs.emoji === 'string'
        ) {
          setHeaderEmoji(parsedArgs.emoji);
        }
      } catch (error) {
        console.error('Error setting header emoji:', error);
      }
      break;
    case 'setTheme':
      try {
        if (
          typeof parsedArgs === 'object' &&
          parsedArgs &&
          'theme' in parsedArgs &&
          typeof parsedArgs.theme === 'string'
        ) {
          setTheme(parsedArgs.theme);
        }
      } catch (error) {
        console.error('Error setting theme:', error);
      }
      break;
    case 'setHomePageContent':
      try {
        if (
          typeof parsedArgs === 'object' &&
          parsedArgs &&
          'content' in parsedArgs &&
          typeof parsedArgs.content === 'string'
        ) {
          setHomePageContent(parsedArgs.content);
        }
      } catch (error) {
        console.error('Error setting home page content:', error);
      }
      break;
    default:
      console.log('Unhandled function call:', fnCallItem);
      break;
  }
}
