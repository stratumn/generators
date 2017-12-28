export default {
  events: {
    didSave(segment) {
      console.log(`Segment ${segment.meta.linkHash} was saved!`);
    }
  },

  name: '{{- .fileSubstitutionInput -}}',

  init(title) {
    if (!title) {
      return this.reject('a title is required');
    }

    this.state = {
      title: title
    };

    return this.append();
  },

  message(body, author) {
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

    return this.append();
  }
};
