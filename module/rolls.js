// ============================================
// Система бросков d100 для Black Crusade
// ============================================

class BlackCrusadeRoll {
  // Основной тест атрибута
  static async performTest(attributeValue, modifier = 0) {
    const targetNumber = attributeValue + modifier;
    const roll = new Roll('1d100').roll({async: false});
    const result = roll.total;
    
    // Проверка результата
    const success = result <= targetNumber;
    const criticalSuccess = result === 1;
    const criticalFailure = result === 100;
    const degreeOfSuccess = Math.floor((targetNumber - result) / 10);
    
    return {
      result: result,
      targetNumber: targetNumber,
      success: success,
      criticalSuccess: criticalSuccess,
      criticalFailure: criticalFailure,
      degreeOfSuccess: Math.max(-1, degreeOfSuccess)
    };
  }
  
  // Бросок атаки в ближнем бою
  static async meleeAttack(actor, weapon, targetAC = 0) {
    const weaponSkill = actor.system.attributes.weaponSkill.value;
    const modifier = targetAC;
    
    const test = await this.performTest(weaponSkill, modifier);
    
    if (test.success) {
      // Расчёт урона
      const damageRoll = weapon.getDamageRoll();
      const strengthBonus = actor.getStrengthBonus();
      const totalDamage = damageRoll.total + strengthBonus;
      
      test.damage = totalDamage;
      test.damageRoll = damageRoll.formula;
    }
    
    return test;
  }
  
  // Бросок атаки на расстояние
  static async rangedAttack(actor, weapon, targetAC = 0) {
    const ballisticSkill = actor.system.attributes.ballisticSkill.value;
    const modifier = targetAC;
    
    const test = await this.performTest(ballisticSkill, modifier);
    
    if (test.success) {
      // Расчёт урона для дальнобойного оружия
      const damageRoll = weapon.getDamageRoll();
      const totalDamage = damageRoll.total;
      
      test.damage = totalDamage;
      test.damageRoll = damageRoll.formula;
    }
    
    return test;
  }
  
  // Тест на сопротивление развращению
  static async corruptionTest(actor, corruptionAmount) {
    const willpower = actor.system.attributes.willpower.value;
    const test = await this.performTest(willpower);
    
    if (!test.success) {
      // Неудача - добавить развращение
      await actor.addCorruption(corruptionAmount);
      test.corrupted = true;
    } else {
      test.corrupted = false;
    }
    
    return test;
  }
  
  // Тест на сопротивление сумасшествию
  static async insanityTest(actor, insanityAmount) {
    const willpower = actor.system.attributes.willpower.value;
    const test = await this.performTest(willpower);
    
    if (!test.success) {
      // Неудача - добавить сумасшествие
      await actor.addInsanity(insanityAmount);
      test.insane = true;
    } else {
      test.insane = false;
    }
    
    return test;
  }
}
