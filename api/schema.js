const z = require("zod");

const A_Star = z.object({}).strict();

const String = z.object({ str: z.string() }).strict();

const Integer = z
  .object({
    ival: z.number(),
  })
  .strict();

const Float = z
  .object({
    str: z.string(),
  })
  .strict();

const A_Const = z
  .object({
    val: z.union([
      z.object({ Integer }).strict(),
      z.object({ Float }).strict(),
      z.object({ String }).strict(),
    ]),

    location: z.number(),
  })
  .strict();

const ColumnRef = z
  .object({
    fields: z
      .array(z.union([z.object({ A_Star }), z.object({ String }).strict()]))
      .min(1),
    location: z.number(),
  })
  .strict();

const ResTarget = z
  .object({
    location: z.number(),
    name: z.string().optional(),
    val: z.union([
      z.object({ ColumnRef }).strict(),
      z.object({ A_Const }).strict(),
    ]),
  })
  .strict();

const RangeVar = z
  .object({
    relname: z.string(),
    inh: z.boolean(),
    relpersistence: z.enum(["p"]),
    location: z.number(),
  })
  .strict();

const fromClause = z
  .array(z.object({ RangeVar }).strict())
  .length(1)
  .optional();

const List = z
  .object({
    items: z.array(z.object({ A_Const })),
  })
  .strict();

const A_Expr = z
  .object({
    kind: z.enum(["AEXPR_OP", "AEXPR_BETWEEN", "AEXPR_IN"]),
    name: z
      .array(
        z
          .object({
            String: z.object({ str: z.enum(["=", "BETWEEN"]) }).strict(),
          })
          .strict()
      )
      .length(1),
    lexpr: z.object({ ColumnRef }).strict(),
    rexpr: z.union([
      z.object({ A_Const }).strict(),
      z.object({ List }).strict(),
    ]),
    location: z.number(),
  })
  .strict();

const BoolExpr = z
  .object({
    boolop: z.enum(["AND_EXPR", "OR_EXPR"]),
    args: z
      .array(
        z.union([
          z.object({ A_Expr }).strict(),
          z.lazy(() => z.object({ BoolExpr }).strict()),
        ])
      )
      .min(1),
    location: z.number(),
  })
  .strict();

const whereClause = z
  .union([z.object({ A_Expr }).strict(), z.object({ BoolExpr }).strict()])
  .optional();

const targetList = z.array(z.object({ ResTarget }).strict());

const SortBy = z
  .object({
    node: z.object({ ColumnRef }).strict(),
    sortby_dir: z.enum(["SORTBY_DEFAULT", "SORTBY_DESC", "SORTBY_ASC"]),
    sortby_nulls: z.enum(["SORTBY_NULLS_DEFAULT"]),
    location: z.number(),
  })
  .strict();

const sortClause = z.array(z.object({ SortBy }).strict()).optional();

const SelectStmt = z
  .object({
    targetList,
    fromClause,
    whereClause,
    sortClause,
    limitCount: z.object({ A_Const }).strict().optional(),
    limitOffset: z.object({ A_Const }).strict().optional(),
    limitOption: z.enum(["LIMIT_OPTION_DEFAULT", "LIMIT_OPTION_COUNT"]),
    op: z.enum(["SETOP_NONE"]),
  })
  .strict();

const RawStmt = z
  .object({
    stmt: z.object({ SelectStmt }).strict(),
    stmt_location: z.number(),
    stmt_len: z.any(),
  })
  .strict();

const schema = z.array(z.object({ RawStmt }).strict()).length(1);

module.exports = schema;
