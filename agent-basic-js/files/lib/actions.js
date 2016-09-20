module.exports = {
  events: {
    didFossilize: function(segment) {
      console.log('Link ' + segment.meta.linkHash + ' was fossilized!');
      console.log('Here is the evidence: ')
      console.log(JSON.stringify(segment.meta.evidence, null, 2));
    },

    didAppend: function(segment) {
      console.log('Link ' + segment.meta.linkHash + ' was appended!');
    }
  },

  init: function(title) {
    if (!title) {
      return this.reject('a title is required');
    }

    this.state.title = title;
    this.state.messages = [];
    this.state.updatedAt = Date.now();
    this.meta.priority = 0;

    this.append();
  },

  addMessage: function(message, author) {
    if (!message) {
      return this.reject('a message is required');
    }

    if (!author) {
      return this.reject('an author is required');
    }

    this.state.messages.push({ message: message, author: author });
    this.state.updatedAt = Date.now();
    this.meta.priority++;

    this.append();
  },

  addTag: function(tag) {
    if (!tag) {
      return this.reject('a tag is required');
    }

    this.meta.tags = this.meta.tags || [];
    this.meta.tags.push(tag);
    this.state.updatedAt = Date.now();
    this.meta.priority++;

    this.append();
  }
};
