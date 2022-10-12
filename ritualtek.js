import { ritualtek } from "./module/config.js";
import RitualTekItemSheet from "./module/sheets/RituallTekItemSheet.js";

Hooks.once("init", function(){
    console.log("RitualTek | Initializing RitualTek System.");

    CONFIG.ritualtek = ritualtek;

    Items.unregisterSheet("core", ItemSheet)
    Items.registerSheet("ritualtek", RitualTekItemSheet, {makeDefault: true});
});