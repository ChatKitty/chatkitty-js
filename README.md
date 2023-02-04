ChatKitty JS Core SDK / [Exports](modules.md)

# @chatkitty/core

## Installation
### Install with NPM
```bash
npm install @chatkitty/core
```

### Install with Yarn
```bash
yarn add @chatkitty/core
```

## How to use

### Getting an API key
You'll need [a ChatKitty account](https://dashboard.chatkitty.com/authorization/register) before you can
begin building chat with ChatKitty. After creating your account, create a ChatKitty application using the dashboard
and copy its API key from your application's setting page.

### Initialize the SDK with your API key
With your API key you can initialize a new instance of the [ChatKitty JS client](https://chatkitty.github.io/chatkitty-js/classes/default.html):

```js
const chatkitty = ChatKitty.getInstance(CHATKITTY_API_KEY);
```

### Starting a user session
To make calls to ChatKitty as a user, a user session must be started.

You can start a user session using the unique username of a user and optional authentication
parameters to secure the user session.

```js
await chatkitty.startSession({
  username: email,
});
```

### Starting a chat session
Before a user can begin sending and receiving real-time messages and use in-app chat features like
typing indicators, delivery and read receipts, emoji and like reactions, etc, you'll need to start a chat session.

```js
chatkitty.startChatSession({
  channel: channel,
  onMessageReceived: (message) => {
    // handle received messages
  },
  onKeystrokesReceived: (keystrokes) => {
    // handle received typing keystrokes
  },
  onTypingStarted: (user) => {
    // handle user starts typing
  },
  onTypingStopped: (user) => {
    // handle user stops typing
  },
  onParticipantEnteredChat: (user) => {
    // handle user who just entered the chat
  },
  onParticipantLeftChat: (user) => {
    // handle user who just left the chat
  },
  onParticipantPresenceChanged: (user) => {
    // handle user who became online, offline, do not distrub, invisible
  },
});
```

All handler methods are optional, so you only needed to register handlers for chat events your application cares about.

#### Chat session event handler methods
| Name                           | Parameter Type | Description                                                                                   |
| ------------------------------ | -------------- | --------------------------------------------------------------------------------------------- |
| `onMessageReceived`            | `Message`      | Called when a message is sent to this channel.                                                |
| `onKeystrokesReceived`         | `Keystrokes`   | Called when typing keystrokes are made by users actively chatting in this channel.            |
| `onTypingStarted`              | `User`         | Called when a user starts typing in this channel.                                             |
| `onTypingStopped`              | `User`         | Called when a user stops typing in this channel.                                              |
| `onParticipantEnteredChat`     | `User`         | Called when another user starts an active chat session in this channel.                       |
| `onParticipantLeftChat`        | `User`         | Called when another user ends their active chat session in this channel.                      |
| `onParticipantPresenceChanged` | `User`         | Called when a member of this channel changes their presence status or goes online or offline. |

## Questions? Need Help? Found a bug?
If you've got questions about setup, usage, special feature implementation in your chat app, or just want to chat with a
ChatKitty dev, please feel free to [start a thread in our Discussions tab](https://github.com/ChatKitty/chatkitty-js/discussions)!

Found a bug with ChatKitty? Go ahead and [submit an issue](https://github.com/ChatKitty/chatkitty-js/issues).
And, of course, feel free to submit pull requests with bug fixes or changes.

## Contributing
We welcome code changes that improve this library or fix a problem, please make sure to follow all best practices
and add tests if applicable before submitting a Pull Request. We are very happy to merge your code.

## License
Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements
- [axios](https://github.com/axios/axios)
- [RxJS](https://github.com/ReactiveX/RxJS)
- [RxStomp](https://github.com/stomp-js/rx-stomp)
