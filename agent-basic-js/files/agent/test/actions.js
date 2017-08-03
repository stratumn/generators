var mockAgent = require('stratumn-mock-agent').mockAgent;
var transitions = require('../lib/actions');

describe('transitions', function() {

  var map;

  beforeEach(function() {
    map = mockAgent(transitions);
  });

  describe('#init()', function() {

    it('sets the state correctly', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          link.state.title.should.be.exactly('Hello, World!');
        });
    });

    it('requires a title', function() {
      return map
        .init()
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('a title is required');
        });
    });

  });

  describe('#message()', function() {

    it('updates the state correctly', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          return map.message('Hi', 'Me');
        })
        .then(function(link) {
          link.state.should.deepEqual({ body: 'Hi', author: 'Me' });
        });
    });

    it('requires a body', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          return map.message();
        })
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('a body is required');
        });
    });

    it('requires an author', function() {
      return map
        .init('Hello, World!')
        .then(function(link) {
          return map.message('Hi');
        })
        .then(function(link) {
          throw new Error('link should not have been created');
        })
        .catch(function(err) {
          err.message.should.be.exactly('an author is required');
        });
    });

  });

});
