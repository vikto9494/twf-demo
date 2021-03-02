export const urlSignToPlainSign = (urlSign) => {
  if (urlSign === "ge") {
    return ">=";
  } else if (urlSign === "le") {
    return "<=";
  } else if (urlSign === "gt") {
    return ">";
  } else if (urlSign === "lt") {
    return "<";
  } else return "=";
};
export const plainSignToUrlSign = (plainSign) => {
  switch (plainSign) {
    case ">=":
      return "ge";
    case "<=":
      return "le";
    case ">":
      return "gt";
    case "<":
      return "lt";
    default:
      return "=";
  }
};
