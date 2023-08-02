"use strict";
const Generator = require("yeoman-generator");
const path = require("path");
const mkdirp = require("mkdirp");
// 5.0.0版本需要动态引入install
const _ = require("lodash");
_.extend(Generator.prototype, require("yeoman-generator/lib/actions/install"));

module.exports = class extends Generator {
  // 向用户展示交互式问题收集关键参数
  prompting() {
    const prompts = [
      {
        type: "input",
        name: "namespace",
        message: "Please input your project namespace,such as @xxx:",
        default: ""
      },
      {
        type: "input",
        name: "name",
        message: "Please input project name:",
        default: "your-npm-package"
      },
      {
        type: "input",
        name: "author",
        message: "Author's Name",
        default: ""
      }
    ];

    return this.prompt(prompts).then(props => {
      this.props = props;
      if (this.props.namespace) {
        this.props.fullName = this.props.namespace + "/" + this.props.name;
      } else {
        this.props.fullName = this.props.name;
      }
    });
  }

  // 未匹配任何生命周期方法的非私有方法均在此环节*自动*执行
  default() {
    if (path.basename(this.destinationPath()) !== this.props.name) {
      this.log(`\nYour generator must be inside a folder named
        ${this.props.name}\n
        I will automatically create this folder.\n`);

      mkdirp(this.props.name);
      this.destinationRoot(this.destinationPath(this.props.name));
    }
  }

  // 依据模板进行新项目结构的写操作
  writing() {
    this.log("\nWriting...\n");

    this.__writingCopy(["package.json"], {
      name: this.props.name,
      fullName: this.props.fullName,
      author: this.props.author
    });
    this.__writingCopy(["LICENSE"], {
      author: this.props.author,
      year: new Date().getFullYear()
    });
    this.__writingCopy([
      "__test__",
      ".husky",
      ".vscode",
      "scripts",
      ".eslintignore",
      ".prettierignore",
      ".prettierrc.json",
      "commitlint.config.cjs",
      "jestconfig.json",
      "pnpm-lock.yaml",
      "README",
      "src",
      ".gitignore",
      ".eslintrc.js",
      "tsconfig.json"
    ]);
  }

  __writingCopy(filePath, params) {
    // This.log(this, "haha");
    filePath.forEach(item => {
      this.fs.copyTpl(
        this.templatePath(item),
        this.destinationPath(item),
        params
      );
    });
  }

  // 安装依赖阶段
  install() {
    this.log(`
    Done. Now run:
      cd ${this.props.name}
      pnpm install
      pnpm start
    `);
    // 5.0.0以上版本废弃，默认关闭
    // this.npmInstall();
  }
};
