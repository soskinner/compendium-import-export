import { MODULE_ID, registerSettings } from './settings.js';

console.log("Loading settings.js for Compendium Import/Export");

class SplashScreen extends Application {
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            id: "compendium-import-export",
            title: "Compendium Import/Export",
            template: "modules/compendium-import-export/templates/splash.html",
            width: 400,
            height: 300,
            resizable: false
        });
    }

    getData() {
        return {
            message: "You have the Compendium Import/ Export module!"
        };
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('.close-splash').click(() => {
            this.close();
        });
    }
}

Hooks.once('init', () => {
    registerSettings();
});

// Function to create a dialog for import/export
function createImportExportDialog() {
    let d = new Dialog({
        title: "Compendium Import/Export",
        content: "<p>Select an action for your compendium:</p>",
        buttons: {
            import: {
                icon: '<i class="fas fa-file-import"></i>',
                label: "Import",
                callback: () => importCompendium()
            },
            export: {
                icon: '<i class="fas fa-file-export"></i>',
                label: "Export",
                callback: () => exportCompendium()
            }
        },
        default: "import",
        close: () => console.log("Dialog closed.")
    });
    d.render(true);
}

// Function to handle importing compendium
function importCompendium() {
    new FilePicker({
        type: "open",
        current: `worlds/${game.world.id}/`,
        callback: async (path) => {
            const response = await fetch(path);
            const content = await response.json();
            const pack = game.packs.get("compendium-import-export.cosmere");
            for (let data of content) {
                await pack.createDocument(data);
            }
            ui.notifications.info("Compendium imported successfully!");
        },
        extensions: ['.json'],
    }).browse();
}

// Function to handle exporting compendium
function exportCompendium() {
    const pack = game.packs.get("compendium-import-export.cosmere");
    pack.getDocuments().then(content => {
        const exportData = content.map(entry => entry.data);
        const json = JSON.stringify(exportData, null, 2);
        new FilePicker({
            type: "save",
            callback: async (path) => {
                await FilePicker.upload("data", path, new Blob([json], {type : 'application/json'}));
                ui.notifications.info("Compendium exported successfully!");
            },
            extensions: ['.json'],
        }).browse(`worlds/${game.world.id}/`);
    });
}

// Add button in the settings menu to open the import/export dialog
Hooks.once("ready", async function() {
    game.settings.registerMenu("compendium-import-export", "importExportMenu", {
        name: "Open Import/Export Dialog",
        label: "Open",
        hint: "Open the import/export dialog for compendiums.",
        icon: "fas fa-archive",
        type: createImportExportDialog,
        restricted: true
    });
});
