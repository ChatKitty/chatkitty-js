# ChatKitty NPM Package

The `chatkitty` NPM package is a powerful tool for integrating chat features into your web applications. It offers a comprehensive set of functionalities that enable developers to create a rich chat experience with minimal effort. Whether you're building a messaging app, adding chat to a social network, or integrating customer support chat into your application, `chatkitty` provides all the necessary components to get started quickly and efficiently.

## Features

- Real-time messaging capabilities
- Support for direct messages, group chats, and channels
- Customizable UI components
- Rich media messages including images, videos, and files
- Typing indicators, read receipts, and message status updates
- User authentication and authorization
- Comprehensive API for advanced customization and integration

## Prerequisites

- Node.js (version 12.x or higher)
- NPM (version 6.x or higher)

## Installation

To start using `chatkitty` in your project, you can install it via npm with the following command:

```bash
npm install chatkitty --save
```

## Basic Usage

### Connecting to ChatKitty

First, you need to establish a connection with the ChatKitty API using your API key and the username of the user who is connecting:

```javascript
import { connectApi } from 'chatkitty';

const apiKey = 'YOUR_CHATKITTY_API_KEY';
const username = 'USER_USERNAME';

const connection = await connectApi({
  apiKey: apiKey,
  username: username,
});

console.log('Connected to ChatKitty as', connection.user.value.username);
```

### Displaying the Chat Interface

You can easily load and display the ChatKitty UI in your application by specifying a widget ID and the container where the chat UI should be rendered:

```javascript
import { loadChatUi } from 'chatkitty';

const chatUi = await loadChatUi({
  widgetId: 'YOUR_WIDGET_ID',
  username: 'USER_USERNAME',
  container: {
    id: 'chat-ui',
    height: '100%',
  },
});

// Optional: To unmount the chat UI
// await chatUi.unmount();
```

### Customizing the Chat Experience

`chatkitty` allows for extensive customization of the chat UI and behavior through themes, localization, audio notifications, and much more. For example, to customize the theme and provide a custom user profile:

```javascript
await loadChatUi({
  widgetId: 'YOUR_WIDGET_ID',
  theme: 'dark',
  profile: {
    displayName: 'John Doe',
    displayPicture: 'https://example.com/user-avatar.jpg',
  },
  // Other options...
});
```

## Advanced Features

`chatkitty` offers advanced features like audio notifications, localization for different languages, custom chat components, and error templates for a tailored chat experience. For more detailed documentation on these features and the complete API, visit the official [ChatKitty documentation](https://chatkitty.com/docs).
