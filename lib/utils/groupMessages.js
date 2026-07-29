export const verbosityInfo = `Use log.verbosity "verbose" or use CLI option --verbose for more details.\nRefer to: https://styledictionary.com/reference/logging/`;

export class GroupMessages {
  constructor() {
    /** @type {{[key: string]: string[]}} */
    this.groupedMessages = {};
    /** @type {WeakMap<object, {[key: string]: string[]}>} */
    this.scopedGroupedMessages = new WeakMap();
    this.GROUP = {
      PropertyReferenceWarnings: 'Property Reference Errors',
      PropertyValueCollisions: 'Property Value Collisions',
      TemplateDeprecationWarnings: 'Template Deprecation Warnings',
      RegisterTemplateDeprecationWarnings: 'Register Template Deprecation Warnings',
      SassMapFormatDeprecationWarnings: 'Sass Map Format Deprecation Warnings',
      MissingRegisterTransformErrors: 'Missing Register Transform Errors',
      PropertyNameCollisionWarnings: 'Property Name Collision Warnings',
      FilteredOutputReferences: 'Filtered Output Reference Warnings',
      UnknownCSSFontProperties: 'Unknown CSS Font Shorthand Properties',
      TransformErrors: 'Transform Errors',
    };
  }

  /**
   * @param {object} [scope]
   * @returns {{[key: string]: string[]}}
   */
  getMessageStore(scope) {
    if (!scope) {
      return this.groupedMessages;
    }

    let groupedMessages = this.scopedGroupedMessages.get(scope);
    if (!groupedMessages) {
      groupedMessages = {};
      this.scopedGroupedMessages.set(scope, groupedMessages);
    }
    return groupedMessages;
  }

  /**
   *
   * @param {string} messageGroup
   * @param {object} [scope]
   * @returns {string[]}
   */
  flush(messageGroup, scope) {
    const messages = this.fetchMessages(messageGroup, scope);
    this.clear(messageGroup, scope);
    return messages;
  }

  /**
   * @param {string} messageGroup
   * @param {string} message
   * @param {object} [scope]
   */
  add(messageGroup, message, scope) {
    if (messageGroup) {
      const groupedMessages = this.getMessageStore(scope);
      if (!groupedMessages[messageGroup]) {
        groupedMessages[messageGroup] = [];
      }
      if (groupedMessages[messageGroup].indexOf(message) === -1) {
        groupedMessages[messageGroup].push(message);
      }
    }
  }

  /**
   * @param {string} messageGroup
   * @param {string} message
   * @param {object} [scope]
   */
  remove(messageGroup, message, scope) {
    const groupedMessages = this.getMessageStore(scope);
    if (messageGroup && groupedMessages[messageGroup]?.length > 0) {
      const index = groupedMessages[messageGroup].indexOf(message);
      if (index !== -1) {
        groupedMessages[messageGroup].splice(index, 1);
      }
    }
  }

  /**
   *
   * @param {string} messageGroup
   * @param {object} [scope]
   * @returns {number}
   */
  count(messageGroup, scope) {
    const groupedMessages = this.getMessageStore(scope);
    return groupedMessages[messageGroup] ? groupedMessages[messageGroup].length : 0;
  }

  /**
   *
   * @param {string} messageGroup
   * @param {object} [scope]
   * @returns {string[]}
   */
  fetchMessages(messageGroup, scope) {
    const groupedMessages = this.getMessageStore(scope);
    return (messageGroup && groupedMessages[messageGroup]) || [];
  }

  /**
   * @param {string} messageGroup
   * @param {object} [scope]
   */
  clear(messageGroup, scope) {
    const groupedMessages = this.getMessageStore(scope);
    messageGroup && groupedMessages[messageGroup] && delete groupedMessages[messageGroup];
  }
}

export default new GroupMessages();
