<template>
  <div id="app" class="container">
    <div class="header">
      <!-- Your header content -->
      <img alt="Example App Logo" src="./assets/logo.png" height="125" width="125">
    </div>
    <div class="example-chat-ui-wrapper">
      <!-- Chat UI will be rendered here -->
      <div id="chat-ui"></div>
    </div>
  </div>
</template>

<script>
import {connectApi, loadChatUi, template} from "chatkitty";

export default {
  name: 'App',
  async mounted() {
    const connection = await connectApi(
        {
          apiKey: 'afaac908-1db3-4b5c-a7ae-c040b9684403',
          username: '2989c53a-d0c5-4222-af8d-fbf7b0c74ec6'
        }
    )

    const {user, unreadChannelsCount, notifications, updateUser} = connection

    console.log('Connected as user: ', user.value)

    user.watch((user) => {
      console.log('User: ', user)
    })

    unreadChannelsCount.watch((count) => {
      console.log('Unread channels count: ', count)
    })

    notifications.watch((notification) => {
      console.log('Received notification: ', notification)
    })

    loadChatUi({
      widgetId: 'UWiEkKvdAaUJ1xut',
      container: {
        height: '100%'
      },
      audio: {
        enabled: true
      },
      components: {
        chat: (context) => ({
          menuActions: [],
          onMounted: () => {
            console.log('Chat UI mounted with context: ', context)

            updateUser({
              properties: {
                lastUpdated: new Date().toISOString()
              }
            })
          },
          onHeaderSelected: (channel) => {
            console.log(channel)
          },
          onMenuActionSelected: (action) => {
            console.log(action)
          }
        })
      },
      templates: {
        error: ({message}) => template`
        <style>
          .error {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100%;
            padding: 0 20px;
          }

          .error h1 {
            font-size: 24px;
            font-weight: 500;
            margin: 0;
          }

          .error p {
            font-size: 16px;
            margin: 0;
          }
        </style>
        <div class="error">
          <h1>Example App • Oops!</h1>
          <p>${message}</p>
        </div>
      `
      },
    }, {
      timeout: 50000,
      connection
    })
  }
}
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Assuming you want to take the full viewport height */
}

.header {
  /* Your header styles */
  display: flex;
  justify-content: center;
  height: 125px;
}

@media (max-width: 600px) {
  .header {
    display: none; /* Hide header on mobile */
  }
}

.example-chat-ui-wrapper {
  flex: 1; /* This allows the wrapper to take up the remaining space */
  min-height: 0; /* Fixes flexbox sizing issue in some cases */
}

body {
  margin: 0;
}
</style>
