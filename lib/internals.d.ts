import {
  Ajv as AjvExternal,
  CompilationContext as CompilationContextExternal,
  CustomLogger,
  KeywordDefinition,
  Options,
  ValidateFunction,
} from './ajv';
import * as resolve from './compile/resolve';
import formats = require('./compile/formats');
import rules = require('./compile/rules');

type SerializeFn = Extract<Options['serialize'], (...args: any) => any>;
type SchemaArg = object; // | boolean;

export interface Ajv extends AjvExternal {
  _opts: Options & {
    _errorDataPathProperty?: boolean
  };
  logger: CustomLogger;
  _schemas: {[ref: string]: object};
  _refs: {
    ['http://json-schema.org/schema']?: string | object
    [ref: string]: string | object | undefined
  };
  _fragments: {[ref: string]: SchemaObject};
  _formats: Formats;
  _cache: Cache;
  _loadingSchemas: {};
  _compilations: {
    schema: object;
    root: SchemaObject;
    baseId: string;
    validate?: ValidateFunction;
    callValidate?: ValidateFunction;
  }[];
  RULES: ReturnType<typeof rules>;
  _getId: (schema: object) => string | undefined;
  _metaOpts: Omit<Options, 'removeAdditional' | 'useDefaults' | 'coerceTypes' | 'strictDefaults'>;
  _compile(schemaObj: SchemaObject, root?: ValidateFunction)
  compile(schema: SchemaArg, _meta?: boolean): ValidateFunction;
  validateSchema(schema: object | boolean, throwOrLogError?: boolean): boolean;
  _addSchema(schema: SchemaArg, skipValidation?: boolean, meta?: boolean, shouldAddSchema?: boolean): SchemaObjectSchema;
  addSchema(schema: Array<object> | object, key?: string, _skipValidation?: boolean, _meta?: boolean): Ajv;
  _validateKeyword?: ValidateFunction;
}

export interface Formats {
  [format: string]: RegExp | ((str: string, full?: boolean) => boolean);
}

export interface CustomRuleCode {
  code: string;
  validate: NonNullable<
    | KeywordDefinition['validate']
    | ReturnType<NonNullable<
        | KeywordDefinition['compile']
        | KeywordDefinition['macro']
        | KeywordDefinition['inline']
    >>
  >
}

export interface CompilationContext extends CompilationContextExternal, CompilationContextEntry {}

export interface CompilationContextEntry extends Partial<CompilationContextExternal> {
  isTop?: true;
  schema: any;
  isRoot: boolean;
  baseId: string;
  root: SchemaObject;
  schemaPath: string;
  errSchemaPath: string;
  errorPath: string;
  MissingRefError: typeof import('./ajv')['MissingRefError'];
  RULES: Rules;
  validate: (schema: object) => string;
  util: typeof import('./compile/util') ;
  resolve: typeof resolve;
  resolveRef: (baseId: string, ref: string, isRoot: boolean) => {
    code: string;
    schema?: object | boolean;
    $async?: boolean;
    inline?: boolean;
  };
  usePattern: (regexStr: string) => string;
  useDefault: (value: any) => string;
  useCustomRule: (
    rule: Rule,
    schema: object,
    parentSchema: object,
    it: CompilationContextExternal
  ) => undefined | CustomRuleCode;
  opts: Ajv['_opts'];
  formats: Formats;
  logger: CustomLogger;
  self: Ajv;

  createErrors?: boolean;
  rootId?: string;
}

export interface Hash {
  [key: string]: true | undefined;
}
export interface RuleGroup {
  type?: string; // 'number' | 'string' | 'array' | 'object'
  rules: Rule[];
}
export interface RuleBase {
  keyword: string;
  code: (it: CompilationContext, $keyword: Rule['keyword'], $ruleType?: RuleGroup['type']) => string;
  /** Additional keywords that this rule handles */
  implements?: string[];
}
export type Rule = BuiltinRule | CustomRule;
export interface BuiltinRule extends RuleBase {
  keyword: keyof typeof import('./dotjs');
  custom?: never;
}
export interface CustomRule extends RuleBase {
  custom: boolean; // true
  definition: KeywordDefinition;
}
export interface RulesProps {
  all: {
    // note: these props are always defined, but rules.js complains if it's not ?
    type?: true
    $comment?: BuiltinRule
    $ref?: BuiltinRule
    [key: string]: true | Rule | undefined;
  };
  types: { [key: string]: RuleGroup | true };
  keywords: Hash;
  custom: { [key: string]: CustomRule | undefined };
}
export interface Rules extends Array<RuleGroup>, RulesProps {}

export type SchemaObjectCtor = new (obj: SchemaObject) => SchemaObject;
export interface SchemaObject {
  id: ReturnType<typeof resolve.normalizeId>;
  schema: SchemaArg;
  localRefs: ReturnType<typeof resolve.ids>;
  cacheKey: ReturnType<SerializeFn> | SchemaArg;
  meta?: boolean;
  ref?: any;
  fragment?: any;
  validate?: ValidateFunction;
  compiling?: boolean;
}
