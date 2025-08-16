import { Model } from "./model.js";
import { View } from "./view.js";
class Controller {
    constructor() {
        this.model = new Model();
        this.view = new View();
    }
    async init() {
        await this.model.loadData();
        this.view.renderAppareils(this.model.getAppareils(), this.handleEdit.bind(this));
        const form = document.getElementById("form-ajout");
        form.addEventListener("submit", (e) => this.handleAdd(e));
        const formModif = document.getElementById("form-modif");
        formModif.addEventListener("submit", (e) => this.handleModifSave(e));
        const btnAnnuler = document.getElementById("modif-annuler");
        btnAnnuler.addEventListener("click", () => this.hideModifForm());
    }
    handleAdd(e) {
        e.preventDefault();
        const id = Date.now();
        const nom = document.getElementById("nom").value;
        const prix = parseInt(document.getElementById("prix").value);
        let resolution = document.getElementById("resolution").value;
        let iso = document.getElementById("iso").value;
        let poids = document.getElementById("poids").value;
        // Ajout automatique des unités
        if (resolution && !resolution.includes("MP"))
            resolution += " MP";
        if (iso && !iso.toUpperCase().includes("ISO"))
            iso = "ISO " + iso;
        if (poids && !poids.includes("g"))
            poids += " g";
        const nouvelAppareil = {
            id,
            nom,
            prix,
            caracteristiques: {
                "Résolution": resolution,
                "ISO max": iso,
                "Poids": poids
            }
        };
        this.model.addAppareil(nouvelAppareil);
        this.view.renderAppareils(this.model.getAppareils(), this.handleEdit.bind(this));
    }
    handleEdit(id) {
        const appareil = this.model.getAppareils().find(a => a.id === id);
        if (!appareil)
            return;
        // Affiche le formulaire de modification et pré-remplit les champs
        document.getElementById("modification").style.display = "block";
        document.getElementById("modif-id").value = appareil.id.toString();
        document.getElementById("modif-nom").value = appareil.nom;
        document.getElementById("modif-prix").value = appareil.prix.toString();
        document.getElementById("modif-resolution").value = appareil.caracteristiques["Résolution"] || "";
        document.getElementById("modif-iso").value = appareil.caracteristiques["ISO max"] || "";
        document.getElementById("modif-poids").value = appareil.caracteristiques["Poids"] || "";
    }
    handleModifSave(e) {
        e.preventDefault();
        const id = parseInt(document.getElementById("modif-id").value);
        const nom = document.getElementById("modif-nom").value;
        const prix = parseInt(document.getElementById("modif-prix").value);
        const resolution = document.getElementById("modif-resolution").value;
        const iso = document.getElementById("modif-iso").value;
        const poids = document.getElementById("modif-poids").value;
        const updated = {
            nom,
            prix,
            caracteristiques: {
                "Résolution": resolution,
                "ISO max": iso,
                "Poids": poids
            }
        };
        this.model.updateAppareil(id, updated);
        this.view.renderAppareils(this.model.getAppareils(), this.handleEdit.bind(this));
        this.hideModifForm();
    }
    hideModifForm() {
        document.getElementById("modification").style.display = "none";
    }
}
new Controller().init();
