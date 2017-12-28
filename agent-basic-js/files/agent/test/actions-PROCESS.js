import Agent from '@indigoframework/agent';
import actions from '../lib/actions/actions-{{- .fileSubstitutionInput -}}';

describe('{{- .fileSubstitutionInput -}}-transitions', () => {
  // Transform our actions into a process before every test
  let map;
  beforeEach(() => {
    map = Agent.processify(actions);
  });

  describe('#init()', () => {
    it('sets the state correctly', () => {
      return map.init('Hello, World!').then(link => {
        link.state.title.should.be.exactly('Hello, World!');
      });
    });

    it('requires a title', () => {
      return map
        .init()
        .then(link => {
          throw new Error('link should not have been created');
        })
        .catch(err => {
          err.message.should.be.exactly('a title is required');
        });
    });
  });

  describe('#message()', () => {
    it('updates the state correctly', () => {
      return map
        .init('Hello, World!')
        .then(link => {
          return map.message('Hi', 'Me');
        })
        .then(link => {
          link.state.should.deepEqual({ body: 'Hi', author: 'Me' });
        });
    });

    it('requires a body', () => {
      return map
        .init('Hello, World!')
        .then(link => {
          return map.message();
        })
        .then(link => {
          throw new Error('link should not have been created');
        })
        .catch(err => {
          err.message.should.be.exactly('a body is required');
        });
    });

    it('requires an author', () => {
      return map
        .init('Hello, World!')
        .then(link => {
          return map.message('Hi');
        })
        .then(link => {
          throw new Error('link should not have been created');
        })
        .catch(err => {
          err.message.should.be.exactly('an author is required');
        });
    });
  });
});
