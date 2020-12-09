# chatkitty-js

<p align="center">
  <img src="https://www.chatkitty.com/images/banner-logo-dark.png" alt="ChatKitty: Cloud Chat Platform" width="315">
  <br/>
  <a href="https://github.com/slatedocs/slate/actions?query=workflow%3ABuild+branch%3Amain"><img src="https://github.com/slatedocs/slate/workflows/Build/badge.svg?branch=main" alt="Build Status"></a>  
</p>

[![NPM](https://nodei.co/npm/chatkitty.png)](https://www.npmjs.com/package/chatkitty)

<p align="center">ChatKitty helps you build real-time chat without any back-end.</p>

<p align="center"><img src="https://www.chatkitty.com/images/blog/posts/building-a-chat-app-with-react-native-and-gifted-chat-part-2/screenshot-channel-chat-screen-another-user.png" width=344 alt="Realtime Chat Demo"></p>

<p align="center"><em>The example above was created with ChatKitty. Check it out at <a href="https://demo.chatkitty.com/">demo.chatkitty.com</a>.</em></p>

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

#### Reliability

#### Low Latency 

#### Reliability

#### Cross-platform support

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

## API Documentation

## Questions? Need Help? Found a bug?

## Contributing
