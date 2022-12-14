import {onManageActiveEffect, prepareActiveEffectCategories} from "../helpers/effects.mjs";

/**
 * Extend the basic ActorSheet with some very simple modifications
 * @extends {ActorSheet}
 */
export class RitualTekActorSheet extends ActorSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ritualtek", "sheet", "actor"],
      template: "systems/ritualtek/templates/actor/actor-sheet.html",
      width: 500,
      height: 700,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "skills" }]
    });
  }

  /** @override */
  get template() {
    return `systems/ritualtek/templates/actor/actor-${this.actor.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  /** @override */
  getData() {
    // Retrieve the data structure from the base sheet. You can inspect or log
    // the context variable to see the structure, but some key properties for
    // sheets are the actor object, the data object, whether or not it's
    // editable, the items array, and the effects array.
    const context = super.getData();
    

    // Use a safe clone of the actor data for further operations.
    const actorData = this.actor.toObject(false);

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = actorData.system;
    context.flags = actorData.flags;

    // Prepare character data and items.
    if (actorData.type == 'character') {
      this._prepareItems(context);
      this._prepareCharacterData(context);
    }

    // Prepare NPC data and items.
    if (actorData.type == 'npc') {
      this._prepareItems(context);
    }

    // Add roll data for TinyMCE editors.
    context.rollData = context.actor.getRollData();

    // Prepare active effects
    context.effects = prepareActiveEffectCategories(this.actor.effects);

    return context;
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareCharacterData(context) {
    // Handle ability scores.
    for (let [k, v] of Object.entries(context.system.abilities)) {
      v.label = game.i18n.localize(CONFIG.RITUALTEK.abilities[k]) ?? k;
    }
    // Handle skills
    for (let [k, v] of Object.entries(context.system.skills)) {
      v.label = game.i18n.localize(CONFIG.RITUALTEK.skills[k]) ?? k;
    }
  }

  /**
   * Organize and classify Items for Character sheets.
   *
   * @param {Object} actorData The actor to prepare.
   *
   * @return {undefined}
   */
  _prepareItems(context) {
    // Initialize containers.
    const weapons = [];
    const clothing = [];
    const items = [];
    const spells = {
      0: [],
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
      8: [],
      9: []
    };

    // Iterate through items, allocating to containers
    for (let i of context.items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to weapons.
      if (i.type === 'weapon') {
        weapons.push(i);
      }
      // Append to clothing.
      if (i.type === 'clothing') {
        clothing.push(i);
      }
      // Append to items.
      if (i.type === 'item') {
        items.push(i);
      }
      // Append to spells.
      else if (i.type === 'spell') {
        if (i.system.spellLevel != undefined) {
          spells[i.system.spellLevel].push(i);
        }
      }
    }

    // Assign and return
    context.weapons = weapons;
    context.clothing = clothing;
    context.items = items;
    context.spells = spells;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Render the item sheet for viewing/editing prior to the editable check.
    html.find('.item-edit').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // -------------------------------------------------------------
    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Add Inventory Item
    html.find('.item-create').click(this._onItemCreate.bind(this));

    // Delete Inventory Item
    html.find('.item-delete').click(ev => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.delete();
      li.slideUp(200, () => this.render(false));
    });

    // Active Effect management
    html.find(".effect-control").click(ev => onManageActiveEffect(ev, this.actor));

    // Rollable abilities.
    html.find('.rollable').click(this._onRoll.bind(this));

    // Drag events for macros.
    if (this.actor.isOwner) {
      let handler = ev => this._onDragStart(ev);
      html.find('li.item').each((i, li) => {
        if (li.classList.contains("inventory-header")) return;
        li.setAttribute("draggable", true);
        li.addEventListener("dragstart", handler, false);
      });
    }

    // Calculate speed.
    let sp = this.actor.system.phy.value;
    this.actor.update({'system.speed.value': sp});

    // Calculate health and power.
    let he = 10 + (this.actor.system.phy.value * this.actor.system.lvl);
    this.actor.update({'system.health.max': he});
    let te = 10 + (this.actor.system.men.value * this.actor.system.lvl);
    this.actor.update({'system.tension.max': te});

    // Calculate armor and dodge.
    let a = this.actor.system.phy.value * this.actor.system.lvl;
    this.actor.update({'system.armor.value': a});
    let d = (this.actor.system.phy.value + this.actor.system.awa.value) * this.actor.system.lvl;
    this.actor.update({'system.dodge.value': d});

    // Calculate the character's chance of not being hit.
    let dth = this.actor.system.armor.value + this.actor.system.dodge.value;
    this.actor.update({'system.defense.value': dth});

    // Calculate the character's ability dice.
    function calculateAbilities(ability, abilityString) {
      if(ability.value === 1) {
        ability.sides = 4;
        document.getElementById(abilityString).src = "icons/dice/d4black.svg"
      }
      else if(ability.value === 2) {
        ability.sides = 6;
        document.getElementById(abilityString).src = "icons/dice/d6black.svg"
      }
      else if(ability.value === 3) {
        ability.sides = 8;
        document.getElementById(abilityString).src = "icons/dice/d8black.svg"
      }
      else if(ability.value === 4) {
        ability.sides = 10;
        document.getElementById(abilityString).src = "icons/dice/d10black.svg"
      }
      else{
        ability.sides = 12;
        document.getElementById(abilityString).src = "icons/dice/d12black.svg"
      }
    }

    calculateAbilities(this.actor.system.abilities.phy, "system.abilities.phy");
    calculateAbilities(this.actor.system.abilities.men, "system.abilities.men");
    calculateAbilities(this.actor.system.abilities.per, "system.abilities.per");
    calculateAbilities(this.actor.system.abilities.acu, "system.abilities.acu");
    calculateAbilities(this.actor.system.abilities.awa, "system.abilities.awa");
    calculateAbilities(this.actor.system.abilities.gui, "system.abilities.gui");

    console.log(this);
  }

  
  

  /**
   * Handle creating a new Owned Item for the actor using initial data defined in the HTML dataset
   * @param {Event} event   The originating click event
   * @private
   */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `New ${type.capitalize()}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      system: data
    };
    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    // Finally, create the item!
    return await Item.create(itemData, {parent: this.actor});
  }

  /**
   * Handle clickable rolls.
   * @param {Event} event   The originating click event
   * @private
   */
  _onRoll(event) {
    event.preventDefault();
    const element = event.currentTarget;
    const dataset = element.dataset;

    // Handle item rolls.
    if (dataset.rollType) {
      if (dataset.rollType == 'item') {
        const itemId = element.closest('.item').dataset.itemId;
        const item = this.actor.items.get(itemId);
        if (item) return item.roll();
      }
    }

    // Handle rolls that supply the formula directly.
    if (dataset.roll) {
      let label = dataset.label ? `[ability] ${dataset.label}` : '';
      let roll = new Roll(dataset.roll, this.actor.getRollData());
      roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: label,
        rollMode: game.settings.get('core', 'rollMode'),
      });
      return roll;
    }
  }

}
