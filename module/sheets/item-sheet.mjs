/**
 * Extend the basic ItemSheet with some very simple modifications
 * @extends {ItemSheet}
 */
export class RitualTekItemSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ritualtek", "sheet", "item"],
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "attributes" }]
    });
  }

  /** @override */
  get template() {
    const path = "systems/ritualtek/templates/item";
    // Return a single sheet for all item types.
    // return `${path}/item-sheet.html`;

    // Alternatively, you could use the following return statement to do a
    // unique item sheet by type, like `weapon-sheet.html`.
    return `${path}/item-${this.item.type}-sheet.html`;
  }

  /* -------------------------------------------- */

  

  /** @override */
  getData() {
    // Retrieve base data structure.
    const context = super.getData();

    // Use a safe clone of the item data for further operations.
    const itemData = context.item;

    // Retrieve the roll data for TinyMCE editors.
    context.rollData = {};
    let actor = this.object?.parent ?? null;
    if (actor) {
      context.rollData = actor.getRollData();
    }

    // Add the actor's data to context.data for easier access, as well as flags.
    context.system = itemData.system;
    context.flags = itemData.flags;

    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.isEditable) return;

    // Roll handlers, click handlers, etc. would go here.
    document.getElementById("derived-skills").onchange = function() {changeDerivedSkill()}

    var itemSkill = this;

    function changeDerivedSkill() {
      
      var derivedSkills = document.getElementById("derived-skills");
      if(derivedSkills.value == "melee") {
        itemSkill.object.system.skillUsed = "melee"
        console.log("changed to melee");
        console.log(itemSkill);
      }
      if(derivedSkills.value == "shooting") {
        itemSkill.object.system.skillUsed = "shooting"
        console.log("changed to shooting");
        console.log(itemSkill);
      }
      if(derivedSkills.value == "gunnery") {
        itemSkill.object.system.skillUsed = "gunnery"
        console.log("changed to gunnery");
        console.log(itemSkill);
      }
    }
    console.log(itemSkill);

  }

  
}
