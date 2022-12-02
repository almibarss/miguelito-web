export function failSpinner(spinner, e) {
  if (typeof e === "string" && e) {
    spinner.fail(`${spinner.text} -- ${e}`);
  } else {
    spinner.fail();
  }
}
