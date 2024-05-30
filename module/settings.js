// settings.js
export const MODULE_ID = 'compendium-import-export';

export function registerSettings() {
    game.settings.registerMenu(MODULE_ID, 'importExport', {
        name: 'Compendium Actions',
        label: 'Import/Export',
        hint: 'Manage compendium import and export actions.',
        icon: 'fas fa-upload',
        type: ImportExportSettingsForm,
        restricted: true
    });

    // Regular settings can be registered here as well
    game.settings.register(MODULE_ID, 'enabled', {
        name: 'Enable Compendium Import/Export',
        hint: 'Toggle the compendium import/export functionality on or off.',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });
}

class ImportExportSettingsForm extends FormApplication {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            title: 'Compendium Import/Export Actions',
            id: 'import-export-settings',
            template: `modules/${MODULE_ID}/templates/import-export.html`,
            width: 500,
            height: "auto"
        });
    }

    getData() {
        // Data to send to the template
        return {
            isEnabled: game.settings.get(MODULE_ID, 'enabled')
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.import-btn').click(this._onImport.bind(this));
        html.find('.export-btn').click(this._onExport.bind(this));
    }

    async _onImport(event) {
        event.preventDefault();
        // Put your import logic here
        new FilePicker({
            type: "open",
            current: `worlds/${game.world.id}/`,
            callback: async (path) => {
                const response = await fetch(path);
                const content = await response.json();
                const pack = game.packs.get("compendium-import-export.cosmere-hs");
                for (let data of content) {
                    await pack.createDocument(data);
                }
                ui.notifications.info("Compendium imported successfully!");
            },
            extensions: ['.json'],
        }).browse();
    }

    

    async _onExport(event) {
        event.preventDefault();
        // Put your export logic here
        console.log("Exporting compendium...");
        const pack = game.packs.get("world.cosmere-hs");
        console.log("pack", pack);
        pack.getDocuments().then(content => {
        const exportData = content.map(entry => entry.data);
        const json = JSON.stringify(exportData, null, 2);

        const filename = `fvtt-compendium-export.json`;
        writeJSONToFile(filename, json);

        // new FilePicker({
        //     type: "save",
        //     callback: async (path) => {
        //         await FilePicker.upload("data", path, new Blob([json], {type : 'application/json'}));
        //         ui.notifications.info("Compendium exported successfully!");
        //     },
        //     extensions: ['.json'],
        // }).browse(`worlds/${game.world.id}/`);
        console.log("completed export");
    });
    }
}

function writeJSONToFile(filename, data) {
    saveDataToFile(data, "text/json", filename);
    console.log(`Saved to file ${filename}`);
}
