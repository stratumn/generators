module.exports = {
  events: {
    didSave: function(segment) {
      console.log('Segment ' + segment.meta.linkHash + ' was saved!');
    }
  },

  name: '{{- .fileSubstitutionInput -}}',

  init: function(title) {
    if (!title) {
      return this.reject('a title is required');
    }

    this.state = {
      title: title
    };

    this.append();
  },

  message: function(body, author) {
    if (!body) {
      return this.reject('a body is required');
    }

    if (!author) {
      return this.reject('an author is required');
    }

    this.state = {
      body: body,
      author: author
    };

    this.append();
  }
};
