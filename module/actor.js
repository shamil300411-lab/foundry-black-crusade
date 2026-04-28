// ============================================
// Класс персонажа Black Crusade
// ============================================

class BlackCrusadeActor extends Actor {
  // Инициализация актёра при создании
  prepareData() {
    super.prepareData();
    
    // Подготовка производных характеристик на основе атрибутов
    this.prepareCharacteristics();
  }
  
  // Расчёт производных характеристик
  prepareCharacteristics() {
    const data = this.system;
    
    // Расчёт максимум ран на основе Toughness
    data.derivedCharacteristics.wounds.max = 
      10 + Math.floor((data.attributes.toughness.value - 30) / 10);
    
    // Расчёт инициативы
    data.initiative = data.attributes.agility.value;
  }
  
  // Бросок теста атрибута
  async rollAttributeTest(attributeName, modifier = 0) {
    const attribute = this.system.attributes[attributeName];
    if (!attribute) {
      ui.notifications.error(`Атрибут ${attributeName} не найден`);
      return;
    }
    
    const targetNumber = attribute.value + modifier;
    const roll = new Roll('1d100').roll({async: false});
    const success = roll.total <= targetNumber;
    const degreeOfSuccess = Math.floor((targetNumber - roll.total) / 10);
    
    // Отправка результата в чат
    await this.sendTestToChat(
      attributeName,
      roll.total,
      targetNumber,
      success,
      degreeOfSuccess
    );
    
    return {
      roll: roll.total,
      targetNumber,
      success,
      degreeOfSuccess
    };
  }
  
  // Отправка результата теста в чат
  async sendTestToChat(attrName, result, targetNumber, success, degreeOfSuccess) {
    const color = success ? '#00ff00' : '#ff0000';
    const statusText = success ? 'УСПЕХ' : 'ПРОВАЛ';
    
    const content = `
      <div style="border: 2px solid ${color}; padding: 10px; background: #2a2a2a; color: #fff; border-radius: 5px;">
        <h3 style="color: ${color};">${this.name} - Тест ${attrName}</h3>
        <p><strong>Результат:</strong> ${result}/100</p>
        <p><strong>Цель:</strong> ${targetNumber}</p>
        <p><strong>Статус:</strong> <span style="color: ${color}; font-weight: bold;">${statusText}</span></p>
        <p><strong>Степень успеха:</strong> ${degreeOfSuccess}</p>
      </div>
    `;
    
    await ChatMessage.create({
      content: content,
      speaker: ChatMessage.getSpeaker({actor: this})
    });
  }
  
  // Получение модификатора урона от Strength
  getStrengthBonus() {
    const strength = this.system.attributes.strength.value;
    return Math.floor((strength - 30) / 10);
  }
  
  // Взятие урона
  async takeDamage(damage) {
    const wounds = this.system.derivedCharacteristics.wounds;
    wounds.value = Math.max(0, wounds.value - damage);
    
    // Обновление данных актёра
    await this.update({
      'system.derivedCharacteristics.wounds.value': wounds.value
    });
    
    // Проверка на смерть
    if (wounds.value <= 0) {
      ui.notifications.warn(`${this.name} мертв!`);
    }
  }
  
  // Добавление развращения
  async addCorruption(amount) {
    const corruption = this.system.derivedCharacteristics.corruption;
    const newValue = Math.min(corruption.value + amount, corruption.max);
    
    await this.update({
      'system.derivedCharacteristics.corruption.value': newValue
    });
    
    if (newValue >= corruption.max) {
      ui.notifications.error(`${this.name} достиг максимума развращения!`);
    }
  }
  
  // Добавление сумасшествия
  async addInsanity(amount) {
    const insanity = this.system.derivedCharacteristics.insanity;
    const newValue = Math.min(insanity.value + amount, insanity.max);
    
    await this.update({
      'system.derivedCharacteristics.insanity.value': newValue
    });
    
    if (newValue >= insanity.max) {
      ui.notifications.error(`${this.name} потерял рассудок!`);
    }
  }
}
