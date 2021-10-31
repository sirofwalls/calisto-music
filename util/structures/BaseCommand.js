module.exports = class BaseCommand {
    constructor(name, category, cooldown, aliases, description) {
      this.name = name;
      this.category = category;
      this.cooldown = cooldown;
      this.aliases = aliases;
      this.description = description;
    }
  }