// ============================================
// Инициализация системы Black Crusade
// ============================================

Hooks.once('init', async function() {
  console.log('Initializing Black Crusade System');
  
  // Регистрация системных параметров
  game.blackcrusade = {
    version: '1.0.0',
    attributes: [
      'weaponSkill',
      'ballisticSkill', 
      'strength',
      'toughness',
      'agility',
      'intelligence',
      'perception',
      'willpower'
    ],
    damageTypes: {
      normal: 'Normal',
      energy: 'Energy',
      psychic: 'Psychic',
      explosive: 'Explosive'
    }
  };
  
  // Импортируем классы акторов и предметов
  CONFIG.Actor.documentClass = BlackCrusadeActor;
  CONFIG.Item.documentClass = BlackCrusadeItem;
  
  // Регистрируем листы персонажей
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("blackcrusade", BlackCrusadeCharacterSheet, { makeDefault: true });
  
  // Регистрируем листы предметов
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("blackcrusade", BlackCrusadeItemSheet, { makeDefault: true });
});

Hooks.once('ready', async function() {
  console.log('Black Crusade System Ready');
});

// ============================================
// Система глобальных макросов и помощников
// ============================================

window.BlackCrusade = {
  rollTest: async (attribute, bonus = 0) => {
    const roll = new Roll('1d100').roll({async: false});
    const targetNumber = attribute + bonus;
    const isSuccess = roll.total <= targetNumber;
    const degreeOfSuccess = Math.floor((targetNumber - roll.total) / 10);
    
    return {
      roll: roll.total,
      targetNumber: targetNumber,
      success: isSuccess,
      degreeOfSuccess: degreeOfSuccess
    };
  }
};

// ============================================
// Лист персонажа
// ============================================

class BlackCrusadeCharacterSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["blackcrusade", "sheet", "actor"],
      template: "systems/blackcrusade/templates/actor/character.html",
      width: 800,
      height: 900,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  getData() {
    const data = super.getData();
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Тест атрибута
    html.find('.attribute-test').click(async (ev) => {
      const attrName = ev.currentTarget.dataset.attribute;
      await this.actor.rollAttributeTest(attrName);
    });

    // Использование оружия
    html.find('.weapon-attack').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      await BlackCrusadeRoll.meleeAttack(this.actor, item);
    });

    // Использование способности
    html.find('.use-psychic-power').click(async (ev) => {
      const itemId = ev.currentTarget.dataset.itemId;
      const item = this.actor.items.get(itemId);
      await item.castPsychicPower(this.actor);
    });
  }
}

// ============================================
// Лист предмета
// ============================================

class BlackCrusadeItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["blackcrusade", "sheet", "item"],
      template: "systems/blackcrusade/templates/item/base.html",
      width: 500,
      height: 600
    });
  }

  getData() {
    const data = super.getData();
    return data;
  }
}
