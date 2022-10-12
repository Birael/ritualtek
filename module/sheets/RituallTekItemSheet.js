export default class RitualTekItemSheet extends ItemSheet {
    get template(){
        return `systems/ritualtek/templates/sheets/${this.item.type}-sheet.html`;
    }

    getData() {
        const data = super.getData();

        data.config = CONFIG.ritualtek;

        return data;
    }
}