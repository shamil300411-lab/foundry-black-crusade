// ============================================
// Класс предметов Black Crusade
// ============================================

class BlackCrusadeItem extends Item {
  // Получение урона оружия
  getDamageRoll() {
    if (this.type !== 'weapon') return null;
    
    const damageFormula = this.system.damage;
    return new Roll(damageFormula);
  }
  
  // Применение эффекта предмета
  async applyEffect(actor) {
    switch(this.type) {
      case 'armor':
        return this.applyArmorBonus(actor);
      case 'talent':
        return this.applyTalentBonus(actor);
      case 'psychicpower':
        return this.castPsychicPower(actor);
      default:
        return null;
    }
  }
  
  // Применение бонуса брони
  async applyArmorBonus(actor) {
    const armorPoints = this.system.armorPoints;
    return {
      armorType: this.system.armorType,
      protection: armorPoints,
      message: `${actor.name} надел ${this.name}`
    };
  }
  
  // Применение бонуса таланта
  async applyTalentBonus(actor) {
    // Логика для применения эффектов таланта
    return {
      talentName: this.name,
      effect: this.system.effect,
      message: `${actor.name} получает эффект от ${this.name}`
    };
  }
  
  // Использование псионической способности
  async castPsychicPower(actor) {
    // Проверка на достаточно Willpower для использования способности
    const willpower = actor.system.attributes.willpower.value;
    const powerLevel = this.system.powerLevel;
    
    if (willpower < (powerLevel * 10)) {
      return {
        success: false,
        message: `${actor.name} не имеет достаточно Willpower для использования ${this.name}`
      };
    }
    
    return {
      success: true,
      powerName: this.name,
      range: this.system.range,
      duration: this.system.duration,
      effect: this.system.effect,
      message: `${actor.name} использует способность ${this.name}`
    };
  }
}
