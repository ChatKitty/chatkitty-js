import test from 'ava';

import { environment } from '../environments/environment';
import ChatKitty from '../lib/chatkitty';
import {
  sessionStarted
} from '../lib/model/session/start/session.start.results';

interface ChatKittyHolder {
  getKitty(): ChatKitty;
}

test.before((t) => {
  const kitty = new ChatKitty({
    isSecure: environment.test.isSecure,
    host: environment.test.host,
    apiKey: environment.test.apiKey
  });

  t.context = {
    getKitty: () => kitty
  };
});

test('start session with session started', (t) => {
  const kitty: ChatKitty = (t.context as ChatKittyHolder).getKitty();

  kitty.startSession({
    username: 'tester@chatkitty.com',
    authParams: {
      password: '12345678'
    },
    callback: (result) => {
      if (sessionStarted(result)) {
        t.pass('Session was started');

        t.log(result.session);
      } else {
        t.fail('Session was not started');
      }
    }
  });
});
