export function validate(schema, source = "body") {
  return (req, res, next) => {
    const data = source === "body" ? req.body : source === "query" ? req.query : req.params;
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((e) => ({
          field: e.path.join(".") || "root",
          message: e.message,
        })),
      });
    }
    if (source === "body") req.body = parsed.data;
    else if (source === "query") req.validatedQuery = parsed.data;
    else req.validatedParams = parsed.data;
    next();
  };
}
