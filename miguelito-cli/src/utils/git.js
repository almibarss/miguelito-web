import fs from "fs";
import os from "os";
import path from "path";
import shell from "shelljs";

import { logExec } from "./exec.js";

export const git = {
  checkoutTag(tag) {
    if (!shell.which("git")) {
      return Promise.reject("git not found!");
    }
    const appPrefix = "miguelito";
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
    const gitCommand = `git worktree add ${tmpDir} ${tag}`;
    return logExec(gitCommand).then(() => tmpDir);
  },
  getHead() {
    if (!shell.which("git")) {
      return Promise.reject("git not found!");
    }
    const gitCommand = `git rev-parse --short HEAD`;
    return logExec(gitCommand).then((data) => data.trim());
  },
  isDirty() {
    if (!shell.which("git")) {
      return Promise.reject("git not found!");
    }
    const gitCommand = `git status --porcelain --untracked-files=no`;
    return logExec(gitCommand).then((output) => output.trim().length !== 0);
  },
  async revExists(rev) {
    if (!shell.which("git")) {
      return Promise.reject("git not found!");
    }
    const gitCommand = `git rev-list ${rev}`;
    try {
      await logExec(gitCommand);
      return true;
    } catch (e) {
      return false;
    }
  },
  setTag(name, value) {
    if (!shell.which("git")) {
      return Promise.reject("git not found!");
    }
    const gitCommand = `git tag --force ${name} ${value}`;
    return logExec(gitCommand);
  },
};
