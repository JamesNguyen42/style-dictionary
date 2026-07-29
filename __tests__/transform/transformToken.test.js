import { expect } from 'chai';
import transformToken from '../../lib/transform/token.js';
import { transformTypes } from '../../lib/enums/index.js';
import { StopTransformError } from 'style-dictionary/utils';
import GroupMessages from '../../lib/utils/groupMessages.js';

const { value: transformTypeValue, name, attribute } = transformTypes;
const TRANSFORM_ERRORS = GroupMessages.GROUP.TransformErrors;

const config = {
  transforms: [
    {
      type: attribute,
      transform: function () {
        return {
          foo: 'bar',
        };
      },
    },
    {
      type: attribute,
      transform: function () {
        return { bar: 'foo' };
      },
    },
    {
      type: name,
      filter: function (prop) {
        return prop.attributes.foo === 'bar';
      },
      transform: function () {
        return 'hello';
      },
    },
  ],
};

describe('transform', () => {
  describe('token', () => {
    afterEach(() => {
      GroupMessages.clear(TRANSFORM_ERRORS);
    });

    it('transform token and apply transforms', async () => {
      const test = await transformToken({ attributes: { baz: 'blah' } }, config, {});
      expect(test).to.have.nested.property('attributes.bar', 'foo');
      expect(test).to.have.property('name', 'hello');
    });

    it('can throw anything and handle gracefully', async () => {
      const test = await transformToken(
        { name: 'foo-bar', value: 'abc', path: ['foo', 'bar'], original: { value: 'abc' } },
        {
          transforms: [
            {
              type: transformTypeValue,
              transform: function () {
                return 'def';
              },
            },
            {
              type: transformTypeValue,
              transform: function () {
                throw 123;
              },
            },
            {
              type: transformTypeValue,
              transform: function () {
                return 'ghi';
              },
            },
          ],
        },
        {},
      );
      expect(test).to.have.property('value', 'ghi');
    });

    it('stops remaining transforms when a StopTransformError is thrown', async () => {
      for (const transformType of [attribute, name, transformTypeValue]) {
        let laterTransformRan = false;
        const test = await transformToken(
          {
            name: 'foo-bar',
            value: 'abc',
            path: ['foo', 'bar'],
            original: { value: 'abc' },
          },
          {
            transforms: [
              {
                name: 'earlier',
                type: transformTypeValue,
                transform: function () {
                  return 'def';
                },
              },
              {
                name: 'validation',
                type: transformType,
                transform: function () {
                  throw new StopTransformError('invalid token');
                },
              },
              {
                name: 'later',
                type: transformTypeValue,
                transform: function () {
                  laterTransformRan = true;
                  return 'ghi';
                },
              },
            ],
          },
          {},
        );

        expect(laterTransformRan, `${transformType} transform should stop the chain`).to.equal(
          false,
        );
        expect(test).to.have.property('value', 'def');
      }
    });

    // This allows transformObject utility to then consider this token's transformation undefined and thus "deferred"
    it('returns a token as undefined if transitive transform dictates that the transformation has to be deferred', async () => {
      const result = await transformToken(
        {
          value: '16',
          original: {
            value: '16',
          },
        },
        {
          transforms: [
            {
              type: transformTypeValue,
              transitive: true,
              transform: () => {
                return undefined;
              },
            },
          ],
        },
        {},
      );

      expect(result).to.be.undefined;
    });

    // Add more tests
  });
});
