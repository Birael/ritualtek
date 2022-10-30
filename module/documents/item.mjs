/**
 * Extend the basic Item with some very simple modifications.
 * @extends {Item}
 */
export class RitualTekItem extends Item {
  /**
   * Augment the basic Item data model with additional dynamic data.
   */
  prepareData() {
    // As with the actor class, items are documents that can have their data
    // preparation methods overridden (such as prepareBaseData()).
    super.prepareData();
  }

  /**
   * Prepare a data object which is passed to any Roll formulas which are created related to this Item
   * @private
   */
   getRollData() {
    // If present, return the actor's roll data.
    if ( !this.actor ) return null;
    const rollData = this.actor.getRollData();
    // Grab the item's system data as well.
    rollData.item = foundry.utils.deepClone(this.system);

    return rollData;
  }

  

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  async roll() {
    const item = this;

    // Initialize chat data.
    const speaker = ChatMessage.getSpeaker({ actor: this.actor });
    const rollMode = game.settings.get('core', 'rollMode');
    const label = `[${item.type}] ${item.name}`;

    
    

    // If there's no roll data, send a chat message.
    if (!this.type === "weapon") {
      ChatMessage.create({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
        content: item.system.description ?? ''
      });
      console.log(item);
    }
    // Otherwise, create a roll and send a chat message from it.
    else {
      const abilityDie = "";
      let dieCount = 0;

      // Retrieve roll data.
      const rollData = this.getRollData();

      // Calculate formula

      //console.log(this.item);

      if(item.system.skillUsed == "melee")
      {
        rollData.item.formula = this.actor.system.melee.rank + "d" + this.actor.system.phy.sides + "+" + this.system.damage;
      }
      
      if(item.system.skillUsed == "shooting")
      {
        rollData.item.formula = this.actor.system.shooting.rank + "d" + this.actor.system.acu.sides + "+" + this.system.damage;
      }
      
      if(item.system.skillUsed == "gunnery")
      {
        rollData.item.formula = this.actor.system.gunnery.rank + "d" + this.actor.system.acu.sides + "+" + this.system.damage;
      }

      console.log(item);

      // Invoke the roll and submit it to chat.
      const roll = new Roll(rollData.item.formula, rollData);
      // If you need to store the value first, uncomment the next line.
      // let result = await roll.roll({async: true});
      
      roll.toMessage({
        speaker: speaker,
        rollMode: rollMode,
        flavor: label,
      });
      return roll;
    }
  }
}
