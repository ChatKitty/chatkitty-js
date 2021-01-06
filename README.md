# chatkitty-js

<p align="center">
  <img src="https://www.chatkitty.com/images/banner-logo-dark.png" alt="ChatKitty: Cloud Chat Platform" width="315">
  <br/>
</p>

<p align="center">ChatKitty helps you build real-time chat without any back-end.</p>

<p align="center"><img src="https://www.chatkitty.com/images/blog/posts/building-a-chat-app-with-react-native-and-gifted-chat-part-2/screenshot-channel-chat-screen-another-user.png" width=344 alt="Realtime Chat Demo"></p>

<p align="center"><em>The example above was created with ChatKitty. Check it out at <a href="https://demo.chatkitty.com/">demo.chatkitty.com</a>.</em></p>

<a href="https://www.npmjs.com/package/chatkitty"><img src="https://nodei.co/npm/chatkitty.png" alt="NPM Package"></a>  

[![Build Status](https://travis-ci.com/ChatKitty/chatkitty-js.svg?branch=master)](https://travis-ci.com/ChatKitty/chatkitty-js)

Features
------------
* **Private chat** - Provide secure and encrypted direct messaging to your users.

* **Group chat** - Your users can request to join or be invited to group chats.

* **Message threads** - Keep conversations organized with message threads.

* **Push notifications** - Make sure your users always see their messages.

* **File attachments** - Attach images, videos, or any other type of files.

* **Typing indicators** - Let your users know when others are typing.

* **Reactions** - Users can react to messages with emojis and GIFs.

* **Presence indicators** - Let your users know who's online.

* **Delivery and read receipts** - See when messages get delivered and read.

* **Link preview generation** - Messages with links get rich media previews.

ChatKitty is the first complete chat platform; bringing together everything that's 
required to build real-time chat into Web and mobile apps. Getting started with ChatKitty 
is easy and you get:

#### Reliability
Your user chat sessions remain stable even in the presence of proxies, load balancers and personal 
firewalls. ChatKitty provides auto reconnection support and offline notifications so your users stay 
in the loop.

#### Low Latency 
With response times below 100ms, ChatKitty makes sure your users have a smooth and immersive chat 
experience.

#### Cross-platform support
You can use ChatKitty across every major browser and device platform. ChatKitty also works great 
with multi-platform frameworks like React-Native and Ionic.

#### Simple and convenient API

Sample code:

```js
let kitty = ChatKitty.getInstance(CHATKITTY_API_KEY);

useEffect(() => {
  // start real-time chat session
  let result = kitty.startChatSession({
    channel: channel,
    onReceivedMessage: (message) => {
      showMessage(message); // update your UI as new chat events occur
    },
  });

  return result.session.end;
}, []);
```

We've spent a lot of time thinking of the right abstractions and implementing our API to be straightforward 
and easy to use - making you more productive.

## Installation
### Install with NPM
```bash
npm install chatkitty
```

### Install with Yarn
```bash
yarn add chatkitty
```

## How to use
### Getting an API key 
You'll need [a free ChatKitty account](https://dashboard.chatkitty.com/authorization/register) before you can 
begin building chat with ChatKitty. After creating your account, create a ChatKitty application using the dashboard 
and copy its API key from your application's setting page.

### Initialize the SDK with your API key
With your API key you can initialize a new instance of the [ChatKitty JS client](https://chatkitty.github.io/chatkitty-js/classes/_lib_chatkitty_.chatkitty.html):
```js
let kitty = ChatKitty.getInstance(CHATKITTY_API_KEY);
```

### Starting a user session
To make calls to ChatKitty as a user, a user session must be started.

You can start a user session using the unique username of a user and optional authentication 
parameters to secure the user session.

```js
await kitty.startSession({
  username: email,
});
```

### Starting a chat session
Before a user can begin sending and receiving real-time messages and use in-app chat features like 
typing indicators, delivery and read receipts, emoji and like reactions, etc, you'll need to start a chat session.

```js
kitty.startChatSession({
  channel: channel,
  onReceivedMessage: (message) => {
    // handle received messages
  },
  onReceivedKeystrokes: (keystrokes) => {},
  onTypingStarted: (user) => {},
  onTypingStopped: (user) => {},
  onParticipantEnteredChat: (user) => {},
  onParticipantLeftChat: (user) => {},
  onParticipantPresenceChanged: (user) => {},
});
```

#### Chat session event handler methods
Name | Parameter Type | Description
---- | -------------- | -----------
`onReceivedMessage` | `Message` | Called when a message is sent to this channel.
`onReceivedKeystrokes` | `Keystrokes` | Called when typing keystrokes are made by users actively chatting in this channel.
`onTypingStarted` | `User` | Called when a user starts typing in this channel.
`onTypingStopped` | `User` | Called when a user stops typing in this channel.
`onParticipantEnteredChat` | `User` | Called when another user starts an active chat session in this channel.
`onParticipantLeftChat` | `User` | Called when another user ends their active chat session in this channel.
`onParticipantPresenceChanged` | `User` | Called when a member of this channel changes their presence status or goes online or offline.

## API Documentation
Please see the documentation for this SDK at the [ChatKitty Website](https://docs.chatkitty.com/javascript/).

The source code of the website can be found [here](https://github.com/ChatKitty/chatkitty-api-docs). Contributions are welcome!

A complete SDK reference document is hosted at https://chatkitty.github.io/chatkitty-js/

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
* [axios](https://github.com/axios/axios)
* [RxJS](https://github.com/ReactiveX/RxJS)
* [RxStomp](https://github.com/stomp-js/rx-stomp)
* [text-encoding](https://github.com/inexorabletash/text-encoding)
